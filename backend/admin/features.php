<?php
require_once '../config/database.php';
require_once '../config/cors.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = new PDO($dsn, $username, $password, $options);

    // Initialize features table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS platform_features (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    // Default features
    $defaultFeatures = [
        ['id' => 'bank_transfer', 'name' => 'Bank Transfer (Nigeria)', 'description' => 'Send money to Nigerian bank accounts'],
        ['id' => 'international_transfer', 'name' => 'International Transfer', 'description' => 'Send money to international bank accounts'],
        ['id' => 'tesapay_transfer', 'name' => 'TesaPay User Transfer', 'description' => 'Send money to other TesaPay users'],
        ['id' => 'airtime', 'name' => 'Airtime Purchase', 'description' => 'Buy airtime for any network'],
        ['id' => 'data', 'name' => 'Data Purchase', 'description' => 'Buy data bundles'],
        ['id' => 'add_via_bank', 'name' => 'Add Money via Bank', 'description' => 'Add funds via bank transfer'],
        ['id' => 'add_via_card', 'name' => 'Add Money via Card', 'description' => 'Add funds using debit/credit card'],
        ['id' => 'voucher', 'name' => 'Voucher/Gift Cards', 'description' => 'Create and redeem gift vouchers'],
        ['id' => 'savings', 'name' => 'Savings', 'description' => 'Create and manage savings targets'],
    ];

    // Insert default features if they don't exist
    $stmt = $pdo->prepare("INSERT IGNORE INTO platform_features (id, name, description) VALUES (?, ?, ?)");
    foreach ($defaultFeatures as $feature) {
        $stmt->execute([$feature['id'], $feature['name'], $feature['description']]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch all features
        $stmt = $pdo->query("SELECT * FROM platform_features ORDER BY name");
        $features = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'features' => $features
        ]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($data['action'] === 'toggle') {
            $stmt = $pdo->prepare("UPDATE platform_features SET is_enabled = ? WHERE id = ?");
            $stmt->execute([$data['is_enabled'], $data['feature_id']]);

            echo json_encode([
                'success' => true,
                'message' => 'Feature updated successfully'
            ]);
        }
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
