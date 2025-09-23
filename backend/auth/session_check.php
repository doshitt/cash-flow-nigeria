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
    
    if (!isset($input['session_token'])) {
        throw new Exception('Session token is required');
    }
    
    $sessionToken = $input['session_token'];
    
    // Check session validity
    $stmt = $pdo->prepare("
        SELECT s.*, u.* FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > NOW()
    ");
    $stmt->execute([$sessionToken]);
    $session = $stmt->fetch();
    
    if (!$session) {
        throw new Exception('Invalid or expired session');
    }
    
    // Check for inactivity (7 days)
    $lastActivity = new DateTime($session['last_activity']);
    $now = new DateTime();
    $inactiveDays = $now->diff($lastActivity)->days;
    
    if ($inactiveDays >= 7) {
        // Mark session as inactive
        $stmt = $pdo->prepare("UPDATE user_sessions SET is_active = 0 WHERE session_token = ?");
        $stmt->execute([$sessionToken]);
        
        throw new Exception('Session expired due to inactivity');
    }
    
    // Update last activity
    $stmt = $pdo->prepare("UPDATE user_sessions SET last_activity = NOW() WHERE session_token = ?");
    $stmt->execute([$sessionToken]);
    
    // Get user wallets
    $stmt = $pdo->prepare("SELECT * FROM wallets WHERE user_id = ? AND is_active = 1");
    $stmt->execute([$session['user_id']]);
    $wallets = $stmt->fetchAll();
    
    // Get user verification status
    $stmt = $pdo->prepare("SELECT * FROM user_verification WHERE user_id = ?");
    $stmt->execute([$session['user_id']]);
    $verification = $stmt->fetch();
    
    // Remove sensitive data
    unset($session['password_hash']);
    unset($session['pin']);
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $session['user_id'],
            'email' => $session['email'],
            'first_name' => $session['first_name'],
            'last_name' => $session['last_name'],
            'phone' => $session['phone'],
            'is_verified' => $session['is_verified'],
            'kyc_level' => $session['kyc_level'],
            'referral_code' => $session['referral_code']
        ],
        'wallets' => $wallets,
        'verification' => $verification,
        'session_valid' => true
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'session_valid' => false
    ]);
}
?>