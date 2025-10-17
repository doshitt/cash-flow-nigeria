-- Add display_type column to banner_ads table
ALTER TABLE banner_ads 
ADD COLUMN IF NOT EXISTS display_type ENUM('inline', 'popup', 'url') DEFAULT 'inline' 
AFTER status;

-- Update existing banner_ads to have default display_type
UPDATE banner_ads SET display_type = 'inline' WHERE display_type IS NULL;
