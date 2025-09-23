-- Tesa Pay Multi-Currency Fintech Database Schema
-- Created for multi-currency wallets, bank-to-bank transfers and international payments

-- Users table with phone/PIN authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    pin VARCHAR(255) NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    date_of_birth DATE,
    bvn VARCHAR(11),
    nin VARCHAR(20),
    profile_image_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    kyc_level ENUM('tier1', 'tier2', 'tier3') DEFAULT 'tier1',
    referral_code VARCHAR(20) UNIQUE,
    referred_by VARCHAR(20) NULL,
    biometric_enabled BOOLEAN DEFAULT FALSE,
    biometric_data TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User wallets table
CREATE TABLE wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    wallet_type ENUM('main', 'savings') DEFAULT 'main',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Banks table (Nigerian banks and international)
CREATE TABLE banks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bank_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    country VARCHAR(2) DEFAULT 'NG',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User bank accounts
CREATE TABLE user_bank_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bank_id INT NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_id) REFERENCES banks(id)
);

-- Paystack dedicated virtual accounts
CREATE TABLE virtual_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    assignment_reason VARCHAR(100) DEFAULT 'deposit',
    assigned BOOLEAN DEFAULT TRUE,
    currency VARCHAR(3) DEFAULT 'NGN',
    customer_id VARCHAR(100),
    customer_code VARCHAR(100),
    paystack_account_id VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payment requests table (for crypto and other manual verifications)
CREATE TABLE payment_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    payment_method ENUM('crypto', 'bank_transfer', 'card') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    crypto_type VARCHAR(10) DEFAULT NULL, -- USDT, BTC, etc
    crypto_network VARCHAR(20) DEFAULT NULL, -- TRC20, ERC20, etc
    transaction_hash VARCHAR(255) DEFAULT NULL,
    wallet_address VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT DEFAULT NULL,
    proof_image VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    transaction_type ENUM('transfer', 'transfer_received', 'deposit', 'withdrawal', 'airtime', 'data', 'bills', 'international') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    recipient_account VARCHAR(50),
    recipient_bank_id INT,
    recipient_name VARCHAR(255),
    description TEXT,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    reference VARCHAR(100),
    fee DECIMAL(10,2) DEFAULT 0.00,
    fee_amount DECIMAL(15,2) DEFAULT 0.00,
    recipient_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipient_bank_id) REFERENCES banks(id)
);

-- Bill payments table
CREATE TABLE bill_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bill_type ENUM('airtime', 'data', 'electricity', 'cable_tv', 'internet') NOT NULL,
    provider VARCHAR(100) NOT NULL,
    recipient_number VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id INT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- KYC documents table
CREATE TABLE kyc_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    document_type ENUM('passport', 'drivers_license', 'national_id', 'utility_bill') NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- OTP table for verification
CREATE TABLE otps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    phone VARCHAR(20),
    email VARCHAR(255),
    otp_code VARCHAR(6) NOT NULL,
    otp_type ENUM('registration', 'login', 'transaction', 'password_reset') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Exchange rates table (for international transfers)
CREATE TABLE exchange_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    referral_code VARCHAR(20) NOT NULL,
    bonus_amount DECIMAL(10,2) DEFAULT 0.00,
    is_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_id) REFERENCES users(id)
);

-- Gift Vouchers/Coupons table
CREATE TABLE gift_vouchers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    creator_user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status ENUM('active', 'redeemed', 'expired') DEFAULT 'active',
    redeemed_by_user_id INT NULL,
    redeemed_amount DECIMAL(15,2) NULL,
    platform_fee DECIMAL(15,2) NULL,
    redeemed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (redeemed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Voucher transactions (for tracking creation and redemption)
CREATE TABLE voucher_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_type ENUM('created', 'redeemed') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    transaction_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES gift_vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

-- Coupons table (keeping original for discount coupons)
CREATE TABLE coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0.00,
    max_discount DECIMAL(10,2),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INT DEFAULT 1,
    used_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User coupon usage
CREATE TABLE user_coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    coupon_id INT NOT NULL,
    transaction_id INT,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Insert sample Nigerian banks
INSERT INTO banks (bank_name, bank_code, country) VALUES
('Access Bank', '044', 'NG'),
('Guaranty Trust Bank', '058', 'NG'),
('United Bank for Africa', '033', 'NG'),
('Zenith Bank', '057', 'NG'),
('First Bank of Nigeria', '011', 'NG'),
('Ecobank Nigeria', '050', 'NG'),
('Stanbic IBTC Bank', '221', 'NG'),
('Sterling Bank', '232', 'NG'),
('Union Bank of Nigeria', '032', 'NG'),
('Wema Bank', '035', 'NG'),
('Fidelity Bank', '070', 'NG'),
('FCMB', '214', 'NG'),
('Kuda Bank', '090267', 'NG'),
('Opay', '999992', 'NG'),
('PalmPay', '999991', 'NG');

-- Insert sample exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('NGN', 'USD', 0.0013),
('NGN', 'GBP', 0.0010),
('NGN', 'EUR', 0.0012),
('USD', 'NGN', 770.00),
('GBP', 'NGN', 950.00),
('EUR', 'NGN', 850.00);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_user_bank_accounts_user_id ON user_bank_accounts(user_id);
CREATE INDEX idx_otps_phone ON otps(phone);
CREATE INDEX idx_otps_email ON otps(email);
CREATE INDEX idx_gift_vouchers_code ON gift_vouchers(code);
CREATE INDEX idx_gift_vouchers_creator ON gift_vouchers(creator_user_id);
CREATE INDEX idx_gift_vouchers_status ON gift_vouchers(status);
CREATE INDEX idx_voucher_transactions_voucher_id ON voucher_transactions(voucher_id);

-- User sessions table for session management (month-long sessions with inactivity timeout)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    login_method ENUM('phone_pin', 'biometric', 'password') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_sessions (user_id, is_active),
    INDEX idx_last_activity (last_activity)
);

-- Paystack integration tables
CREATE TABLE paystack_customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    customer_code VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_paystack (user_id)
);

-- Paystack transactions table
CREATE TABLE paystack_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_id INT,
    paystack_reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status ENUM('pending', 'success', 'failed', 'abandoned') NOT NULL,
    gateway_response TEXT,
    paid_at TIMESTAMP NULL,
    channel VARCHAR(50),
    authorization JSON,
    customer_code VARCHAR(100),
    fees DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_paystack_reference (paystack_reference),
    INDEX idx_paystack_status (status)
);

-- Paystack webhooks log
CREATE TABLE paystack_webhooks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(100) NOT NULL,
    paystack_reference VARCHAR(100),
    payload JSON NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_webhook_event (event_type),
    INDEX idx_webhook_processed (processed)
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_alert_email BOOLEAN DEFAULT TRUE,
    transaction_alert_email BOOLEAN DEFAULT TRUE,
    transaction_alert_sms BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_settings (user_id)
);

-- User cards table
CREATE TABLE IF NOT EXISTS user_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_number_encrypted TEXT NOT NULL,
    last_four_digits CHAR(4) NOT NULL,
    expiry_date VARCHAR(7) NOT NULL,
    cvv_encrypted TEXT NOT NULL,
    pin_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User activities table for audit logging
CREATE TABLE IF NOT EXISTS user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_activity (user_id, activity_type),
    INDEX idx_created_at (created_at)
);

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('transaction', 'system', 'promotion', 'push') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_notifications (user_id, is_read),
    INDEX idx_created_at (created_at)
);

-- Admin dashboard tables
-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_id VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('open', 'investigating', 'resolved', 'closed') DEFAULT 'open',
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin coupons table (separate from user gift vouchers)
CREATE TABLE IF NOT EXISTS admin_coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2) DEFAULT 0,
    max_uses INT NULL,
    current_uses INT DEFAULT 0,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Coupon usage table
CREATE TABLE IF NOT EXISTS admin_coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_id VARCHAR(50) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES admin_coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exchange rates table (admin managed)
CREATE TABLE IF NOT EXISTS admin_exchange_rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    fee_percentage DECIMAL(5,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_pair (from_currency, to_currency)
);

-- Banner ads table
CREATE TABLE IF NOT EXISTS banner_ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    position ENUM('top', 'middle', 'bottom') DEFAULT 'top',
    status ENUM('active', 'inactive', 'scheduled') DEFAULT 'active',
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    click_count INT DEFAULT 0,
    impression_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin team table
CREATE TABLE IF NOT EXISTS admin_team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'customer_care', 'kyc_audit', 'finance') NOT NULL,
    permissions JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Push notifications table
CREATE TABLE IF NOT EXISTS push_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_type ENUM('all', 'specific', 'group') NOT NULL,
    target_users JSON NULL,
    status ENUM('draft', 'scheduled', 'sent') DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_team(id) ON DELETE CASCADE
);

-- Real-time data tables and procedures
-- Transaction limits table
CREATE TABLE transaction_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    daily_transfer_limit DECIMAL(15,2) DEFAULT 200000.00,
    single_transaction_limit DECIMAL(15,2) DEFAULT 50000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 2000000.00,
    kyc_level ENUM('tier1', 'tier2', 'tier3') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User verification status table
CREATE TABLE user_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    bvn_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    face_verified BOOLEAN DEFAULT FALSE,
    id_document_verified BOOLEAN DEFAULT FALSE,
    address_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP NULL,
    verified_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES admin_team(id) ON DELETE SET NULL
);

-- Real-time analytics table
CREATE TABLE analytics_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_type ENUM('user_signup', 'transaction', 'login', 'deposit', 'withdrawal', 'transfer') NOT NULL,
    value DECIMAL(15,2) DEFAULT 1,
    currency VARCHAR(3) DEFAULT 'NGN',
    user_id INT NULL,
    transaction_id INT NULL,
    metadata JSON,
    date_recorded DATE NOT NULL,
    hour_recorded TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_analytics_date (date_recorded, hour_recorded),
    INDEX idx_analytics_type (metric_type),
    INDEX idx_analytics_user (user_id)
);

-- Savings targets table
CREATE TABLE savings_targets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'NGN',
    target_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Savings transactions table
CREATE TABLE savings_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    savings_target_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal') NOT NULL,
    transaction_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (savings_target_id) REFERENCES savings_targets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

-- Device tokens for push notifications
CREATE TABLE device_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    token VARCHAR(500) NOT NULL,
    platform ENUM('ios', 'android', 'web') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device (user_id, device_id)
);

-- Create triggers for real-time analytics
DELIMITER $$

CREATE TRIGGER after_user_insert 
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO analytics_data (metric_type, user_id, date_recorded, hour_recorded)
    VALUES ('user_signup', NEW.id, CURDATE(), HOUR(NOW()));
END$$

CREATE TRIGGER after_transaction_insert 
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO analytics_data (metric_type, value, currency, user_id, transaction_id, date_recorded, hour_recorded)
    VALUES (NEW.transaction_type, NEW.amount, NEW.currency, NEW.user_id, NEW.id, CURDATE(), HOUR(NOW()));
END$$

CREATE TRIGGER after_session_insert 
AFTER INSERT ON user_sessions
FOR EACH ROW
BEGIN
    INSERT INTO analytics_data (metric_type, user_id, date_recorded, hour_recorded)
    VALUES ('login', NEW.user_id, CURDATE(), HOUR(NOW()));
END$$

DELIMITER ;

-- Create views for dashboard analytics
CREATE VIEW daily_stats AS
SELECT 
    date_recorded,
    SUM(CASE WHEN metric_type = 'user_signup' THEN value ELSE 0 END) as new_users,
    SUM(CASE WHEN metric_type = 'transaction' THEN value ELSE 0 END) as total_transactions,
    SUM(CASE WHEN metric_type = 'deposit' THEN value ELSE 0 END) as total_deposits,
    SUM(CASE WHEN metric_type = 'withdrawal' THEN value ELSE 0 END) as total_withdrawals,
    SUM(CASE WHEN metric_type = 'transfer' THEN value ELSE 0 END) as total_transfers,
    COUNT(DISTINCT user_id) as active_users
FROM analytics_data 
GROUP BY date_recorded;

CREATE VIEW user_wallet_balances AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.phone,
    u.email,
    SUM(CASE WHEN w.currency = 'NGN' THEN w.balance ELSE 0 END) as ngn_balance,
    SUM(CASE WHEN w.currency = 'USD' THEN w.balance ELSE 0 END) as usd_balance,
    SUM(CASE WHEN w.currency = 'GBP' THEN w.balance ELSE 0 END) as gbp_balance,
    SUM(CASE WHEN w.currency = 'EUR' THEN w.balance ELSE 0 END) as eur_balance
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id AND w.is_active = TRUE
WHERE u.is_active = TRUE
GROUP BY u.id;

-- Insert default admin user (use bcrypt for password: 'admin123')
INSERT INTO admin_team (email, password, first_name, last_name, role, permissions) VALUES
('admin@tesapay.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Admin', 'super_admin', '["all"]');

-- Insert default exchange rates (remove and update with real-time API)
DELETE FROM exchange_rates;
INSERT INTO admin_exchange_rates (from_currency, to_currency, rate, fee_percentage, status) VALUES
('NGN', 'USD', 0.0013, 2.5, 'active'),
('NGN', 'GBP', 0.0010, 2.5, 'active'),
('NGN', 'EUR', 0.0012, 2.5, 'active'),
('USD', 'NGN', 770.00, 2.5, 'active'),
('GBP', 'NGN', 950.00, 2.5, 'active'),
('EUR', 'NGN', 850.00, 2.5, 'active');

-- Create stored procedures for common operations
DELIMITER $$

CREATE PROCEDURE CreateUserSession(
    IN p_user_id INT,
    IN p_session_token VARCHAR(255),
    IN p_device_info JSON,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_login_method ENUM('phone_pin', 'biometric', 'password')
)
BEGIN
    DECLARE session_duration INT DEFAULT 2592000; -- 30 days in seconds
    
    -- Deactivate old sessions
    UPDATE user_sessions 
    SET is_active = FALSE 
    WHERE user_id = p_user_id AND is_active = TRUE;
    
    -- Create new session
    INSERT INTO user_sessions (
        user_id, 
        session_token, 
        device_info, 
        ip_address, 
        user_agent, 
        login_method,
        expires_at
    ) VALUES (
        p_user_id, 
        p_session_token, 
        p_device_info, 
        p_ip_address, 
        p_user_agent, 
        p_login_method,
        DATE_ADD(NOW(), INTERVAL session_duration SECOND)
    );
END$$

CREATE PROCEDURE CleanupInactiveSessions()
BEGIN
    -- Mark sessions as inactive if no activity for 7 days
    UPDATE user_sessions 
    SET is_active = FALSE 
    WHERE last_activity < DATE_SUB(NOW(), INTERVAL 7 DAY) 
    AND is_active = TRUE;
    
    -- Delete expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
END$$

DELIMITER ;