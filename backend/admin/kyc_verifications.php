<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Admin authentication check (simplified - enhance based on your admin auth)
    $headers = getallheaders();
    $adminToken = $headers['Authorization'] ?? '';
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all KYC submissions
        $status = $_GET['status'] ?? null;
        
        $query = "
            SELECT 
                k.*,
                u.email, u.first_name, u.last_name, u.phone,
                COUNT(d.id) as document_count
            FROM kyc_verifications k
            JOIN users u ON u.id = k.user_id
            LEFT JOIN kyc_documents d ON d.kyc_verification_id = k.id
        ";
        
        if ($status) {
            $query .= " WHERE k.verification_status = :status";
        }
        
        $query .= " GROUP BY k.id ORDER BY k.created_at DESC";
        
        $stmt = $pdo->prepare($query);
        if ($status) {
            $stmt->execute(['status' => $status]);
        } else {
            $stmt->execute();
        }
        
        $submissions = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'submissions' => $submissions
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get KYC details with documents
        $data = json_decode(file_get_contents('php://input'), true);
        $kycId = $data['kyc_id'] ?? null;
        
        if (!$kycId) {
            echo json_encode(['success' => false, 'message' => 'KYC ID required']);
            exit;
        }
        
        // Get KYC details
        $stmt = $pdo->prepare("
            SELECT k.*, u.email, u.first_name, u.last_name, u.phone
            FROM kyc_verifications k
            JOIN users u ON u.id = k.user_id
            WHERE k.id = ?
        ");
        $stmt->execute([$kycId]);
        $kyc = $stmt->fetch();
        
        if (!$kyc) {
            echo json_encode(['success' => false, 'message' => 'KYC not found']);
            exit;
        }
        
        // Get documents
        $stmt = $pdo->prepare("
            SELECT * FROM kyc_documents WHERE kyc_verification_id = ?
        ");
        $stmt->execute([$kycId]);
        $documents = $stmt->fetchAll();
        
        $kyc['documents'] = $documents;
        
        echo json_encode([
            'success' => true,
            'kyc' => $kyc
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Approve or reject KYC
        $data = json_decode(file_get_contents('php://input'), true);
        
        $kycId = $data['kyc_id'] ?? null;
        $action = $data['action'] ?? null; // 'approve' or 'reject'
        $tier = $data['tier'] ?? 'tier_1';
        $comments = $data['comments'] ?? '';
        $rejectionReason = $data['rejection_reason'] ?? '';
        
        if (!$kycId || !$action) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }
        
        $pdo->beginTransaction();
        
        try {
            if ($action === 'approve') {
                $stmt = $pdo->prepare("
                    UPDATE kyc_verifications SET
                        verification_status = 'approved',
                        kyc_tier = ?,
                        admin_comments = ?,
                        reviewed_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$tier, $comments, $kycId]);
                
                // Users table sync omitted; relying on kyc_verifications only
                
            } elseif ($action === 'reject') {
                $stmt = $pdo->prepare("
                    UPDATE kyc_verifications SET
                        verification_status = 'rejected',
                        rejection_reason = ?,
                        admin_comments = ?,
                        reviewed_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$rejectionReason, $comments, $kycId]);
                
                // Users table sync omitted; relying on kyc_verifications only
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'KYC ' . $action . 'd successfully'
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
