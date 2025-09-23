<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("
            SELECT id, email, first_name, last_name, role, status, last_login, created_at
            FROM admin_team 
            ORDER BY created_at DESC
        ");
        $team = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $team]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Hash password
        $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
        
        // Set permissions based on role
        $permissions = [
            'super_admin' => ['all'],
            'admin' => ['transactions', 'customers', 'disputes', 'refunds'],
            'customer_care' => ['customers', 'disputes'],
            'kyc_audit' => ['customers'],
            'finance' => ['transactions', 'refunds', 'exchange_rates']
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO admin_team (email, password, first_name, last_name, role, permissions, status)
            VALUES (:email, :password, :first_name, :last_name, :role, :permissions, 'active')
        ");
        
        $stmt->execute([
            'email' => $input['email'],
            'password' => $hashedPassword,
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'role' => $input['role'],
            'permissions' => json_encode($permissions[$input['role']] ?? [])
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Team member added successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE admin_team 
            SET first_name = :first_name, last_name = :last_name, role = :role, status = :status
            WHERE id = :id
        ");
        
        $stmt->execute([
            'first_name' => $input['first_name'],
            'last_name' => $input['last_name'],
            'role' => $input['role'],
            'status' => $input['status'],
            'id' => $input['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Team member updated successfully']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'];
        
        $stmt = $pdo->prepare("UPDATE admin_team SET status = 'inactive' WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['success' => true, 'message' => 'Team member deactivated successfully']);
    }
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>