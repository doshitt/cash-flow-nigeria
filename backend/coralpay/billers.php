<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once 'config.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Get biller groups
    if (isset($_GET['action']) && $_GET['action'] === 'groups') {
        $result = CoralPayConfig::makeRequest('/billergroups');
        
        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'data' => $result['data']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch biller groups',
                'error' => $result['error'] ?? 'Unknown error'
            ]);
        }
        exit();
    }
    
    // Get billers
    if (isset($_GET['action']) && $_GET['action'] === 'billers') {
        $groupId = $_GET['groupId'] ?? null;
        $endpoint = $groupId ? "/billers/group/{$groupId}" : '/billers';
        
        $result = CoralPayConfig::makeRequest($endpoint);
        
        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'data' => $result['data']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch billers',
                'error' => $result['error'] ?? 'Unknown error'
            ]);
        }
        exit();
    }
    
    // Get packages for a specific biller
    if (isset($_GET['action']) && $_GET['action'] === 'packages') {
        $billerSlug = $_GET['billerSlug'] ?? null;
        
        if (!$billerSlug) {
            echo json_encode([
                'success' => false,
                'message' => 'Biller slug is required'
            ]);
            exit();
        }
        
        $result = CoralPayConfig::makeRequest("/packages/biller/slug/{$billerSlug}");
        
        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'data' => $result['data']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch packages',
                'error' => $result['error'] ?? 'Unknown error'
            ]);
        }
        exit();
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
