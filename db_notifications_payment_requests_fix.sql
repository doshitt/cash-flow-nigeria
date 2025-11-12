-- Fix for notifications table and payment_requests transaction_id column

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('success', 'error', 'warning', 'info', 'inflow', 'outflow') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    amount DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `read` BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add transaction_id column to payment_requests if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'payment_requests' 
    AND COLUMN_NAME = 'transaction_id');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE payment_requests ADD COLUMN transaction_id VARCHAR(50) UNIQUE AFTER id',
    'SELECT "Column transaction_id already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add transfer_type column if missing
SET @col_exists2 = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'payment_requests' 
    AND COLUMN_NAME = 'transfer_type');

SET @sql2 = IF(@col_exists2 = 0, 
    'ALTER TABLE payment_requests ADD COLUMN transfer_type VARCHAR(20) DEFAULT NULL AFTER transaction_id',
    'SELECT "Column transfer_type already exists"');

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Add description column if missing
SET @col_exists3 = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'payment_requests' 
    AND COLUMN_NAME = 'description');

SET @sql3 = IF(@col_exists3 = 0, 
    'ALTER TABLE payment_requests ADD COLUMN description TEXT DEFAULT NULL',
    'SELECT "Column description already exists"');

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Add recipient_info column if missing (should be JSON)
SET @col_exists4 = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'payment_requests' 
    AND COLUMN_NAME = 'recipient_info');

SET @sql4 = IF(@col_exists4 = 0, 
    'ALTER TABLE payment_requests ADD COLUMN recipient_info JSON DEFAULT NULL',
    'SELECT "Column recipient_info already exists"');

PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(`read`);
CREATE INDEX IF NOT EXISTS idx_payment_requests_transaction_id ON payment_requests(transaction_id);
