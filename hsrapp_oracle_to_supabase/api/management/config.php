<?php
// Image path configuration - Update this for Oracle Cloud
// On many Linux instances, this might be something like '/var/www/html/public/images/'
define('IMAGE_UPLOAD_PATH', getenv('IMAGE_UPLOAD_PATH') ?: 'C:/Users/BTB/Documents/Fall 2025/UI/hsr_fansite/public/images/');

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
