<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        exit;
    }
    
    // Get user from session
    $sessionToken = $_POST['session_token'] ?? '';
    if (empty($sessionToken)) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $stmt = $pdo->prepare("
        SELECT u.id FROM users u 
        JOIN user_sessions s ON s.user_id = u.id 
        WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > NOW()
    ");
    $stmt->execute([$sessionToken]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Invalid session']);
        exit;
    }
    
    $userId = $user['id'];
    
    // Get or create KYC record
    $stmt = $pdo->prepare("SELECT id FROM kyc_verifications WHERE user_id = ?");
    $stmt->execute([$userId]);
    $kyc = $stmt->fetch();
    
    if (!$kyc) {
        // Create placeholder KYC record
        $stmt = $pdo->prepare("INSERT INTO kyc_verifications (user_id) VALUES (?)");
        $stmt->execute([$userId]);
        $kycId = $pdo->lastInsertId();
    } else {
        $kycId = $kyc['id'];
    }
    
    // Handle file upload
    if (!isset($_FILES['document'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit;
    }
    
    $file = $_FILES['document'];
    $documentType = $_POST['document_type'] ?? 'passport';
    
    // Validate file
    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, and PDF allowed']);
        exit;
    }
    
    // Max 5MB
    if ($file['size'] > 5 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'File too large. Maximum 5MB allowed']);
        exit;
    }
    
    // Create upload directory if it doesn't exist
    $uploadDir = '../uploads/kyc_documents/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'kyc_' . $userId . '_' . $documentType . '_' . time() . '.' . $extension;
    $filePath = $uploadDir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
        exit;
    }
    
    // Save to database
    $fileUrl = '/uploads/kyc_documents/' . $filename;
    $stmt = $pdo->prepare("
        INSERT INTO kyc_documents (kyc_verification_id, document_type, document_name, file_path, file_url)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$kycId, $documentType, $file['name'], $filePath, $fileUrl]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Document uploaded successfully',
        'document_id' => $pdo->lastInsertId(),
        'file_url' => $fileUrl
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
