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
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 20;
        $status = $_GET['status'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        $whereClause = "WHERE 1=1";
        $params = [];
        
        if ($status) {
            $whereClause .= " AND d.status = :status";
            $params['status'] = $status;
        }
        
        $stmt = $pdo->prepare("
            SELECT 
                d.*,
                u.first_name,
                u.last_name,
                u.email,
                t.amount,
                t.type as transaction_type
            FROM disputes d
            JOIN users u ON d.user_id = u.id
            JOIN transactions t ON d.transaction_id = t.id
            $whereClause
            ORDER BY d.created_at DESC
            LIMIT :limit OFFSET :offset
        ");
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue('limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', (int)$offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $disputes = $stmt->fetchAll();
        
        $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM disputes d $whereClause");
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];
        
        echo json_encode([
            'success' => true,
            'data' => $disputes,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $dispute_id = $input['id'];
        $status = $input['status'];
        $resolution = $input['resolution'] ?? '';
        
        $stmt = $pdo->prepare("
            UPDATE disputes 
            SET status = :status, resolution = :resolution, resolved_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'status' => $status,
            'resolution' => $resolution,
            'id' => $dispute_id
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Dispute updated successfully']);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>