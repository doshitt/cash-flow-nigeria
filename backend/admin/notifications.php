<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("
            SELECT 
                pn.*,
                at.first_name as created_by_name
            FROM push_notifications pn
            LEFT JOIN admin_team at ON pn.created_by = at.id
            ORDER BY pn.created_at DESC
        ");
        $notifications = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $notifications]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Insert notification
        $stmt = $pdo->prepare("
            INSERT INTO push_notifications 
            (title, message, target_type, target_users, status, scheduled_at, created_by)
            VALUES (:title, :message, :target_type, :target_users, :status, :scheduled_at, :created_by)
        ");
        
        $stmt->execute([
            'title' => $input['title'],
            'message' => $input['message'],
            'target_type' => $input['target_type'],
            'target_users' => json_encode($input['target_users'] ?? []),
            'status' => $input['status'] ?? 'draft',
            'scheduled_at' => $input['scheduled_at'] ?? null,
            'created_by' => 1 // Default admin ID for now
        ]);
        
        $notification_id = $pdo->lastInsertId();
        
        // If sending immediately, create user notifications
        if ($input['status'] === 'sent') {
            if ($input['target_type'] === 'all') {
                // Send to all users
                $users = $pdo->query("SELECT id FROM users WHERE status = 'active'")->fetchAll();
                foreach ($users as $user) {
                    $notifStmt = $pdo->prepare("
                        INSERT INTO user_notifications 
                        (user_id, title, message, type, is_read, created_at)
                        VALUES (:user_id, :title, :message, 'push', 0, NOW())
                    ");
                    $notifStmt->execute([
                        'user_id' => $user['id'],
                        'title' => $input['title'],
                        'message' => $input['message']
                    ]);
                }
            } elseif ($input['target_type'] === 'specific' && !empty($input['target_users'])) {
                // Send to specific users
                foreach ($input['target_users'] as $user_id) {
                    $notifStmt = $pdo->prepare("
                        INSERT INTO user_notifications 
                        (user_id, title, message, type, is_read, created_at)
                        VALUES (:user_id, :title, :message, 'push', 0, NOW())
                    ");
                    $notifStmt->execute([
                        'user_id' => $user_id,
                        'title' => $input['title'],
                        'message' => $input['message']
                    ]);
                }
            }
            
            // Update sent timestamp
            $pdo->prepare("UPDATE push_notifications SET sent_at = NOW() WHERE id = :id")
                ->execute(['id' => $notification_id]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Notification created successfully']);
        
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>