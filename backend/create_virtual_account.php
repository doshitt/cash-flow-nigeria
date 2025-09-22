<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration - update with your phpMyAdmin details
$servername = "localhost";
$username = "your_db_username";
$password = "your_db_password";
$dbname = "tesapay_db";

// Paystack configuration
$paystack_secret_key = getenv('PAYSTACK_SECRET_KEY') ?: "sk_test_49ae60bbf6d930670dcd16103e7bfdb6dd1573c7";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get user data from request
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $input['user_id'] ?? null;
    $email = $input['email'] ?? null;
    $first_name = $input['first_name'] ?? null;
    $last_name = $input['last_name'] ?? null;
    $phone = $input['phone'] ?? null;
    
    if (!$user_id || !$email || !$first_name || !$last_name) {
        throw new Exception('Missing required user data');
    }
    
    // Check if user already has a virtual account
    $stmt = $pdo->prepare("SELECT * FROM virtual_accounts WHERE user_id = ? AND active = 1");
    $stmt->execute([$user_id]);
    $existing_account = $stmt->fetch();
    
    if ($existing_account) {
        echo json_encode([
            'success' => true,
            'data' => [
                'account_name' => $existing_account['account_name'],
                'account_number' => $existing_account['account_number'],
                'bank_name' => $existing_account['bank_name'],
                'bank_code' => $existing_account['bank_code']
            ]
        ]);
        exit;
    }
    
    // Create customer on Paystack first
    $customer_data = [
        'email' => $email,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'phone' => $phone
    ];
    
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.paystack.co/customer",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode($customer_data),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . $paystack_secret_key,
            "Content-Type: application/json",
        ],
    ));
    
    $customer_response = curl_exec($curl);
    $customer_result = json_decode($customer_response, true);
    
    if (!$customer_result['status']) {
        throw new Exception('Failed to create customer: ' . $customer_result['message']);
    }
    
    $customer_code = $customer_result['data']['customer_code'];
    
    // Create dedicated virtual account
    $virtual_account_data = [
        'customer' => $customer_code
        // Optional: let Paystack assign the default supported test bank (e.g., Titan)
        // 'preferred_bank' => 'titan-trust-bank'
    ];
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.paystack.co/dedicated_account",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => json_encode($virtual_account_data),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer " . $paystack_secret_key,
            "Content-Type: application/json",
        ],
    ));
    
    $account_response = curl_exec($curl);
    $account_result = json_decode($account_response, true);
    curl_close($curl);
    
    if (!$account_result['status']) {
        throw new Exception('Failed to create virtual account: ' . $account_result['message']);
    }
    
    $account_data = $account_result['data'];
    
    // Save virtual account to database
    $stmt = $pdo->prepare("
        INSERT INTO virtual_accounts 
        (user_id, account_name, account_number, bank_name, bank_code, customer_id, customer_code, paystack_account_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $user_id,
        $account_data['account_name'],
        $account_data['account_number'],
        $account_data['bank']['name'],
        $account_data['bank']['slug'],
        $account_data['customer']['id'],
        $customer_code,
        $account_data['id']
    ]);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'account_name' => $account_data['account_name'],
            'account_number' => $account_data['account_number'],
            'bank_name' => $account_data['bank']['name'],
            'bank_code' => $account_data['bank']['slug']
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>