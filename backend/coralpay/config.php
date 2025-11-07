<?php
// CoralPay VAS API Configuration
class CoralPayConfig {
    // API Credentials (IMPORTANT: Replace with your actual credentials)
    const USERNAME = 'Tesapay';
    const PASSWORD = 'Tesapay113#';
    
    // API URLs
    const TEST_BASE_URL = 'https://sandbox1.coralpay.com/coralpay-vas/api';
    const PROD_BASE_URL = 'https://coralpay.com/vas/api'; // Will be provided in production
    
    // Use test mode by default
    const USE_TEST_MODE = true;
    
    public static function getBaseUrl() {
        return self::USE_TEST_MODE ? self::TEST_BASE_URL : self::PROD_BASE_URL;
    }
    
    public static function getAuthHeader() {
        $credentials = base64_encode(self::USERNAME . ':' . self::PASSWORD);
        return 'Basic ' . $credentials;
    }
    
    public static function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = self::getBaseUrl() . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $headers = [
            'Authorization: ' . self::getAuthHeader(),
            'Content-Type: application/json',
            'Accept: application/json'
        ];
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return [
                'success' => false,
                'error' => $error,
                'httpCode' => $httpCode
            ];
        }
        
        $result = json_decode($response, true);
        return [
            'success' => $httpCode >= 200 && $httpCode < 300,
            'data' => $result,
            'httpCode' => $httpCode
        ];
    }
}
?>
