// API Configuration for DoshiTT Admin Dashboard
export const ADMIN_API_CONFIG = {
  // Backend base URL - change this when deploying to production
  BACKEND_BASE_URL: 'http://localhost:8080/backend/admin',
  
  // API endpoints
  ENDPOINTS: {
    DASHBOARD_STATS: '/dashboard_stats.php',
    TRANSACTIONS: '/transactions.php',
    CUSTOMERS: '/customers.php',
    DISPUTES: '/disputes.php',
    REFUNDS: '/refunds.php',
    PAYMENT_REQUESTS: '/payment_requests.php',
    COUPONS: '/coupons.php',
    EXCHANGE_RATES: '/exchange_rates.php',
    REFERRALS: '/referrals.php',
    CARDS: '/cards.php',
    NOTIFICATIONS: '/notifications.php',
    BANNER_ADS: '/banner_ads.php',
    TEAM: '/team.php',
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || ''),
  },
};

// Helper function to build full API URLs
export const getAdminApiUrl = (endpoint: string): string => {
  const runtimeBase = typeof window !== 'undefined' ? (localStorage.getItem('admin_backend_url') || '') : '';
  const base = runtimeBase || ADMIN_API_CONFIG.BACKEND_BASE_URL;
  return `${base}${endpoint}`;
};