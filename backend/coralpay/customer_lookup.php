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
    $input = json_decode(file_get_contents('php://input'), true);
    
    $customerId = $input['customerId'] ?? null;
    $billerSlug = $input['billerSlug'] ?? null;
    $productName = $input['productName'] ?? null;
    
    if (!$customerId || !$billerSlug) {
        echo json_encode([
            'success' => false,
            'message' => 'Customer ID and Biller Slug are required'
        ]);
        exit();
    }
    
    $requestData = [
        'customerId' => $customerId,
        'billerSlug' => $billerSlug
    ];
    
    if ($productName) {
        $requestData['productName'] = $productName;
    }
    
    $result = CoralPayConfig::makeRequest('/transactions/customer-lookup', 'POST', $requestData);
    
    if ($result['success'] && isset($result['data']['responseData'])) {
        echo json_encode([
            'success' => true,
            'data' => $result['data']['responseData'],
            'message' => $result['data']['message'] ?? 'Customer lookup successful'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => $result['data']['message'] ?? 'Customer lookup failed',
            'error' => $result['error'] ?? 'Unknown error'
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
