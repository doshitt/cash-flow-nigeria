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
            SELECT 
                c.*,
                COUNT(cu.id) as usage_count
            FROM coupons c
            LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        ");
        $coupons = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $coupons]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO coupons (code, type, value, min_amount, max_uses, expires_at, status)
            VALUES (:code, :type, :value, :min_amount, :max_uses, :expires_at, 'active')
        ");
        
        $stmt->execute([
            'code' => $input['code'],
            'type' => $input['type'], // 'percentage' or 'fixed'
            'value' => $input['value'],
            'min_amount' => $input['min_amount'] ?? 0,
            'max_uses' => $input['max_uses'] ?? null,
            'expires_at' => $input['expires_at'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Coupon created successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE coupons 
            SET code = :code, type = :type, value = :value, min_amount = :min_amount, 
                max_uses = :max_uses, expires_at = :expires_at, status = :status
            WHERE id = :id
        ");
        
        $stmt->execute([
            'code' => $input['code'],
            'type' => $input['type'],
            'value' => $input['value'],
            'min_amount' => $input['min_amount'],
            'max_uses' => $input['max_uses'],
            'expires_at' => $input['expires_at'],
            'status' => $input['status'],
            'id' => $input['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Coupon updated successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'];
        
        $stmt = $pdo->prepare("UPDATE coupons SET status = 'inactive' WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['success' => true, 'message' => 'Coupon deactivated successfully']);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>