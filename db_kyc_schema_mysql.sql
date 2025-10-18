-- KYC System Database Schema for TesaPay (MySQL/MariaDB Compatible)

-- Main KYC table
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_type ENUM('individual', 'business') DEFAULT 'individual',
  kyc_tier ENUM('tier_0', 'tier_1', 'tier_2') DEFAULT 'tier_0',
  verification_status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
  
  -- Personal Details
  full_name VARCHAR(255),
  nationality VARCHAR(100),
  date_of_birth DATE,
  phone_number VARCHAR(20),
  
  -- Address Details
  residential_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Business Details (optional)
  company_name VARCHAR(255),
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  business_address TEXT,
  
  -- Admin Review
  reviewed_by INT,
  reviewed_at DATETIME,
  rejection_reason TEXT,
  admin_comments TEXT,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- KYC Documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kyc_verification_id INT NOT NULL,
  document_type ENUM(
    'passport', 'national_id', 'drivers_license', 'voters_card',
    'utility_bill', 'bank_statement', 'tax_document',
    'cac_certificate', 'board_resolution', 'company_address_proof'
  ) NOT NULL,
  document_name VARCHAR(255),
  file_path VARCHAR(500),
  file_url TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_kyc_verification (kyc_verification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints (run this after confirming users table exists)
-- ALTER TABLE kyc_verifications ADD CONSTRAINT fk_kyc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE kyc_documents ADD CONSTRAINT fk_kyc_doc FOREIGN KEY (kyc_verification_id) REFERENCES kyc_verifications(id) ON DELETE CASCADE;

-- Add KYC tier to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS kyc_tier ENUM('tier_0', 'tier_1', 'tier_2') DEFAULT 'tier_0',
ADD COLUMN IF NOT EXISTS kyc_status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending';

-- Create trigger to update user's KYC status
DROP TRIGGER IF EXISTS update_user_kyc_status;

DELIMITER //
CREATE TRIGGER update_user_kyc_status
AFTER UPDATE ON kyc_verifications
FOR EACH ROW
BEGIN
  IF NEW.verification_status = 'approved' THEN
    UPDATE users 
    SET kyc_tier = NEW.kyc_tier, 
        kyc_status = NEW.verification_status
    WHERE id = NEW.user_id;
  ELSE
    UPDATE users 
    SET kyc_status = NEW.verification_status
    WHERE id = NEW.user_id;
  END IF;
END//
DELIMITER ;
