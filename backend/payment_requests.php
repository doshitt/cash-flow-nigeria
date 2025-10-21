<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($method === 'POST') {
        // Create new payment request (MOMO or Crypto)
        $user_id = $input['user_id'];
        $transfer_type = $input['transfer_type']; // 'momo' or 'crypto'
        $amount = $input['amount'];
        $currency = $input['currency'];
        $recipient_info = json_encode($input['recipient_info']);
        $description = $input['description'] ?? '';
        
        // Validate user has sufficient balance
        $stmt = $pdo->prepare("
            SELECT balance FROM wallets 
            WHERE user_id = ? AND currency = ? AND is_active = 1
        ");
        $stmt->execute([$user_id, $currency]);
        $wallet = $stmt->fetch();
        
        if (!$wallet || $wallet['balance'] < $amount) {
            echo json_encode([
                'success' => false,
                'message' => "Insufficient funds in your $currency wallet. Please fund or convert before proceeding."
            ]);
            exit;
        }
        
        $pdo->beginTransaction();
        
        // Deduct funds from wallet
        $stmt = $pdo->prepare("
            UPDATE wallets 
            SET balance = balance - ?, updated_at = NOW()
            WHERE user_id = ? AND currency = ?
        ");
        $stmt->execute([$amount, $user_id, $currency]);
        
        // Create payment request
        $transaction_id = 'PR_' . time() . rand(1000, 9999);
        $stmt = $pdo->prepare("
            INSERT INTO payment_requests 
            (transaction_id, user_id, transfer_type, amount, currency, recipient_info, description, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        $stmt->execute([
            $transaction_id,
            $user_id,
            $transfer_type,
            $amount,
            $currency,
            $recipient_info,
            $description
        ]);
        
        $request_id = $pdo->lastInsertId();
        
        // Record transaction as pending
        $stmt = $pdo->prepare("
            INSERT INTO transactions 
            (transaction_id, user_id, transaction_type, amount, currency, status, description, created_at) 
            VALUES (?, ?, 'transfer_out', ?, ?, 'pending', ?, NOW())
        ");
        $stmt->execute([
            $transaction_id,
            $user_id,
            $amount,
            $currency,
            $description
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment request submitted successfully. Awaiting admin approval.',
            'request_id' => $request_id,
            'transaction_id' => $transaction_id
        ]);
        
    } elseif ($method === 'GET') {
        // Get payment requests for admin panel
        $user_id = $_GET['user_id'] ?? null;
        
        if ($user_id) {
            // Get requests for specific user
            $stmt = $pdo->prepare("
                SELECT pr.*, u.first_name, u.last_name, u.email 
                FROM payment_requests pr 
                JOIN users u ON pr.user_id = u.id 
                WHERE pr.user_id = ?
                ORDER BY pr.created_at DESC
            ");
            $stmt->execute([$user_id]);
        } else {
            // Get all requests for admin
            $stmt = $pdo->prepare("
                SELECT pr.*, u.first_name, u.last_name, u.email 
                FROM payment_requests pr 
                JOIN users u ON pr.user_id = u.id 
                ORDER BY pr.created_at DESC
            ");
            $stmt->execute();
        }
        
        $requests = $stmt->fetchAll();
        
        // Decode recipient_info JSON for each request
        foreach ($requests as &$request) {
            $request['recipient_info'] = json_decode($request['recipient_info'], true);
        }
        
        echo json_encode(['success' => true, 'data' => $requests]);
        
    } elseif ($method === 'PUT') {
        // Update payment request status (admin action)
        $request_id = $input['request_id'];
        $status = $input['status']; // 'approved' or 'rejected'
        $admin_notes = $input['admin_notes'] ?? '';
        
        $pdo->beginTransaction();
        
        // Get request details
        $stmt = $pdo->prepare("SELECT * FROM payment_requests WHERE id = ?");
        $stmt->execute([$request_id]);
        $request = $stmt->fetch();
        
        if (!$request) {
            echo json_encode(['success' => false, 'message' => 'Request not found']);
            exit;
        }
        
        // Update request status
        $stmt = $pdo->prepare("
            UPDATE payment_requests 
            SET status = ?, admin_notes = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$status, $admin_notes, $request_id]);
        
        // Update transaction status
        $stmt = $pdo->prepare("
            UPDATE transactions 
            SET status = ?
            WHERE transaction_id = ?
        ");
        $stmt->execute([$status === 'approved' ? 'completed' : 'failed', $request['transaction_id']]);
        
        // If rejected, refund the user
        if ($status === 'rejected') {
            $stmt = $pdo->prepare("
                UPDATE wallets 
                SET balance = balance + ?, updated_at = NOW()
                WHERE user_id = ? AND currency = ?
            ");
            $stmt->execute([$request['amount'], $request['user_id'], $request['currency']]);
            
            // Record refund transaction
            $stmt = $pdo->prepare("
                INSERT INTO transactions 
                (transaction_id, user_id, transaction_type, amount, currency, status, description, created_at) 
                VALUES (?, ?, 'refund', ?, ?, 'completed', ?, NOW())
            ");
            $stmt->execute([
                'REF_' . time() . rand(1000, 9999),
                $request['user_id'],
                $request['amount'],
                $request['currency'],
                'Refund: ' . $request['description'] . ' - Reason: ' . $admin_notes
            ]);
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => "Payment request $status successfully"
        ]);
    }
    
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>