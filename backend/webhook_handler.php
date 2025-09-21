<?php
header('Content-Type: application/json');

// Database configuration
$servername = "localhost";
$username = "your_db_username";
$password = "your_db_password";
$dbname = "tesapay_db";

// Paystack webhook secret
$paystack_webhook_secret = "your_paystack_webhook_secret";

try {
    // Verify webhook signature
    $input = file_get_contents('php://input');
    $signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
    
    if (!hash_equals($signature, hash_hmac('sha512', $input, $paystack_webhook_secret))) {
        http_response_code(400);
        exit('Invalid signature');
    }
    
    $event = json_decode($input, true);
    
    if ($event['event'] === 'dedicatedaccount.credit') {
        $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $data = $event['data'];
        $account_number = $data['dedicated_account']['account_number'];
        $amount = $data['amount'] / 100; // Paystack amounts are in kobo
        $reference = $data['reference'];
        
        // Find user by virtual account
        $stmt = $pdo->prepare("SELECT user_id FROM virtual_accounts WHERE account_number = ?");
        $stmt->execute([$account_number]);
        $account = $stmt->fetch();
        
        if ($account) {
            $user_id = $account['user_id'];
            
            // Update user wallet balance
            $stmt = $pdo->prepare("
                UPDATE wallets 
                SET balance = balance + ? 
                WHERE user_id = ? AND currency = 'NGN'
            ");
            $stmt->execute([$amount, $user_id]);
            
            // Record transaction
            $stmt = $pdo->prepare("
                INSERT INTO transactions 
                (transaction_id, user_id, transaction_type, amount, currency, status, reference, description) 
                VALUES (?, ?, 'deposit', ?, 'NGN', 'completed', ?, 'Bank transfer deposit')
            ");
            $stmt->execute([
                uniqid('TXN_'),
                $user_id,
                $amount,
                $reference
            ]);
        }
    }
    
    http_response_code(200);
    echo json_encode(['status' => 'success']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>