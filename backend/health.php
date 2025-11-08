<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = [
    'success' => true,
    'checks' => [],
];

try {
    require_once __DIR__ . '/config/database.php';

    // DB connection check
    try {
        $pdo = new PDO($dsn, $username, $password, $options);
        $stmt = $pdo->query('SELECT 1');
        $dbOk = $stmt && $stmt->fetchColumn() == 1;

        // Optional table checks (won't fail health if missing)
        $tables = ['users', 'wallets', 'transactions', 'coralpay_transactions'];
        $tableInfo = [];
        foreach ($tables as $t) {
            try {
                $count = $pdo->query("SELECT COUNT(*) FROM `{$t}`")->fetchColumn();
                $tableInfo[$t] = [ 'exists' => true, 'count' => (int)$count ];
            } catch (Exception $e) {
                $tableInfo[$t] = [ 'exists' => false, 'error' => $e->getMessage() ];
            }
        }

        $response['checks'][] = [
            'name' => 'database',
            'ok' => $dbOk,
            'details' => [ 'tables' => $tableInfo ]
        ];
    } catch (Exception $e) {
        $response['success'] = false;
        $response['checks'][] = [
            'name' => 'database',
            'ok' => false,
            'error' => $e->getMessage(),
        ];
    }

    // CoralPay auth/reachability check (non-destructive)
    try {
        require_once __DIR__ . '/coralpay/config.php';
        // We use customer-lookup to validate auth without charging anything
        $probe = CoralPayConfig::makeRequest('/transactions/customer-lookup', 'POST', [
            'customerId' => '0000000000',
            'billerSlug' => 'MTN-VTU'
        ]);

        $ok = $probe['httpCode'] >= 200 && $probe['httpCode'] < 500; // 401/403 => auth issue, but reachable
        $response['checks'][] = [
            'name' => 'coralpay',
            'ok' => $ok,
            'http_code' => $probe['httpCode'] ?? null,
            'success' => $probe['success'] ?? false,
            'message' => $probe['data']['message'] ?? null,
            'error' => $probe['error'] ?? null,
            'base_url' => CoralPayConfig::getBaseUrl(),
            'mode' => CoralPayConfig::USE_TEST_MODE ? 'test' : 'production'
        ];
    } catch (Exception $e) {
        $response['success'] = false;
        $response['checks'][] = [
            'name' => 'coralpay',
            'ok' => false,
            'error' => $e->getMessage(),
        ];
    }

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Health check failed: ' . $e->getMessage(),
    ]);
}
