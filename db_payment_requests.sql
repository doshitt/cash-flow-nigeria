-- Payment Requests Table for MOMO and Crypto Transfers
CREATE TABLE IF NOT EXISTS payment_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    transfer_type ENUM('momo', 'crypto') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    recipient_info TEXT NOT NULL,
    description TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exchange Rates Table
CREATE TABLE IF NOT EXISTS exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    fee_percentage DECIMAL(5,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_currency_pair (from_currency, to_currency),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_percentage) VALUES
('NGN', 'USD', 0.0013, 1.5),
('USD', 'NGN', 750.00, 1.5),
('NGN', 'GBP', 0.0011, 1.5),
('GBP', 'NGN', 920.00, 1.5),
('NGN', 'EUR', 0.0012, 1.5),
('EUR', 'NGN', 810.00, 1.5),
('NGN', 'GHS', 0.015, 1.5),
('GHS', 'NGN', 65.00, 1.5),
('USD', 'GHS', 12.00, 1.5),
('GHS', 'USD', 0.083, 1.5)
ON DUPLICATE KEY UPDATE rate=VALUES(rate);