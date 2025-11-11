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
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch all exchange rates
        $stmt = $pdo->query("SELECT * FROM exchange_rates WHERE status = 'active' ORDER BY from_currency, to_currency");
        $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $rates]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Update exchange rate
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_percentage, status)
            VALUES (:from, :to, :rate, :fee, 'active')
            ON DUPLICATE KEY UPDATE 
            rate = :rate, fee_percentage = :fee, updated_at = NOW()
        ");
        
        $stmt->execute([
            'from' => $input['from_currency'],
            'to' => $input['to_currency'],
            'rate' => $input['rate'],
            'fee' => $input['fee_percentage'] ?? 0
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Exchange rate updated successfully']);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
