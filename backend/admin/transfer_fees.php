<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    if ($method === 'GET') {
        $type = $_GET['type'] ?? 'all';
        
        if ($type === 'crypto' || $type === 'all') {
            // Get crypto blockchain fees
            $stmt = $pdo->query("SELECT * FROM crypto_fees ORDER BY crypto_type, network_type");
            $cryptoFees = $stmt->fetchAll();
            
            // Get crypto platform fees
            $stmt = $pdo->query("SELECT * FROM crypto_platform_fees ORDER BY min_amount");
            $cryptoPlatformFees = $stmt->fetchAll();
        }
        
        if ($type === 'momo' || $type === 'all') {
            // Get MOMO fees
            $stmt = $pdo->query("SELECT * FROM momo_fees ORDER BY min_amount");
            $momoFees = $stmt->fetchAll();
        }
        
        $response = ['success' => true];
        if ($type === 'crypto') {
            $response['crypto_fees'] = $cryptoFees;
            $response['crypto_platform_fees'] = $cryptoPlatformFees;
        } elseif ($type === 'momo') {
            $response['momo_fees'] = $momoFees;
        } else {
            $response['crypto_fees'] = $cryptoFees ?? [];
            $response['crypto_platform_fees'] = $cryptoPlatformFees ?? [];
            $response['momo_fees'] = $momoFees ?? [];
        }
        
        echo json_encode($response);
        
    } elseif ($method === 'POST') {
        $feeType = $input['fee_type'] ?? '';
        
        if ($feeType === 'crypto') {
            // Update crypto blockchain fee
            $stmt = $pdo->prepare("
                INSERT INTO crypto_fees (crypto_type, network_type, blockchain_fee, min_amount, status) 
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    blockchain_fee = VALUES(blockchain_fee),
                    min_amount = VALUES(min_amount),
                    status = VALUES(status)
            ");
            $stmt->execute([
                $input['crypto_type'],
                $input['network_type'],
                $input['blockchain_fee'],
                $input['min_amount'],
                $input['status'] ?? 'active'
            ]);
            
        } elseif ($feeType === 'crypto_platform') {
            // Update crypto platform fee
            $stmt = $pdo->prepare("
                UPDATE crypto_platform_fees 
                SET fee_type = ?, fee_value = ?, status = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $input['fee_type_val'],
                $input['fee_value'],
                $input['status'] ?? 'active',
                $input['id']
            ]);
            
        } elseif ($feeType === 'momo') {
            // Update MOMO fee
            $stmt = $pdo->prepare("
                UPDATE momo_fees 
                SET platform_fee = ?, status = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $input['platform_fee'],
                $input['status'] ?? 'active',
                $input['id']
            ]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Fees updated successfully']);
        
    } elseif ($method === 'PUT') {
        // Update specific fee
        $id = $input['id'];
        $table = $input['table'];
        
        if ($table === 'crypto_fees') {
            $stmt = $pdo->prepare("
                UPDATE crypto_fees 
                SET blockchain_fee = ?, min_amount = ?, status = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $input['blockchain_fee'],
                $input['min_amount'],
                $input['status'],
                $id
            ]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Fee updated successfully']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
