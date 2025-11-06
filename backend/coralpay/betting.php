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
    
    // Get betting providers (billers in betting group)
    if (isset($_GET['action']) && $_GET['action'] === 'providers') {
        // Fetch betting billers from the betting group
        $result = CoralPayConfig::makeRequest('/billers/group/slug/betting');
        
        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'data' => $result['data']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch betting providers',
                'error' => $result['error'] ?? 'Unknown error'
            ]);
        }
        exit();
    }
    
    // Get packages for a specific betting provider
    if (isset($_GET['action']) && $_GET['action'] === 'packages') {
        $providerSlug = $_GET['providerSlug'] ?? null;
        
        if (!$providerSlug) {
            echo json_encode([
                'success' => false,
                'message' => 'Provider slug is required'
            ]);
            exit();
        }
        
        $result = CoralPayConfig::makeRequest("/packages/biller/slug/{$providerSlug}");
        
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
