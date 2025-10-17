<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("
            SELECT * FROM banner_ads 
            ORDER BY created_at DESC
        ");
        $ads = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $ads]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO banner_ads (title, image_url, link_url, position, status, display_type, start_date, end_date)
            VALUES (:title, :image_url, :link_url, :position, :status, :display_type, :start_date, :end_date)
        ");
        
        $stmt->execute([
            'title' => $input['title'],
            'image_url' => $input['image_url'],
            'link_url' => $input['link_url'] ?? null,
            'position' => $input['position'],
            'status' => $input['status'],
            'display_type' => $input['display_type'] ?? 'inline',
            'start_date' => $input['start_date'] ?? null,
            'end_date' => $input['end_date'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Banner ad created successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE banner_ads 
            SET title = :title, image_url = :image_url, link_url = :link_url, 
                position = :position, status = :status, display_type = :display_type,
                start_date = :start_date, end_date = :end_date
            WHERE id = :id
        ");
        
        $stmt->execute([
            'title' => $input['title'],
            'image_url' => $input['image_url'],
            'link_url' => $input['link_url'],
            'position' => $input['position'],
            'status' => $input['status'],
            'display_type' => $input['display_type'] ?? 'inline',
            'start_date' => $input['start_date'],
            'end_date' => $input['end_date'],
            'id' => $input['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Banner ad updated successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'];
        
        $stmt = $pdo->prepare("UPDATE banner_ads SET status = 'inactive' WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['success' => true, 'message' => 'Banner ad deactivated successfully']);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>