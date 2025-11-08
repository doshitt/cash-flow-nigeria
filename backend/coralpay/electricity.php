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
        // Fetch all billers and filter for electricity providers
        $result = CoralPayConfig::makeRequest("/billers");
        
        if ($result['success'] && isset($result['data']['responseData'])) {
            $allBillers = $result['data']['responseData'];
            
            // Filter for electricity providers by name keywords
            $electricityKeywords = ['electric', 'disco', 'ekedc', 'ikedc', 'aedc', 'phed', 'eedc', 'kedco', 'ibedc', 'jedc', 'kano'];
            $electricityBillers = array_filter($allBillers, function($biller) use ($electricityKeywords) {
                $name = strtolower($biller['name']);
                foreach ($electricityKeywords as $keyword) {
                    if (strpos($name, $keyword) !== false) {
                        return true;
                    }
                }
                return false;
            });
            
            // Re-index array
            $electricityBillers = array_values($electricityBillers);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'error' => false,
                    'status' => 'success',
                    'message' => count($electricityBillers) > 0 ? 'Successfully fetched electricity providers' : 'No electricity providers found',
                    'responseCode' => '00',
                    'responseData' => $electricityBillers
                ]
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to fetch billers',
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
