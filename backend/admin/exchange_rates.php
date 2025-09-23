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
        $stmt = $pdo->query("
            SELECT * FROM exchange_rates 
            WHERE status = 'active'
            ORDER BY from_currency, to_currency
        ");
        $rates = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $rates]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_percentage, status)
            VALUES (:from_currency, :to_currency, :rate, :fee_percentage, 'active')
            ON DUPLICATE KEY UPDATE 
            rate = :rate, fee_percentage = :fee_percentage, updated_at = NOW()
        ");
        
        $stmt->execute([
            'from_currency' => $input['from_currency'],
            'to_currency' => $input['to_currency'],
            'rate' => $input['rate'],
            'fee_percentage' => $input['fee_percentage'] ?? 0
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Exchange rate updated successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE exchange_rates 
            SET rate = :rate, fee_percentage = :fee_percentage, status = :status, updated_at = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'rate' => $input['rate'],
            'fee_percentage' => $input['fee_percentage'],
            'status' => $input['status'],
            'id' => $input['id']
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