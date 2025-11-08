<?php
// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include config file
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/config.php';

try {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'providers') {
        // Get electricity providers from the correct group slug
        // Try multiple possible group slugs for electricity
        $groupSlug = $_GET['groupSlug'] ?? 'ELECTRIC_BILLS';
        $result = CoralPayConfig::makeRequest("/billers/group/slug/{$groupSlug}");
        
        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'data' => $result['data']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => $result['message'] ?? 'Failed to fetch electricity providers',
                'error' => $result['error'] ?? null
            ]);
        }
    } elseif ($action === 'packages') {
        // Get packages for a specific provider
        $providerSlug = $_GET['providerSlug'] ?? '';
        
        if (empty($providerSlug)) {
            echo json_encode([
                'success' => false,
                'message' => 'Provider slug is required'
            ]);
            exit;
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
                'message' => $result['message'] ?? 'Failed to fetch packages',
                'error' => $result['error'] ?? null
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
