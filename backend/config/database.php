<?php
// Database configuration
$host = 'localhost';
$dbname = 'piitzozc_tesapay';
$username = 'piitzozc_tesapay';
$password = '@Muilirhema1!';

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

// Common functions
function generateId($prefix = '') {
    return $prefix . time() . rand(1000, 9999);
}

function encryptData($data, $key = 'tesapay_encryption_key') {
    $cipher = "AES-256-CBC";
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($cipher));
    $encrypted = openssl_encrypt($data, $cipher, $key, 0, $iv);
    return base64_encode($encrypted . '::' . $iv);
}

function decryptData($data, $key = 'tesapay_encryption_key') {
    $cipher = "AES-256-CBC";
    list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
    return openssl_decrypt($encrypted_data, $cipher, $key, 0, $iv);
}
?>
