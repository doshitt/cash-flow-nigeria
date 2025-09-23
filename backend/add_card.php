<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tesapay";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['card_number']) || !isset($input['expiry']) || !isset($input['cvv']) || !isset($input['pin'])) {
        throw new Exception('Missing required fields');
    }
    
    $user_id = $input['user_id'];
    $card_number = $input['card_number'];
    $expiry = $input['expiry'];
    $cvv = $input['cvv'];
    $pin = $input['pin'];
    
    // Validate card number (basic validation)
    if (strlen(str_replace(' ', '', $card_number)) < 13 || strlen(str_replace(' ', '', $card_number)) > 19) {
        throw new Exception('Invalid card number');
    }
    
    // Validate expiry format (MM/YYYY)
    if (!preg_match('/^\d{2}\/\d{4}$/', $expiry)) {
        throw new Exception('Invalid expiry format. Use MM/YYYY');
    }
    
    // Validate CVV
    if (strlen($cvv) < 3 || strlen($cvv) > 4 || !ctype_digit($cvv)) {
        throw new Exception('Invalid CVV');
    }
    
    // Validate PIN
    if (strlen($pin) !== 4 || !ctype_digit($pin)) {
        throw new Exception('PIN must be exactly 4 digits');
    }
    
    // Encrypt sensitive data
    $card_number_encrypted = openssl_encrypt($card_number, 'AES-256-CBC', 'tesapay_secret_key_2024', 0, str_repeat('0', 16));
    $cvv_encrypted = openssl_encrypt($cvv, 'AES-256-CBC', 'tesapay_secret_key_2024', 0, str_repeat('0', 16));
    $pin_encrypted = openssl_encrypt($pin, 'AES-256-CBC', 'tesapay_secret_key_2024', 0, str_repeat('0', 16));
    
    // Get last 4 digits for display
    $last_four = substr(str_replace(' ', '', $card_number), -4);
    
    // Insert card
    $stmt = $conn->prepare("
        INSERT INTO user_cards (user_id, card_number_encrypted, last_four_digits, expiry_date, cvv_encrypted, pin_encrypted, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $user_id,
        $card_number_encrypted,
        $last_four,
        $expiry,
        $cvv_encrypted,
        $pin_encrypted
    ]);
    
    // Log card addition
    $stmt = $conn->prepare("INSERT INTO user_activities (user_id, activity_type, description, created_at) VALUES (?, 'card_added', 'Debit card ending in {$last_four} added successfully', NOW())");
    $stmt->execute([$user_id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Card added successfully',
        'card_id' => $conn->lastInsertId()
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>