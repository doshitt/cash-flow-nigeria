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
        // Try multiple possible group slugs for electricity until we find billers
        $preferredSlugs = [
            $_GET['groupSlug'] ?? 'ELECTRIC_BILLS',
            'ELECTRIC_DISCOS',
            'ELECTRICITY',
            'ELECTRICITY_BILLS',
            'ELECTRICITY_AND_GAS'
        ];

        $finalResult = null;
        foreach ($preferredSlugs as $slug) {
            $try = CoralPayConfig::makeRequest("/billers/group/slug/{$slug}");
            if ($try['success'] && isset($try['data']['responseData']) && !empty($try['data']['responseData'])) {
                $finalResult = $try;
                break;
            }
            // Keep the last attempt for messaging if all fail
            $finalResult = $try;
        }
        
        if ($finalResult && $finalResult['success']) {
            echo json_encode([
                'success' => true,
                'data' => $finalResult['data']
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => ($finalResult['data']['message'] ?? 'Failed to fetch electricity providers') . ' - tried multiple slugs',
                'error' => $finalResult['error'] ?? null
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
