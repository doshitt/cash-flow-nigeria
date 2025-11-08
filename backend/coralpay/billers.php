<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once 'config.php';
    
    // Database not needed for billers/packages endpoints, only load if needed
    // require_once '../config/database.php';
    // $pdo = new PDO($dsn, $username, $password, $options);
    
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
                'error' => $result['error'] ?? 'Unknown error',
                'debug' => [
                    'request' => $result['request'] ?? null,
                    'response' => $result['response'] ?? null,
                    'httpCode' => $result['httpCode'] ?? null
                ]
            ]);
        }
        exit();
    }
    
    // Get billers by group slug
    if (isset($_GET['action']) && $_GET['action'] === 'billers') {
        $groupSlug = $_GET['groupSlug'] ?? null;
        $groupId = $_GET['groupId'] ?? null;
        
        if ($groupSlug) {
            $endpoint = "/billers/group/slug/{$groupSlug}";
        } elseif ($groupId) {
            $endpoint = "/billers/group/{$groupId}";
        } else {
            $endpoint = '/billers';
        }
        
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
                'error' => $result['error'] ?? 'Unknown error',
                'debug' => [
                    'request' => $result['request'] ?? null,
                    'response' => $result['response'] ?? null,
                    'httpCode' => $result['httpCode'] ?? null
                ]
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
                'error' => $result['error'] ?? 'Unknown error',
                'debug' => [
                    'request' => $result['request'] ?? null,
                    'response' => $result['response'] ?? null,
                    'httpCode' => $result['httpCode'] ?? null
                ]
            ]);
        }
        exit();
    }
    
} catch (Exception $e) {
    http_response_code(500);
    error_log("Billers.php error: " . $e->getMessage());
    error_log("Billers.php trace: " . $e->getTraceAsString());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
