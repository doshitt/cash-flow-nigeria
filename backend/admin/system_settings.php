<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $key = $_GET['key'] ?? null;
        
        if ($key) {
            $stmt = $pdo->prepare("SELECT * FROM system_settings WHERE setting_key = :key");
            $stmt->execute(['key' => $key]);
            $setting = $stmt->fetch();
            
            echo json_encode(['success' => true, 'data' => $setting]);
        } else {
            $stmt = $pdo->query("SELECT * FROM system_settings ORDER BY setting_key");
            $settings = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $settings]);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO system_settings (setting_key, setting_value, description)
            VALUES (:key, :value, :description)
            ON DUPLICATE KEY UPDATE 
            setting_value = :value, updated_at = NOW()
        ");
        
        $stmt->execute([
            'key' => $input['setting_key'],
            'value' => $input['setting_value'],
            'description' => $input['description'] ?? ''
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Setting updated successfully']);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
