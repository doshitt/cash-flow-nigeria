-- Schema for Crypto and MOMO transfer fees configuration

-- Crypto fees table
CREATE TABLE IF NOT EXISTS crypto_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crypto_type VARCHAR(20) NOT NULL,
    network_type VARCHAR(50) NOT NULL,
    blockchain_fee DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_crypto_network (crypto_type, network_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Platform fees for crypto (tiered based on amount)
CREATE TABLE IF NOT EXISTS crypto_platform_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    min_amount DECIMAL(10,2) NOT NULL,
    max_amount DECIMAL(10,2) DEFAULT NULL,
    fee_type ENUM('percentage', 'fixed') NOT NULL,
    fee_value DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MOMO fees table
CREATE TABLE IF NOT EXISTS momo_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    min_amount DECIMAL(10,2) NOT NULL,
    max_amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default crypto blockchain fees
INSERT INTO crypto_fees (crypto_type, network_type, blockchain_fee, min_amount) VALUES
('USDT', 'BSC (BEP20)', 2.00, 10.00),
('USDT', 'TRON (TRC20)', 2.00, 3.00),
('USDT', 'Ethereum (ERC20)', 5.00, 10.00),
('USDT', 'SOL', 2.00, 10.00),
('USDT', 'Polygon (POS)', 2.00, 2.00),
('USDC', 'BSC (BEP20)', 1.00, 2.00),
('USDC', 'SOL', 1.00, 2.00),
('Ethereum', 'Ethereum (ERC20)', 2.00, 1.00),
('Ethereum', 'Arbitrum One', 1.00, 1.00)
ON DUPLICATE KEY UPDATE 
    blockchain_fee = VALUES(blockchain_fee),
    min_amount = VALUES(min_amount);

-- Insert default crypto platform fees (tiered)
INSERT INTO crypto_platform_fees (min_amount, max_amount, fee_type, fee_value) VALUES
(1.00, 49.99, 'percentage', 10.00),
(50.00, 299.99, 'percentage', 5.00),
(300.00, 499.99, 'percentage', 3.00),
(500.00, NULL, 'fixed', 2.00)
ON DUPLICATE KEY UPDATE 
    fee_type = VALUES(fee_type),
    fee_value = VALUES(fee_value);

-- Insert default MOMO fees
INSERT INTO momo_fees (min_amount, max_amount, platform_fee) VALUES
(5.00, 199.99, 5.00),
(200.00, 1000.00, 10.00)
ON DUPLICATE KEY UPDATE 
    platform_fee = VALUES(platform_fee);

-- Add indexes for performance
CREATE INDEX idx_crypto_type ON crypto_fees(crypto_type, network_type);
CREATE INDEX idx_crypto_platform_amount ON crypto_platform_fees(min_amount, max_amount);
CREATE INDEX idx_momo_amount ON momo_fees(min_amount, max_amount);
