<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $host = 'localhost';
    $dbname = 'tesapay_db';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST':
            $action = $_GET['action'] ?? '';
            
            if ($action === 'create') {
                // Create gift voucher
                $input = json_decode(file_get_contents('php://input'), true);
                $user_id = $input['user_id'];
                $amount = $input['amount'];
                $currency = $input['currency'];
                
                // Check wallet balance
                $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
                $stmt->execute([$user_id, $currency]);
                $wallet = $stmt->fetch();
                
                if (!$wallet || $wallet['balance'] < $amount) {
                    echo json_encode(['success' => false, 'message' => 'Insufficient balance']);
                    exit;
                }
                
                // Generate unique voucher code
                $code = 'x' . strtoupper(substr(md5(time() . $user_id . rand()), 0, 8));
                
                // Start transaction
                $pdo->beginTransaction();
                
                try {
                    // Create voucher
                    $stmt = $pdo->prepare("
                        INSERT INTO gift_vouchers (code, creator_user_id, amount, currency, expires_at) 
                        VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 YEAR))
                    ");
                    $stmt->execute([$code, $user_id, $amount, $currency]);
                    $voucher_id = $pdo->lastInsertId();
                    
                    // Deduct from wallet
                    $stmt = $pdo->prepare("
                        UPDATE wallets SET balance = balance - ? 
                        WHERE user_id = ? AND currency = ?
                    ");
                    $stmt->execute([$amount, $user_id, $currency]);
                    
                    // Create transaction record
                    $transaction_id = 'TXN' . time() . rand(1000, 9999);
                    $stmt = $pdo->prepare("
                        INSERT INTO transactions (transaction_id, user_id, transaction_type, amount, currency, description, status) 
                        VALUES (?, ?, 'withdrawal', ?, ?, ?, 'completed')
                    ");
                    $stmt->execute([$transaction_id, $user_id, $amount, $currency, "Gift voucher created: $code"]);
                    $txn_id = $pdo->lastInsertId();
                    
                    // Record voucher transaction
                    $stmt = $pdo->prepare("
                        INSERT INTO voucher_transactions (voucher_id, user_id, transaction_type, amount, currency, transaction_id) 
                        VALUES (?, ?, 'created', ?, ?, ?)
                    ");
                    $stmt->execute([$voucher_id, $user_id, $amount, $currency, $txn_id]);
                    
                    $pdo->commit();
                    
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Gift voucher created successfully',
                        'voucher_code' => $code,
                        'amount' => $amount,
                        'currency' => $currency
                    ]);
                } catch (Exception $e) {
                    $pdo->rollback();
                    throw $e;
                }
                
            } elseif ($action === 'redeem') {
                // Redeem gift voucher
                $input = json_decode(file_get_contents('php://input'), true);
                $user_id = $input['user_id'];
                $code = $input['code'];
                
                // Check if voucher exists and is active
                $stmt = $pdo->prepare("
                    SELECT * FROM gift_vouchers 
                    WHERE code = ? AND status = 'active' AND expires_at > NOW()
                ");
                $stmt->execute([$code]);
                $voucher = $stmt->fetch();
                
                if (!$voucher) {
                    echo json_encode(['success' => false, 'message' => 'Invalid or expired voucher code']);
                    exit;
                }
                
                // Calculate platform fee (10%) and user amount (90%)
                $platform_fee = $voucher['amount'] * 0.10;
                $user_amount = $voucher['amount'] * 0.90;
                
                // Start transaction
                $pdo->beginTransaction();
                
                try {
                    // Update voucher status
                    $stmt = $pdo->prepare("
                        UPDATE gift_vouchers 
                        SET status = 'redeemed', redeemed_by_user_id = ?, redeemed_amount = ?, 
                            platform_fee = ?, redeemed_at = NOW() 
                        WHERE id = ?
                    ");
                    $stmt->execute([$user_id, $user_amount, $platform_fee, $voucher['id']]);
                    
                    // Add to user wallet (create if doesn't exist)
                    $stmt = $pdo->prepare("
                        INSERT INTO wallets (user_id, currency, balance) 
                        VALUES (?, ?, ?) 
                        ON DUPLICATE KEY UPDATE balance = balance + ?
                    ");
                    $stmt->execute([$user_id, $voucher['currency'], $user_amount, $user_amount]);
                    
                    // Create transaction record
                    $transaction_id = 'TXN' . time() . rand(1000, 9999);
                    $stmt = $pdo->prepare("
                        INSERT INTO transactions (transaction_id, user_id, transaction_type, amount, currency, description, status) 
                        VALUES (?, ?, 'deposit', ?, ?, ?, 'completed')
                    ");
                    $stmt->execute([$transaction_id, $user_id, $user_amount, $voucher['currency'], "Gift voucher redeemed: $code"]);
                    $txn_id = $pdo->lastInsertId();
                    
                    // Record voucher transaction
                    $stmt = $pdo->prepare("
                        INSERT INTO voucher_transactions (voucher_id, user_id, transaction_type, amount, currency, transaction_id) 
                        VALUES (?, ?, 'redeemed', ?, ?, ?)
                    ");
                    $stmt->execute([$voucher['id'], $user_id, $user_amount, $voucher['currency'], $txn_id]);
                    
                    $pdo->commit();
                    
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Voucher redeemed successfully',
                        'amount_received' => $user_amount,
                        'currency' => $voucher['currency'],
                        'platform_fee' => $platform_fee
                    ]);
                } catch (Exception $e) {
                    $pdo->rollback();
                    throw $e;
                }
            }
            break;
            
        case 'GET':
            $action = $_GET['action'] ?? '';
            $user_id = $_GET['user_id'] ?? '';
            
            if ($action === 'user_vouchers' && $user_id) {
                // Get user's created vouchers
                $stmt = $pdo->prepare("
                    SELECT gv.*, 
                           CASE WHEN gv.redeemed_by_user_id IS NOT NULL 
                                THEN CONCAT(u.first_name, ' ', u.last_name) 
                                ELSE NULL END as redeemed_by_name
                    FROM gift_vouchers gv
                    LEFT JOIN users u ON gv.redeemed_by_user_id = u.id
                    WHERE gv.creator_user_id = ?
                    ORDER BY gv.created_at DESC
                ");
                $stmt->execute([$user_id]);
                $vouchers = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'vouchers' => $vouchers]);
            }
            break;
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>