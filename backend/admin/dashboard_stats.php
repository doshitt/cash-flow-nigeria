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
    
    // Get total users
    $userStmt = $pdo->query("SELECT COUNT(*) as total_users FROM users");
    $totalUsers = $userStmt->fetch()['total_users'];
    
    // Get total revenue (sum of all successful transactions)
    $revenueStmt = $pdo->query("SELECT SUM(amount) as total_revenue FROM transactions");
    $totalRevenue = $revenueStmt->fetch()['total_revenue'] ?? 0;
    
    // Get active cards
    $cardsStmt = $pdo->query("SELECT COUNT(*) as active_cards FROM user_cards");
    $activeCards = $cardsStmt->fetch()['active_cards'] ?? 0;
    
    // Get transaction volume (last 30 days)
    $volumeStmt = $pdo->query("SELECT SUM(amount) as volume FROM transactions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $transactionVolume = $volumeStmt->fetch()['volume'] ?? 0;
    
    // Get monthly revenue data for chart
    $monthlyStmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%b') as month,
            SUM(amount) as revenue,
            COUNT(*) as transactions
        FROM transactions 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY MONTH(created_at), YEAR(created_at)
        ORDER BY created_at
    ");
    $monthlyData = $monthlyStmt->fetchAll();
    
    // Get recent transactions
    $recentStmt = $pdo->query("
        SELECT 
            t.id,
            t.transaction_id,
            t.amount,
            t.transaction_type,
            t.status,
            t.currency,
            u.first_name,
            u.last_name,
            t.created_at
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 10
    ");
    $recentTransactions = $recentStmt->fetchAll();
    
    $response = [
        'success' => true,
        'data' => [
            'stats' => [
                'total_users' => $totalUsers,
                'total_revenue' => $totalRevenue,
                'active_cards' => $activeCards,
                'transaction_volume' => $transactionVolume
            ],
            'monthly_data' => $monthlyData,
            'recent_transactions' => $recentTransactions
        ]
    ];
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>