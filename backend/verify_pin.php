<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['pin'])) {
        throw new Exception('Missing required fields');
    }
    
    $user_id = $input['user_id'];
    $pin = $input['pin'];
    
    // Get user's PIN
    $stmt = $pdo->prepare("SELECT pin FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    if (!$user['pin']) {
        throw new Exception('No PIN set for this user');
    }
    
    // Verify PIN
    if (!password_verify($pin, $user['pin'])) {
        throw new Exception('Incorrect PIN');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'PIN verified successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>