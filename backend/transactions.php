<?php
require_once './config/cors.php';
require_once './config/database.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        exit();
    }

    // Read bearer token
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
    $sessionToken = trim($matches[1]);

    // Validate session and get user
    $stmt = $pdo->prepare("SELECT s.user_id FROM user_sessions s WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > NOW()");
    $stmt->execute([$sessionToken]);
    $sess = $stmt->fetch();
    if (!$sess) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid session']);
        exit();
    }
    $userId = $sess['user_id'];

    // Filters
    $currency = isset($_GET['currency']) ? strtoupper($_GET['currency']) : null;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 20;

    $sql = "SELECT transaction_id, transaction_type, amount, currency, description, status, recipient_info, created_at FROM transactions WHERE user_id = ?";
    $params = [$userId];
    if ($currency) {
        $sql .= " AND currency = ?";
        $params[] = $currency;
    }
    $sql .= " ORDER BY created_at DESC LIMIT ?";
    $params[] = $limit;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $rows
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
