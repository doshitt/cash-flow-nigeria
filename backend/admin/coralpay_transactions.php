<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Get query parameters
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? 'all';
    $billerType = $_GET['biller_type'] ?? 'all';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    
    // Build query
    $query = "SELECT 
                ct.*,
                CONCAT(u.first_name, ' ', u.last_name) as user_name,
                u.email as user_email
              FROM coralpay_transactions ct
              LEFT JOIN users u ON ct.user_id = u.id
              WHERE 1=1";
    
    $params = [];
    
    // Add search filter
    if (!empty($search)) {
        $query .= " AND (
            ct.transaction_id LIKE :search 
            OR ct.customer_id LIKE :search 
            OR ct.payment_reference LIKE :search
            OR u.email LIKE :search
            OR CONCAT(u.first_name, ' ', u.last_name) LIKE :search
        )";
        $params[':search'] = "%$search%";
    }
    
    // Add status filter
    if ($status !== 'all') {
        $query .= " AND ct.status = :status";
        $params[':status'] = $status;
    }
    
    // Add biller type filter
    if ($billerType !== 'all') {
        $query .= " AND ct.biller_type = :biller_type";
        $params[':biller_type'] = $billerType;
    }
    
    // Add ordering and pagination
    $query .= " ORDER BY ct.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($query);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $transactions = $stmt->fetchAll();
    
    // Get total count for pagination
    $countQuery = "SELECT COUNT(*) as total 
                   FROM coralpay_transactions ct
                   LEFT JOIN users u ON ct.user_id = u.id
                   WHERE 1=1";
    
    if (!empty($search)) {
        $countQuery .= " AND (
            ct.transaction_id LIKE :search 
            OR ct.customer_id LIKE :search 
            OR ct.payment_reference LIKE :search
            OR u.email LIKE :search
            OR CONCAT(u.first_name, ' ', u.last_name) LIKE :search
        )";
    }
    
    if ($status !== 'all') {
        $countQuery .= " AND ct.status = :status";
    }
    
    if ($billerType !== 'all') {
        $countQuery .= " AND ct.biller_type = :biller_type";
    }
    
    $countStmt = $pdo->prepare($countQuery);
    foreach ($params as $key => $value) {
        if ($key !== ':limit' && $key !== ':offset') {
            $countStmt->bindValue($key, $value);
        }
    }
    $countStmt->execute();
    $total = $countStmt->fetch()['total'];
    
    // Get statistics
    $statsQuery = "SELECT 
                    COUNT(*) as total_transactions,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
                    COUNT(DISTINCT user_id) as unique_users
                   FROM coralpay_transactions";
    
    $statsStmt = $pdo->query($statsQuery);
    $stats = $statsStmt->fetch();
    
    echo json_encode([
        'success' => true,
        'data' => $transactions,
        'pagination' => [
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
            'pages' => ceil($total / $limit)
        ],
        'stats' => $stats
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
