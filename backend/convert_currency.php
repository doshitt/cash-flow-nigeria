<?php
require_once 'config/database.php';
require_once 'config/cors.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Ensure exchange_rates schema has required columns
    try {
        $hasFee = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'fee_percentage'")->fetchColumn();
        if ((int)$hasFee === 0) {
            $pdo->exec("ALTER TABLE exchange_rates ADD COLUMN fee_percentage DECIMAL(5,2) DEFAULT 0");
        }
        $hasUpdated = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'updated_at'")->fetchColumn();
        if ((int)$hasUpdated === 0) {
            $pdo->exec("ALTER TABLE exchange_rates ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        }
        $hasStatus = $pdo->query("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exchange_rates' AND COLUMN_NAME = 'status'")->fetchColumn();
        if ((int)$hasStatus === 0) {
            $pdo->exec("ALTER TABLE exchange_rates ADD COLUMN status ENUM('active','inactive') DEFAULT 'active'");
        }
    } catch (Exception $e) {
        // Ignore schema adjustment errors
    }
    
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
    
    // Check if auto mode is enabled and sync rates if needed
    $autoModeStmt = $pdo->query("SELECT setting_value FROM system_settings WHERE setting_key = 'exchange_rate_auto_mode'");
    $autoMode = $autoModeStmt->fetch();
    
    if ($autoMode && $autoMode['setting_value'] == '1') {
        // Check if rates are stale (older than 1 hour)
        try {
            $checkStmt = $pdo->query("SELECT MAX(updated_at) as last_update FROM exchange_rates");
            $lastUpdate = $checkStmt->fetch();
        } catch (Exception $e) {
            $lastUpdate = ['last_update' => null];
        }
        
        if (!$lastUpdate || empty($lastUpdate['last_update']) || strtotime($lastUpdate['last_update']) < strtotime('-1 hour')) {
            // Fetch and update rates from API
            $apiResponse = @file_get_contents('https://api.exchangerate-api.com/v4/latest/NGN');
            if ($apiResponse) {
                $apiData = json_decode($apiResponse, true);
                if (isset($apiData['rates'])) {
                    $rates = $apiData['rates'];
                    $pairs = [
                        ['from' => 'NGN', 'to' => 'USD', 'rate' => $rates['USD'], 'fee' => 0],
                        ['from' => 'USD', 'to' => 'NGN', 'rate' => 1 / $rates['USD'], 'fee' => 0.5],
                        ['from' => 'NGN', 'to' => 'GBP', 'rate' => $rates['GBP'], 'fee' => 0],
                        ['from' => 'GBP', 'to' => 'NGN', 'rate' => 1 / $rates['GBP'], 'fee' => 0.5],
                        ['from' => 'NGN', 'to' => 'EUR', 'rate' => $rates['EUR'], 'fee' => 0],
                        ['from' => 'EUR', 'to' => 'NGN', 'rate' => 1 / $rates['EUR'], 'fee' => 0.5],
                        ['from' => 'NGN', 'to' => 'GHS', 'rate' => $rates['GHS'], 'fee' => 0],
                        ['from' => 'GHS', 'to' => 'NGN', 'rate' => 1 / $rates['GHS'], 'fee' => 0.5],
                    ];
                    
                    $updateStmt = $pdo->prepare("
                        INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_percentage, status)
                        VALUES (:from, :to, :rate, :fee, 'active')
                        ON DUPLICATE KEY UPDATE rate = :rate, fee_percentage = :fee, updated_at = NOW()
                    ");
                    
                    foreach ($pairs as $pair) {
                        $updateStmt->execute([
                            'from' => $pair['from'],
                            'to' => $pair['to'],
                            'rate' => $pair['rate'],
                            'fee' => $pair['fee']
                        ]);
                    }
                }
            }
        }
    }

    // Get exchange rate and fee percentage (with fallback if column doesn't exist)
    try {
        $stmt = $pdo->prepare("SELECT rate, fee_percentage FROM exchange_rates WHERE from_currency = ? AND to_currency = ? LIMIT 1");
        $stmt->execute([$fromCurrency, $toCurrency]);
        $exchangeRate = $stmt->fetch();
    } catch (PDOException $e) {
        // Fallback if fee_percentage column doesn't exist yet
        $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE from_currency = ? AND to_currency = ? LIMIT 1");
        $stmt->execute([$fromCurrency, $toCurrency]);
        $exchangeRate = $stmt->fetch();
        if ($exchangeRate) {
            $exchangeRate['fee_percentage'] = ($toCurrency === 'NGN') ? 0.5 : 0;
        }
    }
    
    if (!$exchangeRate) {
        // Try live rate from API using fromCurrency as base
        $rate = null;
        $feePercentage = ($toCurrency === 'NGN') ? 0.5 : 0;
        $apiResp = @file_get_contents('https://api.exchangerate-api.com/v4/latest/' . urlencode($fromCurrency));
        if ($apiResp) {
            $data = json_decode($apiResp, true);
            if (isset($data['rates'][$toCurrency])) {
                $rate = (float)$data['rates'][$toCurrency];
            }
        }
        // Fallback: compute via NGN base if direct base not available
        if ($rate === null) {
            $apiResp2 = @file_get_contents('https://api.exchangerate-api.com/v4/latest/NGN');
            if ($apiResp2) {
                $d2 = json_decode($apiResp2, true);
                if (isset($d2['rates'][$fromCurrency]) && isset($d2['rates'][$toCurrency]) && (float)$d2['rates'][$fromCurrency] > 0) {
                    $rate = (1 / (float)$d2['rates'][$fromCurrency]) * (float)$d2['rates'][$toCurrency];
                }
            }
        }
        // Final fallback to static rates
        if ($rate === null) {
            $defaults = [
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
            $rate = $defaults[$rateKey] ?? 1;
        }
    } else {
        $rate = (float)$exchangeRate['rate'];
        $feePercentage = isset($exchangeRate['fee_percentage']) ? (float)$exchangeRate['fee_percentage'] : 0;
    }
    
    $convertedAmount = $amount * $rate;
    
    // Apply conversion fee (for conversions to NGN)
    $conversionFee = ($feePercentage > 0) ? ($convertedAmount * ($feePercentage / 100)) : 0;
    $finalAmount = $convertedAmount - $conversionFee;
    
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
        
        // Add to destination wallet (final amount after fee)
        $newToBalance = $toWallet['balance'] + $finalAmount;
        $stmt = $pdo->prepare("UPDATE wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$newToBalance, $toWallet['id']]);
        
        // Record debit transaction (withdrawal from source currency)
        $debitTxnId = 'CVT' . time() . rand(1000, 9999);
        $stmt = $pdo->prepare("
            INSERT INTO transactions (
                transaction_id, user_id, transaction_type, 
                amount, currency, status, description, created_at
            ) VALUES (?, ?, 'withdrawal', ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $debitTxnId,
            $userId,
            $amount,
            $fromCurrency,
            "Currency conversion to $toCurrency"
        ]);
        
        // Record credit transaction (deposit to destination currency)
        $creditTxnId = 'CVT' . time() . rand(1000, 9999);
        $description = "Currency conversion from $fromCurrency";
        if ($conversionFee > 0) {
            $description .= " (Fee: " . number_format($conversionFee, 2) . " $toCurrency)";
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO transactions (
                transaction_id, user_id, transaction_type, 
                amount, currency, status, description, created_at
            ) VALUES (?, ?, 'deposit', ?, ?, 'completed', ?, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([
            $creditTxnId,
            $userId,
            $finalAmount,
            $toCurrency,
            $description
        ]);
        
        // Create notification for currency conversion (if table exists)
        try {
            $notificationId = 'NOT' . time() . rand(1000, 9999);
            $stmt = $pdo->prepare("
                INSERT INTO notifications (
                    id, user_id, type, title, message, amount, currency, timestamp, `read`
                ) VALUES (?, ?, 'success', ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)
            ");
            $stmt->execute([
                $notificationId,
                $userId,
                'Currency Converted',
                "Successfully converted {$fromCurrency} " . number_format($amount, 2) . " to {$toCurrency} " . number_format($finalAmount, 2),
                $finalAmount,
                $toCurrency
            ]);
        } catch (Exception $notifError) {
            // Silently continue if notifications table doesn't exist
            error_log("Notification creation failed: " . $notifError->getMessage());
        }
        
        // Track conversion fee for analytics (if table exists)
        if ($conversionFee > 0) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO conversion_fees (
                        transaction_id, user_id, from_currency, to_currency,
                        conversion_amount, fee_amount, fee_percentage
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $creditTxnId,
                    $userId,
                    $fromCurrency,
                    $toCurrency,
                    $convertedAmount,
                    $conversionFee,
                    $feePercentage
                ]);
            } catch (Exception $feeError) {
                // Silently continue if conversion_fees table doesn't exist
                error_log("Fee tracking failed: " . $feeError->getMessage());
            }
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Currency converted successfully',
            'exchange_rate' => $rate,
            'converted_amount' => $convertedAmount,
            'conversion_fee' => $conversionFee,
            'final_amount' => $finalAmount,
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