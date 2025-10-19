<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Get document ID from query parameter
    $documentId = $_GET['id'] ?? null;
    
    if (!$documentId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Document ID required']);
        exit;
    }
    
    // Get document info
    $stmt = $pdo->prepare("
        SELECT d.*, k.user_id 
        FROM kyc_documents d
        JOIN kyc_verifications k ON k.id = d.kyc_verification_id
        WHERE d.id = ?
    ");
    $stmt->execute([$documentId]);
    $document = $stmt->fetch();
    
    if (!$document) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Document not found']);
        exit;
    }
    
    // Check if file exists
    $filePath = __DIR__ . '/' . $document['file_path'];
    
    if (!file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'File not found on server']);
        exit;
    }
    
    // Get file extension and set appropriate content type
    $fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $contentTypes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'pdf' => 'application/pdf'
    ];
    
    $contentType = $contentTypes[$fileExtension] ?? 'application/octet-stream';
    
    // Clear any previous output
    ob_clean();
    
    // Set headers for file download/display
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . filesize($filePath));
    header('Content-Disposition: inline; filename="' . basename($document['document_name']) . '"');
    header('Cache-Control: private, max-age=3600');
    
    // Output the file
    readfile($filePath);
    exit;
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
