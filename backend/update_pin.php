<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Use shared database config
require_once 'config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['new_pin'])) {
        throw new Exception('Missing required fields');
    }
    
    $user_id = $input['user_id'];
    $new_pin = $input['new_pin'];
    
    // Validate PIN format
    if (strlen($new_pin) !== 5 || !ctype_digit($new_pin)) {
        throw new Exception('PIN must be exactly 5 digits');
    }
    
    // Hash the new PIN
    $pin_hash = password_hash($new_pin, PASSWORD_DEFAULT);
    
    // Update PIN
    $stmt = $pdo->prepare("UPDATE users SET pin = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$pin_hash, $user_id]);
    
    // Log PIN change
    $stmt = $pdo->prepare("INSERT INTO user_activities (user_id, activity_type, description, created_at) VALUES (?, 'pin_change', 'Account PIN changed successfully', NOW())");
    $stmt->execute([$user_id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'PIN updated successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>