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
        
        // If no rates in DB yet, fetch live rates as fallback (ensures UI shows accurate values)
        if (!$rates || count($rates) === 0) {
            $fallback = [];
            $api = @file_get_contents('https://api.exchangerate-api.com/v4/latest/NGN');
            if ($api) {
                $data = json_decode($api, true);
                if (isset($data['rates'])) {
                    $currencies = ['USD','NGN','GBP','EUR','GHS'];
                    foreach ($currencies as $from) {
                        foreach ($currencies as $to) {
                            if ($from === $to) continue;
                            if ($from === 'NGN' && isset($data['rates'][$to])) {
                                $rate = (float)$data['rates'][$to];
                            } elseif ($to === 'NGN' && isset($data['rates'][$from]) && (float)$data['rates'][$from] > 0) {
                                $rate = 1 / (float)$data['rates'][$from];
                            } else {
                                // Cross via NGN when both are foreign currencies
                                if (isset($data['rates'][$from]) && isset($data['rates'][$to]) && (float)$data['rates'][$from] > 0) {
                                    $rate = (1 / (float)$data['rates'][$from]) * (float)$data['rates'][$to];
                                } else {
                                    continue;
                                }
                            }
                            $fallback[] = [
                                'from_currency' => $from,
                                'to_currency' => $to,
                                'rate' => $rate,
                                'fee_percentage' => ($to === 'NGN') ? 0.5 : 0,
                                'status' => 'active'
                            ];
                        }
                    }
                }
            }
            echo json_encode(['success' => true, 'data' => $fallback]);
            exit;
        }
        
        echo json_encode(['success' => true, 'data' => $rates]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Update exchange rate
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_percentage, status)
            VALUES (:from, :to, :rate, :fee, 'active')
            ON DUPLICATE KEY UPDATE 
            rate = VALUES(rate), fee_percentage = VALUES(fee_percentage), updated_at = NOW()
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
