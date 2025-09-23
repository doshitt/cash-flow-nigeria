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
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 20;
    $status = $_GET['status'] ?? '';
    $type = $_GET['type'] ?? '';
    $search = $_GET['search'] ?? '';
    
    $offset = ($page - 1) * $limit;
    
    // Build query
    $whereClause = "WHERE 1=1";
    $params = [];
    
    if ($status) {
        $whereClause .= " AND t.status = :status";
        $params['status'] = $status;
    }
    
    if ($type) {
        $whereClause .= " AND t.type = :type";
        $params['type'] = $type;
    }
    
    if ($search) {
        $whereClause .= " AND (u.first_name LIKE :search OR u.last_name LIKE :search OR u.email LIKE :search OR t.id LIKE :search)";
        $params['search'] = "%$search%";
    }
    
    // Get transactions
    $stmt = $pdo->prepare("
        SELECT 
            t.*,
            u.first_name,
            u.last_name,
            u.email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        $whereClause
        ORDER BY t.created_at DESC
        LIMIT :limit OFFSET :offset
    ");
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue('limit', (int)$limit, PDO::PARAM_INT);
    $stmt->bindValue('offset', (int)$offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $transactions = $stmt->fetchAll();
    
    // Get total count
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        $whereClause
    ");
    
    foreach ($params as $key => $value) {
        $countStmt->bindValue($key, $value);
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    echo json_encode([
        'success' => true,
        'data' => $transactions,
        'pagination' => [
            'page' => (int)$page,
            'limit' => (int)$limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>