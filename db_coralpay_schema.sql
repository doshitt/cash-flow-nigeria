-- CoralPay VAS Transactions Table
CREATE TABLE IF NOT EXISTS `coralpay_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `biller_type` enum('airtime','data','electricity','tv','betting') NOT NULL,
  `customer_id` varchar(100) NOT NULL COMMENT 'Phone number, meter number, smartcard number, etc.',
  `package_slug` varchar(100) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `payment_reference` varchar(100) NOT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `coralpay_response` text DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL COMMENT 'Token for electricity and other services',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  UNIQUE KEY `payment_reference` (`payment_reference`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`),
  KEY `biller_type` (`biller_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add index for faster queries
CREATE INDEX idx_user_biller ON coralpay_transactions(user_id, biller_type);
CREATE INDEX idx_created_at ON coralpay_transactions(created_at DESC);
