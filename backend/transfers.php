<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
        // Process transfer
        $user_id = $input['user_id'];
        $transfer_type = $input['transfer_type'];
        $amount = $input['amount'];
        $currency = $input['currency'];
        $recipient_info = $input['recipient_info'];
        $description = $input['description'] ?? '';
        $transaction_pin = $input['transaction_pin'];
        
        // Validate transaction PIN
        if (!$transaction_pin || strlen($transaction_pin) !== 5) {
            echo json_encode(['success' => false, 'message' => 'Invalid transaction PIN']);
            exit;
        }
        
        // Verify PIN against database
        $stmt = $pdo->prepare("SELECT pin FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user || !$user['pin']) {
            echo json_encode(['success' => false, 'message' => 'Transaction PIN not set']);
            exit;
        }
        
        if (!password_verify($transaction_pin, $user['pin'])) {
            echo json_encode(['success' => false, 'message' => 'Wrong transaction PIN. Try again.']);
            exit;
        }
        
        // Check if user has sufficient balance
        $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
        $stmt->execute([$user_id, $currency]);
        $wallet = $stmt->fetch();
        
        if (!$wallet || $wallet['balance'] < $amount) {
            echo json_encode(['success' => false, 'message' => 'Insufficient balance']);
            exit;
        }
        
        // For crypto and MOMO, create payment request with "processing" status
        if ($transfer_type === 'crypto' || $transfer_type === 'momo') {
            // Start transaction
            $pdo->beginTransaction();
            
            try {
                // Deduct from sender's wallet immediately
                $stmt = $pdo->prepare("UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?");
                $stmt->execute([$amount, $user_id, $currency]);
                
                // Generate transaction ID
                $transaction_id = 'TXN_' . uniqid();
                
                // Create payment request
                $stmt = $pdo->prepare("
                    INSERT INTO payment_requests 
                    (transaction_id, user_id, transfer_type, amount, currency, recipient_info, description, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
                ");
                $stmt->execute([
                    $transaction_id,
                    $user_id,
                    $transfer_type,
                    $recipient_info['sendAmount'] ?? $amount,
                    $currency,
                    json_encode($recipient_info),
                    $description
                ]);
                
                // Record the transaction with "processing" status
                $stmt = $pdo->prepare("
                    INSERT INTO transactions 
                    (transaction_id, user_id, transaction_type, amount, currency, status, description, recipient_info) 
                    VALUES (?, ?, 'transfer', ?, ?, 'processing', ?, ?)
                ");
                $stmt->execute([
                    $transaction_id,
                    $user_id,
                    $recipient_info['sendAmount'] ?? $amount,
                    $currency,
                    $description,
                    json_encode($recipient_info)
                ]);
                
                // Record platform fee separately
                if (isset($recipient_info['platformFee']) && $recipient_info['platformFee'] > 0) {
                    $fee_transaction_id = 'FEE_' . uniqid();
                    $fee_desc = $transfer_type === 'crypto' ? 'Crypto Processing Fee' : 'MOMO Processing Fee';
                    $stmt = $pdo->prepare("
                        INSERT INTO transactions 
                        (transaction_id, user_id, transaction_type, amount, currency, status, description) 
                        VALUES (?, ?, 'fee', ?, ?, 'processing', ?)
                    ");
                    $stmt->execute([
                        $fee_transaction_id,
                        $user_id,
                        $recipient_info['platformFee'],
                        $currency,
                        $fee_desc
                    ]);
                }
                
                // Record blockchain fee if crypto
                if ($transfer_type === 'crypto' && isset($recipient_info['blockchainFee']) && $recipient_info['blockchainFee'] > 0) {
                    $blockchain_fee_id = 'BFEE_' . uniqid();
                    $stmt = $pdo->prepare("
                        INSERT INTO transactions 
                        (transaction_id, user_id, transaction_type, amount, currency, status, description) 
                        VALUES (?, ?, 'fee', ?, ?, 'processing', 'Blockchain Fee')
                    ");
                    $stmt->execute([
                        $blockchain_fee_id,
                        $user_id,
                        $recipient_info['blockchainFee'],
                        $currency
                    ]);
                }
                
                $pdo->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Payment request submitted successfully. Awaiting admin approval.',
                    'transaction_id' => $transaction_id,
                    'status' => 'processing'
                ]);
                exit;
                
            } catch (Exception $e) {
                $pdo->rollback();
                echo json_encode(['success' => false, 'message' => 'Transfer failed: ' . $e->getMessage()]);
                exit;
            }
        }
        
        // For other transfer types (Tesapay, Nigeria, International banks)
        // Calculate transfer fee (1% for Tesapay, 2% for Nigeria banks, 3% for international)
        $fee_rate = 0.01; // Default 1%
        switch ($transfer_type) {
            case 'tesapay':
                $fee_rate = 0.01; // 1%
                break;
            case 'nigeria':
                $fee_rate = 0.02; // 2%
                break;
            case 'international':
                $fee_rate = 0.03; // 3%
                break;
        }
        
        $transfer_fee = $amount * $fee_rate;
        $total_deduction = $amount + $transfer_fee;
        
        if ($wallet['balance'] < $total_deduction) {
            echo json_encode(['success' => false, 'message' => 'Insufficient balance to cover transfer fee']);
            exit;
        }
        
        // Start transaction
        $pdo->beginTransaction();
        
        try {
            // Deduct from sender's wallet
            $stmt = $pdo->prepare("UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?");
            $stmt->execute([$total_deduction, $user_id, $currency]);
            
            // Generate transaction ID
            $transaction_id = 'TXN_' . uniqid();
            
            // Record the transfer transaction
            $stmt = $pdo->prepare("
                INSERT INTO transactions 
                (transaction_id, user_id, transaction_type, amount, currency, status, description, fee_amount, recipient_info) 
                VALUES (?, ?, 'transfer', ?, ?, 'completed', ?, ?, ?)
            ");
            $stmt->execute([
                $transaction_id,
                $user_id,
                $amount,
                $currency,
                $description,
                $transfer_fee,
                json_encode($recipient_info)
            ]);
            
            // For Tesapay transfers, credit the recipient's wallet
            if ($transfer_type === 'tesapay') {
                $recipient_username = $recipient_info['username'];
                
                // Find recipient user by username (assuming email is used as username)
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR first_name = ?");
                $stmt->execute([$recipient_username, $recipient_username]);
                $recipient = $stmt->fetch();
                
                if ($recipient) {
                    // Credit recipient's wallet
                    $stmt = $pdo->prepare("
                        INSERT INTO wallets (user_id, currency, balance) 
                        VALUES (?, ?, ?) 
                        ON DUPLICATE KEY UPDATE balance = balance + ?
                    ");
                    $stmt->execute([$recipient['id'], $currency, $amount, $amount]);
                    
                    // Record incoming transaction for recipient
                    $stmt = $pdo->prepare("
                        INSERT INTO transactions 
                        (transaction_id, user_id, transaction_type, amount, currency, status, description) 
                        VALUES (?, ?, 'transfer_received', ?, ?, 'completed', ?)
                    ");
                    $stmt->execute([
                        $transaction_id . '_IN',
                        $recipient['id'],
                        $amount,
                        $currency,
                        'Transfer from user ID: ' . $user_id
                    ]);
                }
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Transfer completed successfully',
                'transaction_id' => $transaction_id,
                'fee_amount' => $transfer_fee
            ]);
            
        } catch (Exception $e) {
            $pdo->rollback();
            echo json_encode(['success' => false, 'message' => 'Transfer failed: ' . $e->getMessage()]);
        }
        
    } elseif ($method === 'GET') {
        // Get transfer history
        $user_id = $_GET['user_id'] ?? null;
        
        if (!$user_id) {
            echo json_encode(['success' => false, 'message' => 'User ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT * FROM transactions 
            WHERE user_id = ? AND transaction_type IN ('transfer', 'transfer_received') 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmt->execute([$user_id]);
        $transfers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $transfers]);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>