-- Fix exchange_rates table schema and add auto mode settings
-- Safe to run multiple times

-- Add status column if it doesn't exist
ALTER TABLE exchange_rates 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active';

-- Create system_settings table for auto mode configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Set automatic exchange rate mode as default
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('exchange_rate_auto_mode', '1', 'Automatically fetch exchange rates from Google (1 = enabled, 0 = manual)')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- Insert default exchange rates if they don't exist
INSERT IGNORE INTO exchange_rates (from_currency, to_currency, rate, fee_percentage, status)
VALUES 
('NGN', 'USD', 0.0013, 0, 'active'),
('USD', 'NGN', 770, 0.5, 'active'),
('NGN', 'GBP', 0.0010, 0, 'active'),
('GBP', 'NGN', 1000, 0.5, 'active'),
('NGN', 'EUR', 0.0012, 0, 'active'),
('EUR', 'NGN', 833, 0.5, 'active'),
('NGN', 'GHS', 0.015, 0, 'active'),
('GHS', 'NGN', 66.67, 0.5, 'active');
