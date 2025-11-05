# CoralPay VAS Integration Setup Instructions

## Overview
TesaPay has been integrated with CoralPay VAS API to enable live billing services including:
- ✅ Airtime Purchase (MTN, Airtel, Glo, 9Mobile)
- ✅ Data Bundles (All Nigerian networks)
- ✅ Electricity Bill Payment (All DISCOs)
- ✅ TV Subscriptions (DStv, GOtv, Startimes)

## Backend Setup

### 1. Upload Backend Files
Upload the following files to your backend server:

```
backend/
├── coralpay/
│   ├── config.php          # CoralPay API configuration
│   ├── billers.php         # Get billers and packages
│   ├── customer_lookup.php # Validate customer accounts
│   └── vend.php            # Process vend transactions
```

### 2. Database Setup
Import the CoralPay database schema:

```sql
-- Import db_coralpay_schema.sql into your database
-- This creates the coralpay_transactions table
```

Run this SQL command:
```bash
mysql -u piitzozc_tesapay -p piitzozc_tesapay < db_coralpay_schema.sql
```

### 3. Configure CoralPay Credentials

**IMPORTANT:** Update `backend/coralpay/config.php` with your actual CoralPay credentials:

```php
// Line 4-5: Replace with your CoralPay credentials
const USERNAME = 'your_actual_username_here';
const PASSWORD = 'your_actual_password_here';
```

**Getting Your Credentials:**
1. Contact CoralPay to create an account
2. Request API access for VAS services
3. They will provide:
   - Username
   - Password
   - Production API URL (when ready to go live)

### 4. Test vs Production Mode

By default, the integration uses CoralPay's test environment:

```php
// In backend/coralpay/config.php
const USE_TEST_MODE = true;  // Change to false for production
```

**Test Environment:**
- Base URL: `https://testdev.coralpay.com/vas/api`
- Use for development and testing
- No real transactions

**Production Environment:**
- Base URL: Will be provided by CoralPay
- Live transactions
- Real money

## Frontend Features

### Service Pages Created:
1. **Airtime Purchase** (`/airtime`)
   - Network selection with auto-detection
   - Quick amount buttons
   - Real-time vending via CoralPay

2. **Data Bundles** (`/data`)
   - Network selection
   - Dynamic package loading from CoralPay
   - Package details with pricing

3. **Electricity Bills** (`/electricity`)
   - DISCO selection (IKEDC, EKEDC, AEDC, PHEDC, IBEDC, KEDC, JEDC)
   - Meter validation (Prepaid/Postpaid)
   - Customer details display
   - Token generation for prepaid

4. **TV Subscription** (`/tv`)
   - Provider selection (DStv, GOtv, Startimes)
   - Smartcard validation
   - Package selection with pricing
   - Instant activation

## Testing Checklist

### Backend Testing:
- [ ] Upload all backend files to `/backend/coralpay/`
- [ ] Import database schema
- [ ] Update CoralPay credentials in config.php
- [ ] Test API endpoint: `your-domain.com/backend/coralpay/billers.php?action=groups`

### Frontend Testing:
- [ ] Test Airtime purchase flow
- [ ] Test Data bundle purchase
- [ ] Test Electricity meter validation and payment
- [ ] Test TV smartcard validation and subscription
- [ ] Verify wallet balance deduction
- [ ] Check transaction history logging

## API Endpoints

### Get Biller Groups
```
GET /backend/coralpay/billers.php?action=groups
```

### Get Billers
```
GET /backend/coralpay/billers.php?action=billers&groupId=1
```

### Get Packages
```
GET /backend/coralpay/billers.php?action=packages&billerSlug=MTN-DATA
```

### Customer Lookup
```
POST /backend/coralpay/customer_lookup.php
Body: {
  "customerId": "2324541",
  "billerSlug": "IKEDC",
  "productName": "IKEDC_PREPAID"
}
```

### Vend Value
```
POST /backend/coralpay/vend.php
Body: {
  "user_id": 1,
  "customerId": "08012345678",
  "packageSlug": "MTN-VTU",
  "amount": 1000,
  "customerName": "John Doe",
  "phoneNumber": "08012345678",
  "email": "john@example.com",
  "billerType": "airtime"
}
```

## Security Notes

1. **API Authentication:** All CoralPay requests use Basic Authentication
2. **IP Whitelisting:** In production, CoralPay will whitelist your server IP
3. **Wallet Validation:** System checks user balance before processing
4. **Auto Refund:** Failed transactions automatically refund user wallet
5. **Transaction Logging:** All transactions logged with CoralPay response

## Troubleshooting

### Issue: "Failed to fetch packages"
- **Solution:** Check CoralPay credentials in config.php
- Verify test mode URL is accessible
- Check PHP cURL is enabled

### Issue: "Insufficient wallet balance"
- **Solution:** User needs to fund their NGN wallet
- Minimum amounts vary by service

### Issue: "Customer lookup failed"
- **Solution:** Verify customer ID format (meter number, phone, smartcard)
- Check selected biller/product name matches CoralPay format

### Issue: "Transaction pending"
- **Solution:** Check CoralPay response in database
- Verify payment reference is unique
- Check wallet was debited correctly

## Production Deployment

Before going live:

1. **Get Production Credentials:**
   - Contact CoralPay for production access
   - Request IP whitelisting
   - Get production API URL

2. **Update Configuration:**
   ```php
   const USE_TEST_MODE = false;
   const PROD_BASE_URL = 'your_production_url_here';
   const USERNAME = 'production_username';
   const PASSWORD = 'production_password';
   ```

3. **Test Thoroughly:**
   - Test all services with real accounts
   - Verify wallet transactions
   - Check transaction logging
   - Test refund scenarios

4. **Monitor:**
   - Check transaction success rates
   - Monitor CoralPay response times
   - Review failed transactions
   - Set up alerts for errors

## Support

For CoralPay API support:
- Email: support@coralpay.com
- Documentation: Check VAS_API_CORALPAY_v1.9.3_1_2.pdf

For TesaPay integration issues:
- Review logs in `coralpay_transactions` table
- Check console errors in browser developer tools
- Verify backend error logs
