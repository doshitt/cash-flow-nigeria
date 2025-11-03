<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $userId = $input['user_id'] ?? null;
        $currency = $input['currency'] ?? null;
        $amount = $input['amount'] ?? null;
        $adminNote = $input['admin_note'] ?? '';
        
        if (!$userId || !$currency || !$amount) {
            throw new Exception('User ID, currency, and amount are required');
        }
        
        if ($amount <= 0) {
            throw new Exception('Amount must be greater than 0');
        }
        
        $pdo->beginTransaction();
        
        try {
            // Check if wallet exists
            $stmt = $pdo->prepare("SELECT id, balance FROM wallets WHERE user_id = ? AND currency = ? AND wallet_type = 'main'");
            $stmt->execute([$userId, $currency]);
            $wallet = $stmt->fetch();
            
            if (!$wallet) {
                throw new Exception('Wallet not found');
            }
            
            // Update wallet balance
            $newBalance = $wallet['balance'] + $amount;
            $stmt = $pdo->prepare("UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$newBalance, $wallet['id']]);
            
            // Record transaction
            $transactionId = 'TXN' . time() . rand(1000, 9999);
            $stmt = $pdo->prepare("
                INSERT INTO transactions (
                    transaction_id, user_id, transaction_type, 
                    amount, currency, status, description, created_at
                ) VALUES (?, ?, 'deposit', ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
            ");
            $stmt->execute([
                $transactionId, 
                $userId, 
                $amount, 
                $currency,
                "Admin Fund Addition: " . $adminNote
            ]);
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Funds added successfully',
                'new_balance' => $newBalance,
                'transaction_id' => $transactionId
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        
    } else {
        throw new Exception('Only POST method allowed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
