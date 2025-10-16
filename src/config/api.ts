// API Configuration for TesaPay
export const API_CONFIG = {
  // Backend base URL - change this when deploying to production
  BACKEND_BASE_URL: 'https://back.tesapay.com',
  
  // API endpoints
  ENDPOINTS: {
    CREATE_VIRTUAL_ACCOUNT: '/create_virtual_account.php',
    PAYMENT_REQUESTS: '/payment_requests.php',
    WEBHOOK_HANDLER: '/webhook_handler.php',
    GIFT_VOUCHERS: '/gift_vouchers.php',
    TRANSFERS: '/transfers.php',
    CHANGE_PASSWORD: '/change_password.php',
    NOTIFICATION_SETTINGS: '/notification_settings.php',
    VERIFY_PIN: '/verify_pin.php',
    UPDATE_PIN: '/update_pin.php',
    ADD_CARD: '/add_card.php',
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Default user data for development
  DEV_USER: {
    user_id: 1,
    email: 'user@tesapay.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+2348123456789'
  }
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  const runtimeBase = typeof window !== 'undefined' ? (localStorage.getItem('tesapay_backend_url') || '') : '';
  const base = runtimeBase || API_CONFIG.BACKEND_BASE_URL;
  return `${base}${endpoint}`;
};