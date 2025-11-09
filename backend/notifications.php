<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Get authorization token
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);
    
    if (empty($token)) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }
    
    // Get user from token
    $stmt = $pdo->prepare("SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    
    if (!$session) {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired session']);
        exit();
    }
    
    $userId = $session['user_id'];
    
    // Get notifications from various sources
    $notifications = [];
    
    // 1. Transaction notifications (recent transactions)
    $stmt = $pdo->prepare("
        SELECT 
            CONCAT('txn_', transaction_id) as id,
            transaction_type,
            amount,
            currency,
            status,
            description,
            created_at,
            CASE 
                WHEN transaction_type IN ('deposit', 'voucher_redeem', 'transfer_in') THEN 'inflow'
                ELSE 'outflow'
            END as category
        FROM transactions 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
    ");
    $stmt->execute([$userId]);
    $transactions = $stmt->fetchAll();
    
    foreach ($transactions as $txn) {
        $type = $txn['category'] === 'inflow' ? 'inflow' : 'outflow';
        $title = $txn['category'] === 'inflow' ? 'Money Received' : 'Transaction Complete';
        $message = $txn['description'] ?: ucfirst(str_replace('_', ' ', $txn['transaction_type']));
        
        $notifications[] = [
            'id' => $txn['id'],
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'amount' => floatval($txn['amount']),
            'currency' => $txn['currency'],
            'timestamp' => $txn['created_at'],
            'read' => true, // Mark old transactions as read
            'link' => '/recent-transactions'
        ];
    }
    
    // 2. KYC notifications
    $stmt = $pdo->prepare("
        SELECT status, updated_at, rejection_reason 
        FROM kyc_verifications 
        WHERE user_id = ? 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $kyc = $stmt->fetch();
    
    if ($kyc) {
        if ($kyc['status'] === 'verified') {
            $notifications[] = [
                'id' => 'kyc_verified',
                'type' => 'success',
                'title' => 'KYC Verified',
                'message' => 'Your identity has been verified successfully',
                'timestamp' => $kyc['updated_at'],
                'read' => true,
                'link' => '/kyc-verification'
            ];
        } elseif ($kyc['status'] === 'rejected') {
            $notifications[] = [
                'id' => 'kyc_rejected',
                'type' => 'system',
                'title' => 'KYC Verification Failed',
                'message' => $kyc['rejection_reason'] ?: 'Please review and resubmit your documents',
                'timestamp' => $kyc['updated_at'],
                'read' => false,
                'link' => '/kyc-verification'
            ];
        }
    }
    
    // 3. Voucher notifications
    $stmt = $pdo->prepare("
        SELECT v.voucher_code, v.amount, v.currency, v.created_at 
        FROM vouchers v
        WHERE v.sender_user_id = ? AND v.redeemed = 1
        ORDER BY v.created_at DESC 
        LIMIT 5
    ");
    $stmt->execute([$userId]);
    $vouchers = $stmt->fetchAll();
    
    foreach ($vouchers as $v) {
        $notifications[] = [
            'id' => 'voucher_' . $v['voucher_code'],
            'type' => 'voucher_redeemed',
            'title' => 'Voucher Redeemed',
            'message' => 'Your gift voucher was redeemed',
            'amount' => floatval($v['amount']),
            'currency' => $v['currency'],
            'timestamp' => $v['created_at'],
            'read' => true,
            'link' => '/vouchers'
        ];
    }
    
    // Sort all notifications by timestamp
    usort($notifications, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });
    
    // Limit to 30 most recent
    $notifications = array_slice($notifications, 0, 30);
    
    echo json_encode([
        'success' => true,
        'data' => $notifications
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
