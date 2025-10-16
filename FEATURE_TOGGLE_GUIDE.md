# Feature Toggle System - Implementation Guide

## Overview
The admin dashboard now includes a comprehensive feature toggle system that allows administrators to control which features are visible and accessible to users on the platform.

## Admin Access
- **Admin Dashboard URL**: `/doshitt`
- **Features Page**: `/doshitt/features`

## Available Features to Toggle
1. **Bank Transfer (Nigeria)** - Send money to Nigerian bank accounts
2. **International Transfer** - Send money to international bank accounts
3. **TesaPay User Transfer** - Send money to other TesaPay users
4. **Airtime Purchase** - Buy airtime for any network
5. **Data Purchase** - Buy data bundles
6. **Add Money via Bank** - Add funds via bank transfer
7. **Add Money via Card** - Add funds using debit/credit card
8. **Voucher/Gift Cards** - Create and redeem gift vouchers
9. **Savings** - Create and manage savings targets

## How It Works

### Backend
- **Database Table**: `platform_features` (auto-created on first access)
- **API Endpoint**: `/admin/features.php`
- **Actions**: 
  - GET: Fetch all features with their enabled/disabled status
  - POST: Toggle feature on/off

### Frontend
- **Hook**: `useFeatures()` - Provides `isFeatureEnabled(featureId)` function
- **Cache**: Features are cached for 5 minutes to reduce API calls
- **Default Behavior**: If feature status cannot be fetched, features default to enabled

### Protected Components
The following pages/components check feature toggles:
- Transfer page - checks `bank_transfer`, `international_transfer`, `tesapay_transfer`
- Airtime page - checks `airtime`
- Vouchers page - checks `voucher`
- Savings page - checks `savings`
- ServiceGrid component - filters services based on feature status

## Safety Features
1. **Graceful Degradation**: If feature API fails, features remain enabled
2. **Automatic Redirects**: Users accessing disabled feature pages are redirected to home
3. **UI Filtering**: Disabled features are automatically hidden from service grids
4. **No Breaking Changes**: Disabling a feature only hides it from UI, doesn't break existing data

## Admin Usage
1. Navigate to `/doshitt/features`
2. View all platform features with their current status
3. Toggle any feature ON/OFF using the switch
4. Changes apply immediately across all user sessions
5. Users will see the updated feature availability on next page load or after cache expires

## Testing Checklist
- ✅ Database table created automatically
- ✅ Features initialize with default values
- ✅ Toggle switches update database
- ✅ Frontend reflects changes after cache refresh
- ✅ Disabled features hidden from ServiceGrid
- ✅ Direct access to disabled feature pages redirects to home
- ✅ Transfer page shows only enabled transfer types
- ✅ No errors when features are toggled

## Database Schema
```sql
CREATE TABLE platform_features (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## Notes for Deployment
1. Upload `backend/admin/features.php` to your backend server
2. The database table will be created automatically on first access
3. All features are enabled by default
4. Admin can manage features from `/doshitt/features`
