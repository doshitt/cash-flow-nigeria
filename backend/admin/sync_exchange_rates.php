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
    
    // Ensure exchange_rates schema exists for required columns and indexes
    try {
        // fee_percentage column
        $hasFee = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'fee_percentage'")->fetchColumn();
        if ((int)$hasFee === 0) {
            $pdo->exec("ALTER TABLE exchange_rates ADD COLUMN fee_percentage DECIMAL(5,2) DEFAULT 0");
        }
        // updated_at column
        $hasUpdated = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'updated_at'")->fetchColumn();
        if ((int)$hasUpdated === 0) {
            $pdo->exec("ALTER TABLE exchange_rates ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }
        // status column
        $hasStatus = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'status'")->fetchColumn();
        if ((int)$hasStatus === 0) {
            $pdo->exec("ALTER TABLE exchange_rates ADD COLUMN status ENUM('active','inactive') DEFAULT 'active'");
        }
        // unique index for pair
        $hasIdx = $pdo->query("SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exchange_rates' AND INDEX_NAME = 'idx_exchange_pair'")->fetchColumn();
        if ((int)$hasIdx === 0) {
            $pdo->exec("ALTER TABLE exchange_rates ADD UNIQUE KEY idx_exchange_pair (from_currency, to_currency)");
        }
    } catch (Exception $e) {
        // Ignore schema adjustment errors to avoid blocking sync
    }
    
    // Fetch live rates from exchangerate-api.com (Google uses similar rates)
    $apiResponse = @file_get_contents('https://api.exchangerate-api.com/v4/latest/NGN');

    
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
