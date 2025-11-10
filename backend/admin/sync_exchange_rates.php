<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Fetch live rates from exchangerate-api.com (Google uses similar rates)
    $apiResponse = file_get_contents('https://api.exchangerate-api.com/v4/latest/NGN');
    
    if ($apiResponse === false) {
        throw new Exception('Failed to fetch exchange rates from API');
    }
    
    $apiData = json_decode($apiResponse, true);
    
    if (!isset($apiData['rates'])) {
        throw new Exception('Invalid API response format');
    }
    
    $rates = $apiData['rates'];
    
    // Define currency pairs to update
    $currencyPairs = [
        ['from' => 'NGN', 'to' => 'USD', 'rate' => $rates['USD'], 'fee' => 0],
        ['from' => 'USD', 'to' => 'NGN', 'rate' => 1 / $rates['USD'], 'fee' => 0.5],
        ['from' => 'NGN', 'to' => 'GBP', 'rate' => $rates['GBP'], 'fee' => 0],
        ['from' => 'GBP', 'to' => 'NGN', 'rate' => 1 / $rates['GBP'], 'fee' => 0.5],
        ['from' => 'NGN', 'to' => 'EUR', 'rate' => $rates['EUR'], 'fee' => 0],
        ['from' => 'EUR', 'to' => 'NGN', 'rate' => 1 / $rates['EUR'], 'fee' => 0.5],
        ['from' => 'NGN', 'to' => 'GHS', 'rate' => $rates['GHS'], 'fee' => 0],
        ['from' => 'GHS', 'to' => 'NGN', 'rate' => 1 / $rates['GHS'], 'fee' => 0.5],
    ];
    
    $stmt = $pdo->prepare("
        INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_percentage, status)
        VALUES (:from_currency, :to_currency, :rate, :fee_percentage, 'active')
        ON DUPLICATE KEY UPDATE 
        rate = :rate, fee_percentage = :fee_percentage, updated_at = NOW()
    ");
    
    $updated = 0;
    foreach ($currencyPairs as $pair) {
        $stmt->execute([
            'from_currency' => $pair['from'],
            'to_currency' => $pair['to'],
            'rate' => $pair['rate'],
            'fee_percentage' => $pair['fee']
        ]);
        $updated++;
    }
    
    echo json_encode([
        'success' => true, 
        'message' => "Successfully synced {$updated} exchange rates",
        'rates' => $currencyPairs
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
