# Backend File Upload Instructions

## Important Backend Files to Upload

You need to upload these backend files to your server at `https://back.tesapay.com/`:

### 1. Features Toggle System
**File:** `backend/admin/features.php`  
**Upload to:** `https://back.tesapay.com/admin/features.php`

This file enables the feature toggle system in the admin dashboard.

### 2. Updated Banner Ads
**File:** `backend/admin/banner_ads.php`  
**Upload to:** `https://back.tesapay.com/admin/banner_ads.php`

This file includes support for banner display types (inline, popup, url).

### 3. Database Updates
Run the SQL commands in `db_updates.sql` on your database to add the `display_type` column to the `banner_ads` table.

```sql
ALTER TABLE banner_ads 
ADD COLUMN IF NOT EXISTS display_type ENUM('inline', 'popup', 'url') DEFAULT 'inline' 
AFTER status;

UPDATE banner_ads SET display_type = 'inline' WHERE display_type IS NULL;
```

## How to Upload via Namecheap cPanel

1. Log in to your Namecheap cPanel
2. Go to **File Manager**
3. Navigate to the folder where your backend is hosted
4. Upload the files to their respective directories
5. Make sure file permissions are set correctly (usually 644 for PHP files)

## Verification

After uploading:
- Visit `/doshitt/features` - should show the feature toggle page
- Create a banner ad and set its display type
- Banner ads should appear on the main page in the "In Ads" section
