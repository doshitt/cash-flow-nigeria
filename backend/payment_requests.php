<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
$servername = "localhost";
$username = "your_db_username";
$password = "your_db_password";
$dbname = "tesapay_db";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($method === 'POST') {
        // Create new payment request (for crypto payments)
        $user_id = $input['user_id'];
        $payment_method = $input['payment_method'];
        $amount = $input['amount'];
        $currency = $input['currency'];
        $crypto_type = $input['crypto_type'] ?? null;
        $crypto_network = $input['crypto_network'] ?? null;
        $transaction_hash = $input['transaction_hash'] ?? null;
        $wallet_address = $input['wallet_address'] ?? null;
        
        $stmt = $pdo->prepare("
            INSERT INTO payment_requests 
            (user_id, payment_method, amount, currency, crypto_type, crypto_network, transaction_hash, wallet_address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $user_id, $payment_method, $amount, $currency, 
            $crypto_type, $crypto_network, $transaction_hash, $wallet_address
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment request submitted successfully',
            'request_id' => $pdo->lastInsertId()
        ]);
        
    } elseif ($method === 'GET') {
        // Get payment requests for admin panel
        $stmt = $pdo->prepare("
            SELECT pr.*, u.first_name, u.last_name, u.email 
            FROM payment_requests pr 
            JOIN users u ON pr.user_id = u.id 
            ORDER BY pr.created_at DESC
        ");
        $stmt->execute();
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $requests]);
        
    } elseif ($method === 'PUT') {
        // Update payment request status (admin action)
        $request_id = $input['request_id'];
        $status = $input['status']; // 'approved' or 'rejected'
        $admin_notes = $input['admin_notes'] ?? '';
        
        $stmt = $pdo->prepare("
            UPDATE payment_requests 
            SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        $stmt->execute([$status, $admin_notes, $request_id]);
        
        // If approved, update user wallet
        if ($status === 'approved') {
            $stmt = $pdo->prepare("SELECT * FROM payment_requests WHERE id = ?");
            $stmt->execute([$request_id]);
            $request = $stmt->fetch();
            
            if ($request) {
                // Update wallet balance
                $stmt = $pdo->prepare("
                    UPDATE wallets 
                    SET balance = balance + ? 
                    WHERE user_id = ? AND currency = ?
                ");
                $stmt->execute([$request['amount'], $request['user_id'], $request['currency']]);
                
                // Record transaction
                $stmt = $pdo->prepare("
                    INSERT INTO transactions 
                    (transaction_id, user_id, transaction_type, amount, currency, status, description) 
                    VALUES (?, ?, 'deposit', ?, ?, 'completed', ?)
                ");
                $stmt->execute([
                    uniqid('TXN_'),
                    $request['user_id'],
                    $request['amount'],
                    $request['currency'],
                    ucfirst($request['payment_method']) . ' deposit - ' . $request['crypto_type']
                ]);
            }
        }
        
        echo json_encode(['success' => true, 'message' => 'Payment request updated']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>