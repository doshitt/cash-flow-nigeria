<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "tesapay";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id']) || !isset($input['settings'])) {
            throw new Exception('Missing required fields');
        }
        
        $user_id = $input['user_id'];
        $settings = $input['settings'];
        
        // Update or insert notification settings
        $stmt = $conn->prepare("
            INSERT INTO notification_settings (user_id, login_alert_email, transaction_alert_email, transaction_alert_sms, updated_at) 
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            login_alert_email = VALUES(login_alert_email),
            transaction_alert_email = VALUES(transaction_alert_email),
            transaction_alert_sms = VALUES(transaction_alert_sms),
            updated_at = NOW()
        ");
        
        $stmt->execute([
            $user_id,
            $settings['loginAlertEmail'] ? 1 : 0,
            $settings['transactionAlertEmail'] ? 1 : 0,
            $settings['transactionAlertSms'] ? 1 : 0
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Notification settings updated successfully'
        ]);
        
    } else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        
        if (!$user_id) {
            throw new Exception('User ID required');
        }
        
        $stmt = $conn->prepare("SELECT * FROM notification_settings WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$settings) {
            // Return default settings
            $settings = [
                'loginAlertEmail' => true,
                'transactionAlertEmail' => true,
                'transactionAlertSms' => true
            ];
        } else {
            $settings = [
                'loginAlertEmail' => (bool)$settings['login_alert_email'],
                'transactionAlertEmail' => (bool)$settings['transaction_alert_email'],
                'transactionAlertSms' => (bool)$settings['transaction_alert_sms']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>