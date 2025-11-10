<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $userId = $input['user_id'] ?? null;
    $customerId = $input['customerId'] ?? null;
    $packageSlug = $input['packageSlug'] ?? null;
    $amount = $input['amount'] ?? null;
    $customerName = $input['customerName'] ?? null;
    $phoneNumber = $input['phoneNumber'] ?? null;
    $email = $input['email'] ?? null;
    $billerType = $input['billerType'] ?? null; // airtime, data, electricity, tv, betting
    $billerSlug = $input['billerSlug'] ?? null; // optional but recommended
    
    // For betting, packageSlug is not required (they use amount-based top-ups)
    $requiresPackage = !in_array($billerType, ['betting']);
    
    if (!$userId || !$customerId || !$amount || ($requiresPackage && !$packageSlug)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields'
        ]);
        exit();
    }
    
    // Check user wallet balance (main wallet only)
    $stmt = $pdo->prepare("SELECT id, balance, currency FROM wallets WHERE user_id = ? AND currency = 'NGN' AND wallet_type = 'main' ORDER BY updated_at DESC, id DESC LIMIT 1");
    $stmt->execute([$userId]);
    $wallet = $stmt->fetch();
    
    // Log wallet check for debugging
    error_log("Wallet check - User: $userId, Found: " . ($wallet ? 'yes' : 'no') . 
              ", Balance: " . ($wallet ? $wallet['balance'] : 'N/A') . 
              ", Required: $amount");
    
    if (!$wallet) {
        echo json_encode([
            'success' => false,
            'message' => 'NGN wallet not found. Please ensure you have a Naira wallet.'
        ]);
        exit();
    }
    
    if ($wallet['balance'] < $amount) {
        echo json_encode([
            'success' => false,
            'message' => 'Insufficient wallet balance. Available: ₦' . number_format($wallet['balance'], 2) . ', Required: ₦' . number_format($amount, 2)
        ]);
        exit();
    }
    
    // Generate payment reference
    $paymentReference = 'TESA' . time() . rand(1000, 9999);

    // For betting without explicit package, attempt to auto-select a suitable package
    if ($billerType === 'betting' && !$packageSlug && $billerSlug) {
        $pkgRes = CoralPayConfig::makeRequest("/packages/biller/slug/{$billerSlug}");
        if ($pkgRes['success'] && isset($pkgRes['data']['responseData']) && is_array($pkgRes['data']['responseData'])) {
            $pkgs = $pkgRes['data']['responseData'];
            $chosen = null;
            // Prefer variable-amount packages (amount == null)
            foreach ($pkgs as $p) {
                if (!isset($p['amount']) || $p['amount'] === null) { $chosen = $p; break; }
            }
            // Fallback: look for wallet/topup/fund keywords
            if (!$chosen) {
                foreach ($pkgs as $p) {
                    $n = strtoupper($p['name'] ?? '');
                    if (str_contains($n, 'WALLET') || str_contains($n, 'TOP') || str_contains($n, 'FUND')) { $chosen = $p; break; }
                }
            }
            // Final fallback: first package
            if (!$chosen && count($pkgs) > 0) { $chosen = $pkgs[0]; }
            if ($chosen && !empty($chosen['slug'])) { $packageSlug = $chosen['slug']; }
        }
    }
    
    // Prepare vend request
    $vendData = [
        'paymentReference' => $paymentReference,
        'customerId' => $customerId,
        'billerSlug' => $billerSlug ?: $billerType, // provide hint to API
        'channel' => 'WEB',
        'amount' => floatval($amount),
        'customerName' => $customerName,
        'phoneNumber' => $phoneNumber,
        'email' => $email
    ];
    
    // Only add packageSlug if it exists (betting now auto-selects one)
    if ($packageSlug) {
        $vendData['packageSlug'] = $packageSlug;
    }
    
    // Perform required pre-vend enquiry for TV and Betting
    if (in_array(strtolower($billerType), ['tv', 'betting'])) {
        $lookupPayload = [
            'customerId' => $customerId,
            'billerSlug' => $billerSlug ?: $billerType
        ];
        // Some providers require product/package name on enquiry (e.g., TV)
        if (!empty($packageSlug)) {
            $lookupPayload['productName'] = $packageSlug;
        }
        // Some providers require amount during enquiry (e.g., betting)
        if (!empty($amount)) {
            $lookupPayload['amount'] = floatval($amount);
        }
        $lookupRes = CoralPayConfig::makeRequest('/transactions/customer-lookup', 'POST', $lookupPayload);
        if (!($lookupRes['success'] && isset($lookupRes['data']['responseCode']) && $lookupRes['data']['responseCode'] === '00')) {
            echo json_encode([
                'success' => false,
                'message' => $lookupRes['data']['message'] ?? ($lookupRes['error'] ?? 'Customer enquiry failed')
            ]);
            exit();
        }
    }
    
    // Deduct from wallet first (main wallet only)
    $stmt = $pdo->prepare("UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$amount, $wallet['id']]);
    
    // Make vend request to CoralPay
    $result = CoralPayConfig::makeRequest('/transactions/process-payment', 'POST', $vendData);
    
    $transactionId = generateId('TXN');
    $status = 'pending';
    $coralPayResponse = json_encode($result['data'] ?? []);
    
    // Log the full response for debugging
    error_log("CoralPay Response: " . json_encode($result));
    
    if ($result['success'] && isset($result['data']['responseCode']) && $result['data']['responseCode'] === '00') {
        $status = 'completed';
        $responseMessage = $result['data']['message'] ?? 'Transaction successful';
    } else {
        // Refund wallet if vend failed
        $stmt = $pdo->prepare("UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$amount, $wallet['id']]);
        
        $status = 'failed';
        $responseCode = $result['data']['responseCode'] ?? 'UNKNOWN';
        $responseMessage = $result['data']['message'] ?? $result['error'] ?? 'Transaction failed';
        
        // More detailed error message
        if (isset($result['httpCode'])) {
            $responseMessage .= " (HTTP " . $result['httpCode'] . ", Code: " . $responseCode . ")";
        }
    }
    
    // Log transaction (align with current schema - no `metadata` column)
    $transactionType = in_array($billerType, ['airtime','data']) ? $billerType : 'bills';

    $stmt = $pdo->prepare("
        INSERT INTO transactions (
            transaction_id, user_id, transaction_type, amount, currency,
            description, status, recipient_info, created_at
        ) VALUES (?, ?, ?, ?, 'NGN', ?, ?, ?, NOW())
    ");
    
    $description = ucfirst($billerType) . ' - ' . $customerId;
    $recipientInfo = json_encode([
        'biller_type' => $billerType,
        'customer_id' => $customerId,
        'package_slug' => $packageSlug,
        'payment_reference' => $paymentReference,
        'coralpay_response' => $result['data'] ?? []
    ]);
    
    $stmt->execute([
        $transactionId,
        $userId,
        $transactionType,
        $amount,
        $description,
        $status,
        $recipientInfo
    ]);
    
    // Store CoralPay transaction
    $stmt = $pdo->prepare("
        INSERT INTO coralpay_transactions (
            transaction_id, user_id, biller_type, customer_id, package_slug,
            amount, payment_reference, status, coralpay_response, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $transactionId,
        $userId,
        $billerType,
        $customerId,
        $packageSlug,
        $amount,
        $paymentReference,
        $status,
        $coralPayResponse
    ]);
    
    // Create notification for the transaction (non-blocking: ignore if table missing)
    try {
        $notificationId = 'NOT' . time() . rand(1000, 9999);
        $notificationType = $status === 'completed' ? 'outflow' : 'system';
        $notificationTitle = $status === 'completed' ? 
            ucfirst($billerType) . ' Purchase Successful' : 
            ucfirst($billerType) . ' Purchase Failed';
        $notificationMessage = $status === 'completed' ?
            "Successfully purchased {$billerType} for {$customerId}. Amount: ₦" . number_format($amount, 2) :
            "Failed to purchase {$billerType} for {$customerId}. " . ($responseMessage ?? '');
        
        $stmt = $pdo->prepare("\n            INSERT INTO notifications (\n                id, user_id, type, title, message, amount, currency, timestamp, `read`\n            ) VALUES (?, ?, ?, ?, ?, ?, 'NGN', NOW(), 0)\n        ");
        $stmt->execute([
            $notificationId,
            $userId,
            $notificationType,
            $notificationTitle,
            $notificationMessage,
            $amount
        ]);
    } catch (Exception $e) {
        // If notifications table doesn't exist or any error occurs, log and continue
        error_log('Notification insert skipped: ' . $e->getMessage());
    }
    
    if ($status === 'completed') {
        echo json_encode([
            'success' => true,
            'message' => $responseMessage,
            'data' => [
                'transaction_id' => $transactionId,
                'payment_reference' => $paymentReference,
                'status' => $status,
                'responseData' => $result['data']['responseData'] ?? [],
                'token' => $result['data']['responseData']['tokenData']['stdToken']['value'] ?? ($result['data']['responseData']['token'] ?? null),
                'customer_name' => $result['data']['responseData']['customerName'] ?? $customerName
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => $responseMessage,
            'transaction_id' => $transactionId,
            'response_code' => $responseCode ?? null,
            'http_code' => $result['httpCode'] ?? null,
            'coralpay_error' => $result['error'] ?? null,
            'coralpay_data' => $result['data'] ?? null
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
