<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $type = $_GET['type'] ?? '';
    
    if ($type === 'crypto') {
        // Get crypto fees for user
        $stmt = $pdo->query("SELECT * FROM crypto_fees WHERE status = 'active' ORDER BY crypto_type, network_type");
        $cryptoFees = $stmt->fetchAll();
        
        $stmt = $pdo->query("SELECT * FROM crypto_platform_fees WHERE status = 'active' ORDER BY min_amount");
        $platformFees = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'crypto_fees' => $cryptoFees,
            'platform_fees' => $platformFees
        ]);
        
    } elseif ($type === 'momo') {
        // Get MOMO fees for user
        $stmt = $pdo->query("SELECT * FROM momo_fees WHERE status = 'active' ORDER BY min_amount");
        $momoFees = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'momo_fees' => $momoFees,
            'min_transfer' => 5.00,
            'max_transfer' => 1000.00
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid fee type']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
