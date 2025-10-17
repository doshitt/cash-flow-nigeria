<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get user ID from session token
        $headers = getallheaders();
        $sessionToken = $headers['Authorization'] ?? $_POST['session_token'] ?? '';
        $sessionToken = str_replace('Bearer ', '', $sessionToken);
        
        if (empty($sessionToken)) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        // Verify session and get user
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.first_name, u.last_name 
            FROM users u 
            JOIN user_sessions s ON s.user_id = u.id 
            WHERE s.session_token = ? AND s.status = 'active' AND s.expires_at > NOW()
        ");
        $stmt->execute([$sessionToken]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid session']);
            exit;
        }
        
        $userId = $user['id'];
        
        // Parse JSON or form data
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        
        // Extract KYC data
        $accountType = $data['account_type'] ?? 'individual';
        $fullName = $data['full_name'] ?? '';
        $nationality = $data['nationality'] ?? '';
        $dateOfBirth = $data['date_of_birth'] ?? '';
        $phoneNumber = $data['phone_number'] ?? '';
        $residentialAddress = $data['residential_address'] ?? '';
        $city = $data['city'] ?? '';
        $state = $data['state'] ?? '';
        $country = $data['country'] ?? '';
        $postalCode = $data['postal_code'] ?? '';
        
        // Business details (if applicable)
        $companyName = $data['company_name'] ?? null;
        $registrationNumber = $data['registration_number'] ?? null;
        $taxId = $data['tax_id'] ?? null;
        $businessAddress = $data['business_address'] ?? null;
        
        // Check if user already has KYC submission
        $stmt = $pdo->prepare("SELECT id FROM kyc_verifications WHERE user_id = ?");
        $stmt->execute([$userId]);
        $existingKyc = $stmt->fetch();
        
        if ($existingKyc) {
            // Update existing KYC
            $stmt = $pdo->prepare("
                UPDATE kyc_verifications SET
                    account_type = ?,
                    full_name = ?,
                    nationality = ?,
                    date_of_birth = ?,
                    phone_number = ?,
                    residential_address = ?,
                    city = ?,
                    state = ?,
                    country = ?,
                    postal_code = ?,
                    company_name = ?,
                    registration_number = ?,
                    tax_id = ?,
                    business_address = ?,
                    verification_status = 'pending',
                    updated_at = NOW()
                WHERE user_id = ?
            ");
            $stmt->execute([
                $accountType, $fullName, $nationality, $dateOfBirth, $phoneNumber,
                $residentialAddress, $city, $state, $country, $postalCode,
                $companyName, $registrationNumber, $taxId, $businessAddress,
                $userId
            ]);
            $kycId = $existingKyc['id'];
        } else {
            // Create new KYC submission
            $stmt = $pdo->prepare("
                INSERT INTO kyc_verifications (
                    user_id, account_type, full_name, nationality, date_of_birth, 
                    phone_number, residential_address, city, state, country, postal_code,
                    company_name, registration_number, tax_id, business_address,
                    verification_status, kyc_tier
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'tier_0')
            ");
            $stmt->execute([
                $userId, $accountType, $fullName, $nationality, $dateOfBirth,
                $phoneNumber, $residentialAddress, $city, $state, $country, $postalCode,
                $companyName, $registrationNumber, $taxId, $businessAddress
            ]);
            $kycId = $pdo->lastInsertId();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'KYC information submitted successfully',
            'kyc_id' => $kycId
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get KYC status for current user
        $headers = getallheaders();
        $sessionToken = $headers['Authorization'] ?? $_GET['session_token'] ?? '';
        $sessionToken = str_replace('Bearer ', '', $sessionToken);
        
        if (empty($sessionToken)) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            SELECT u.id, u.kyc_tier, u.kyc_status 
            FROM users u 
            JOIN user_sessions s ON s.user_id = u.id 
            WHERE s.session_token = ? AND s.status = 'active'
        ");
        $stmt->execute([$sessionToken]);
        $user = $stmt->fetch();
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid session']);
            exit;
        }
        
        // Get full KYC details
        $stmt = $pdo->prepare("
            SELECT * FROM kyc_verifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $kyc = $stmt->fetch();
        
        if ($kyc) {
            // Get documents
            $stmt = $pdo->prepare("
                SELECT id, document_type, document_name, file_url, uploaded_at 
                FROM kyc_documents WHERE kyc_verification_id = ?
            ");
            $stmt->execute([$kyc['id']]);
            $documents = $stmt->fetchAll();
            
            $kyc['documents'] = $documents;
        }
        
        echo json_encode([
            'success' => true,
            'kyc_tier' => $user['kyc_tier'],
            'kyc_status' => $user['kyc_status'],
            'kyc_data' => $kyc
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
