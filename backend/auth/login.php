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
    
    if (!isset($input['phone']) || !isset($input['pin'])) {
        throw new Exception('Phone and PIN are required');
    }
    
    $phone = $input['phone'];
    $pin = $input['pin'];
    $login_method = $input['login_method'] ?? 'phone_pin';
    $device_info = json_encode($input['device_info'] ?? []);
    $ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    // Find user by phone
    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ? AND is_active = 1");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Invalid phone number or PIN');
    }
    
    // Verify PIN
    if (!password_verify($pin, $user['pin'])) {
        // Log failed attempt
        $stmt = $pdo->prepare("INSERT INTO user_activities (user_id, activity_type, description, ip_address, user_agent) VALUES (?, 'login_failed', 'Failed login attempt', ?, ?)");
        $stmt->execute([$user['id'], $ip_address, $user_agent]);
        
        throw new Exception('Invalid phone number or PIN');
    }
    
    // Generate session token
    $session_token = bin2hex(random_bytes(32));
    
    // Create user session (30 days expiry)
    $stmt = $pdo->prepare("CALL CreateUserSession(?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $user['id'], 
        $session_token, 
        $device_info, 
        $ip_address, 
        $user_agent, 
        $login_method
    ]);
    
    // Update last login
    $stmt = $pdo->prepare("UPDATE users SET updated_at = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);
    
    // Log successful login
    $stmt = $pdo->prepare("INSERT INTO user_activities (user_id, activity_type, description, ip_address, user_agent) VALUES (?, 'login_success', 'Successful login via $login_method', ?, ?)");
    $stmt->execute([$user['id'], $ip_address, $user_agent]);
    
    // Get user wallets
    $stmt = $pdo->prepare("SELECT * FROM wallets WHERE user_id = ? AND is_active = 1");
    $stmt->execute([$user['id']]);
    $wallets = $stmt->fetchAll();
    
    // Remove sensitive data
    unset($user['password_hash']);
    unset($user['pin']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => $user,
        'wallets' => $wallets,
        'session_token' => $session_token
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>