<?php
require_once 'config/database.php';
require_once 'config/cors.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST method allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $userId = $input['user_id'] ?? null;
    $fromCurrency = $input['from_currency'] ?? null;
    $toCurrency = $input['to_currency'] ?? null;
    $amount = $input['amount'] ?? null;
    
    if (!$userId || !$fromCurrency || !$toCurrency || !$amount) {
        throw new Exception('All fields are required');
    }
    
    if ($amount <= 0) {
        throw new Exception('Amount must be greater than 0');
    }
    
    if ($fromCurrency === $toCurrency) {
        throw new Exception('Cannot convert to the same currency');
    }
    
    // Get exchange rate
    $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ? AND is_active = 1");
    $stmt->execute([$fromCurrency, $toCurrency]);
    $exchangeRate = $stmt->fetch();
    
    if (!$exchangeRate) {
        // Default exchange rates if not found in database
        $rates = [
            'NGN_USD' => 0.0013,
            'USD_NGN' => 770,
            'NGN_GBP' => 0.0010,
            'GBP_NGN' => 1000,
            'NGN_EUR' => 0.0012,
            'EUR_NGN' => 833,
            'USD_GBP' => 0.79,
            'GBP_USD' => 1.27,
            'USD_EUR' => 0.92,
            'EUR_USD' => 1.09,
            'GBP_EUR' => 1.16,
            'EUR_GBP' => 0.86
        ];
        
        $rateKey = $fromCurrency . '_' . $toCurrency;
        $rate = $rates[$rateKey] ?? 1;
    } else {
        $rate = $exchangeRate['rate'];
    }
    
    $convertedAmount = $amount * $rate;
    
    $pdo->beginTransaction();
    
    try {
        // Get source wallet
        $stmt = $pdo->prepare("SELECT id, balance FROM wallets WHERE user_id = ? AND currency = ? AND wallet_type = 'main'");
        $stmt->execute([$userId, $fromCurrency]);
        $fromWallet = $stmt->fetch();
        
        if (!$fromWallet) {
            throw new Exception('Source wallet not found');
        }
        
        if ($fromWallet['balance'] < $amount) {
            throw new Exception('Insufficient balance');
        }
        
        // Get destination wallet
        $stmt = $pdo->prepare("SELECT id, balance FROM wallets WHERE user_id = ? AND currency = ? AND wallet_type = 'main'");
        $stmt->execute([$userId, $toCurrency]);
        $toWallet = $stmt->fetch();
        
        if (!$toWallet) {
            throw new Exception('Destination wallet not found');
        }
        
        // Deduct from source wallet
        $newFromBalance = $fromWallet['balance'] - $amount;
        $stmt = $pdo->prepare("UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$newFromBalance, $fromWallet['id']]);
        
        // Add to destination wallet
        $newToBalance = $toWallet['balance'] + $convertedAmount;
        $stmt = $pdo->prepare("UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$newToBalance, $toWallet['id']]);
        
        // Record debit transaction
        $debitTxnId = 'CVT' . time() . rand(1000, 9999);
        $stmt = $pdo->prepare("
            INSERT INTO transactions (
                transaction_id, user_id, wallet_id, transaction_type, 
                amount, currency, status, description, created_at
            ) VALUES (?, ?, ?, 'debit', ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $debitTxnId,
            $userId,
            $fromWallet['id'],
            $amount,
            $fromCurrency,
            "Currency conversion to $toCurrency"
        ]);
        
        // Record credit transaction
        $creditTxnId = 'CVT' . time() . rand(1000, 9999);
        $stmt = $pdo->prepare("
            INSERT INTO transactions (
                transaction_id, user_id, wallet_id, transaction_type, 
                amount, currency, status, description, created_at
            ) VALUES (?, ?, ?, 'credit', ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $creditTxnId,
            $userId,
            $toWallet['id'],
            $convertedAmount,
            $toCurrency,
            "Currency conversion from $fromCurrency"
        ]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Currency converted successfully',
            'exchange_rate' => $rate,
            'converted_amount' => $convertedAmount,
            'from_balance' => $newFromBalance,
            'to_balance' => $newToBalance
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
