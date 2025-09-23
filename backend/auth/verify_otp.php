<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['otp_code'])) {
        throw new Exception('User ID and OTP code are required');
    }
    
    $userId = $input['user_id'];
    $otpCode = $input['otp_code'];
    
    // Verify OTP
    $stmt = $pdo->prepare("
        SELECT * FROM otps 
        WHERE user_id = ? AND otp_code = ? AND otp_type = 'registration' 
        AND expires_at > NOW() AND is_used = 0
    ");
    $stmt->execute([$userId, $otpCode]);
    $otp = $stmt->fetch();
    
    if (!$otp) {
        throw new Exception('Invalid or expired OTP');
    }
    
    $pdo->beginTransaction();
    
    try {
        // Mark OTP as used
        $stmt = $pdo->prepare("UPDATE otps SET is_used = 1 WHERE id = ?");
        $stmt->execute([$otp['id']]);
        
        // Update user verification status
        $stmt = $pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = ?");
        $stmt->execute([$userId]);
        
        // Update user verification record
        $stmt = $pdo->prepare("UPDATE user_verification SET phone_verified = 1 WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        // Create Paystack customer
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        // TODO: Create actual Paystack customer using API
        $customerCode = 'CUS_' . strtoupper(uniqid());
        $customerId = mt_rand(100000, 999999);
        
        $stmt = $pdo->prepare("
            INSERT INTO paystack_customers (user_id, customer_code, customer_id, email) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $customerCode, $customerId, $user['email']]);
        
        // Create virtual account for user
        $accountNumber = '99' . sprintf('%08d', $userId);
        $stmt = $pdo->prepare("
            INSERT INTO virtual_accounts (
                user_id, account_name, account_number, bank_name, bank_code, 
                customer_code, currency, active
            ) VALUES (?, ?, ?, 'Wema Bank', '035', ?, 'NGN', 1)
        ");
        $stmt->execute([
            $userId, 
            $user['first_name'] . ' ' . $user['last_name'],
            $accountNumber,
            $customerCode
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Phone number verified successfully',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'phone' => $user['phone'],
                'is_verified' => true
            ]
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>