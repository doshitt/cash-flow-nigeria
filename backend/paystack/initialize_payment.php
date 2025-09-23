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
    
    if (!isset($input['user_id']) || !isset($input['amount']) || !isset($input['currency'])) {
        throw new Exception('User ID, amount, and currency are required');
    }
    
    $userId = $input['user_id'];
    $amount = floatval($input['amount']);
    $currency = $input['currency'];
    $paymentMethod = $input['payment_method'] ?? 'card';
    
    // Get user details
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND is_active = 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Get or create Paystack customer
    $stmt = $pdo->prepare("SELECT * FROM paystack_customers WHERE user_id = ?");
    $stmt->execute([$userId]);
    $paystackCustomer = $stmt->fetch();
    
    if (!$paystackCustomer) {
        // Create Paystack customer via API
        $customerData = [
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'phone' => $user['phone']
        ];
        
        $customerResponse = createPaystackCustomer($customerData);
        
        if ($customerResponse['status']) {
            $customerCode = $customerResponse['data']['customer_code'];
            $customerId = $customerResponse['data']['id'];
            
            // Save customer to database
            $stmt = $pdo->prepare("
                INSERT INTO paystack_customers (user_id, customer_code, customer_id, email) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$userId, $customerCode, $customerId, $user['email']]);
        } else {
            throw new Exception('Failed to create Paystack customer: ' . $customerResponse['message']);
        }
    } else {
        $customerCode = $paystackCustomer['customer_code'];
    }
    
    // Convert amount to kobo (Paystack uses kobo for NGN)
    $amountInKobo = $amount * 100;
    
    // Generate reference
    $reference = 'TXN_' . $userId . '_' . time() . '_' . rand(1000, 9999);
    
    // Initialize payment with Paystack
    $paymentData = [
        'email' => $user['email'],
        'amount' => $amountInKobo,
        'currency' => $currency,
        'reference' => $reference,
        'customer' => $customerCode,
        'callback_url' => 'https://your-domain.com/payment/callback',
        'metadata' => [
            'user_id' => $userId,
            'payment_type' => 'wallet_funding',
            'original_amount' => $amount
        ]
    ];
    
    $paymentResponse = initializePaystackPayment($paymentData);
    
    if ($paymentResponse['status']) {
        // Save transaction record
        $stmt = $pdo->prepare("
            INSERT INTO transactions (
                transaction_id, user_id, transaction_type, amount, currency, 
                status, reference, description
            ) VALUES (?, ?, 'deposit', ?, ?, 'pending', ?, ?)
        ");
        $stmt->execute([
            $reference,
            $userId,
            $amount,
            $currency,
            $reference,
            "Wallet funding via $paymentMethod"
        ]);
        
        $transactionId = $pdo->lastInsertId();
        
        // Save Paystack transaction record
        $stmt = $pdo->prepare("
            INSERT INTO paystack_transactions (
                user_id, transaction_id, paystack_reference, amount, currency, 
                status, customer_code
            ) VALUES (?, ?, ?, ?, ?, 'pending', ?)
        ");
        $stmt->execute([
            $userId,
            $transactionId,
            $reference,
            $amount,
            $currency,
            $customerCode
        ]);
        
        echo json_encode([
            'success' => true,
            'data' => [
                'authorization_url' => $paymentResponse['data']['authorization_url'],
                'access_code' => $paymentResponse['data']['access_code'],
                'reference' => $reference
            ]
        ]);
    } else {
        throw new Exception('Failed to initialize payment: ' . $paymentResponse['message']);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function createPaystackCustomer($customerData) {
    $paystackSecretKey = 'sk_live_128d95f72de1514878e1814d7f3b646095a56b62'; // Your live secret key
    
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

function initializePaystackPayment($paymentData) {
    $paystackSecretKey = 'sk_live_128d95f72de1514878e1814d7f3b646095a56b62'; // Your live secret key
    
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.paystack.co/transaction/initialize",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode($paymentData),
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