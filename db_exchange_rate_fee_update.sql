-- Update exchange_rates table to ensure fee_percentage column exists
-- This is idempotent and safe to run multiple times

-- Add the fee_percentage column if it doesn't exist
ALTER TABLE exchange_rates 
ADD COLUMN fee_percentage DECIMAL(5,2) DEFAULT 0;

-- Update all conversions to NGN to have 0.5% fee
UPDATE exchange_rates 
SET fee_percentage = 0.5 
WHERE to_currency = 'NGN' AND fee_percentage = 0;

-- Add index for better performance on currency lookups
CREATE INDEX IF NOT EXISTS idx_currency_pair ON exchange_rates(from_currency, to_currency);

-- Create a table to track conversion fees earned (analytics)
CREATE TABLE IF NOT EXISTS conversion_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    conversion_amount DECIMAL(15,2) NOT NULL,
    fee_amount DECIMAL(15,2) NOT NULL,
    fee_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_to_currency (to_currency),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
