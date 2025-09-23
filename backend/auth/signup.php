<?php
require_once '../config/cors.php';
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['surname', 'firstName', 'gender', 'email', 'phone', 'password', 'pin'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    $surname = trim($input['surname']);
    $firstName = trim($input['firstName']);
    $gender = $input['gender'];
    $email = trim(strtolower($input['email']));
    $phone = trim($input['phone']);
    $password = $input['password'];
    $pin = $input['pin'];
    $referralCode = $input['referralCode'] ?? '';
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Validate PIN (must be 5 digits)
    if (!preg_match('/^\d{5}$/', $pin)) {
        throw new Exception('PIN must be exactly 5 digits');
    }
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
    $stmt->execute([$email, $phone]);
    if ($stmt->fetch()) {
        throw new Exception('User with this email or phone already exists');
    }
    
    // Generate unique referral code for this user
    do {
        $userReferralCode = strtoupper(substr($firstName, 0, 3) . rand(1000, 9999));
        $stmt = $pdo->prepare("SELECT id FROM users WHERE referral_code = ?");
        $stmt->execute([$userReferralCode]);
    } while ($stmt->fetch());
    
    // Hash password and PIN
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $pinHash = password_hash($pin, PASSWORD_DEFAULT);
    
    $pdo->beginTransaction();
    
    try {
        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO users (
                email, phone, password_hash, pin, first_name, last_name, 
                gender, referral_code, referred_by, is_verified, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
        ");
        $stmt->execute([
            $email, $phone, $passwordHash, $pinHash, $firstName, $surname,
            $gender, $userReferralCode, $referralCode
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Create default wallets for user
        $currencies = ['NGN', 'USD', 'GBP', 'EUR'];
        foreach ($currencies as $currency) {
            $stmt = $pdo->prepare("
                INSERT INTO wallets (user_id, currency, balance, wallet_type) 
                VALUES (?, ?, 0.00, 'main')
            ");
            $stmt->execute([$userId, $currency]);
        }
        
        // Create default notification settings
        $stmt = $pdo->prepare("
            INSERT INTO notification_settings (user_id, login_alert_email, transaction_alert_email, transaction_alert_sms) 
            VALUES (?, 1, 1, 1)
        ");
        $stmt->execute([$userId]);
        
        // Create transaction limits based on tier 1 KYC
        $stmt = $pdo->prepare("
            INSERT INTO transaction_limits (user_id, kyc_level, daily_transfer_limit, single_transaction_limit, monthly_limit) 
            VALUES (?, 'tier1', 50000.00, 10000.00, 200000.00)
        ");
        $stmt->execute([$userId]);
        
        // Create user verification record
        $stmt = $pdo->prepare("
            INSERT INTO user_verification (user_id, phone_verified, email_verified) 
            VALUES (?, 0, 0)
        ");
        $stmt->execute([$userId]);
        
        // Handle referral if provided
        if (!empty($referralCode)) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE referral_code = ?");
            $stmt->execute([$referralCode]);
            $referrer = $stmt->fetch();
            
            if ($referrer) {
                // Create referral record
                $stmt = $pdo->prepare("
                    INSERT INTO referrals (referrer_id, referred_id, referral_code, bonus_amount) 
                    VALUES (?, ?, ?, 1000.00)
                ");
                $stmt->execute([$referrer['id'], $userId, $referralCode]);
            }
        }
        
        // Generate OTP for phone verification
        $otp = sprintf('%06d', mt_rand(0, 999999));
        $otpExpiry = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        
        $stmt = $pdo->prepare("
            INSERT INTO otps (user_id, phone, otp_code, otp_type, expires_at) 
            VALUES (?, ?, ?, 'registration', ?)
        ");
        $stmt->execute([$userId, $phone, $otp, $otpExpiry]);
        
        // Create Paystack customer and dedicated virtual account
        try {
            $paystackCustomer = createPaystackCustomer($firstName, $surname, $email, $phone);
            if ($paystackCustomer['status']) {
                $customerCode = $paystackCustomer['data']['customer_code'];
                $customerId = $paystackCustomer['data']['id'];
                
                // Save Paystack customer
                $stmt = $pdo->prepare("
                    INSERT INTO paystack_customers (user_id, customer_code, customer_id, email) 
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([$userId, $customerCode, $customerId, $email]);
                
                // Create dedicated virtual account
                $virtualAccount = createDedicatedVirtualAccount($customerCode, $firstName, $surname, $phone);
                if ($virtualAccount['status']) {
                    $accountData = $virtualAccount['data'];
                    $stmt = $pdo->prepare("
                        INSERT INTO dedicated_accounts (
                            user_id, customer_code, account_name, account_number, 
                            bank_name, bank_code, currency, is_active
                        ) VALUES (?, ?, ?, ?, ?, ?, 'NGN', 1)
                    ");
                    $stmt->execute([
                        $userId, $customerCode, $accountData['account_name'],
                        $accountData['account_number'], $accountData['bank']['name'],
                        $accountData['bank']['slug']
                    ]);
                }
            }
        } catch (Exception $e) {
            // Continue with registration even if Paystack fails
            error_log("Paystack customer creation failed: " . $e->getMessage());
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully. Please verify your phone number.',
            'user_id' => $userId,
            'otp' => $otp, // Remove this in production
            'referral_code' => $userReferralCode
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

function createPaystackCustomer($firstName, $lastName, $email, $phone) {
    $paystackSecretKey = 'sk_live_128d95f72de1514878e1814d7f3b646095a56b62';
    
    $customerData = [
        'email' => $email,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'phone' => $phone
    ];
    
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.paystack.co/customer",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode($customerData),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . $paystackSecretKey,
            "Content-Type: application/json",
        ],
    ));
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    if ($err) {
        throw new Exception("cURL Error: " . $err);
    }
    
    return json_decode($response, true);
}

function createDedicatedVirtualAccount($customerCode, $firstName, $lastName, $phone) {
    $paystackSecretKey = 'sk_live_128d95f72de1514878e1814d7f3b646095a56b62';
    
    $accountData = [
        'customer' => $customerCode,
        'preferred_bank' => 'wema-bank',
        'first_name' => $firstName,
        'last_name' => $lastName,
        'phone' => $phone
    ];
    
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.paystack.co/dedicated_account",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode($accountData),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . $paystackSecretKey,
            "Content-Type: application/json",
        ],
    ));
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    if ($err) {
        throw new Exception("cURL Error: " . $err);
    }
    
    return json_decode($response, true);
}
?>