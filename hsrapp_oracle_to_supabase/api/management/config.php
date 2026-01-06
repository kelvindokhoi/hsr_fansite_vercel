<?php
// Image path configuration - Update this for Oracle Cloud
// On many Linux instances, this might be something like '/var/www/html/public/images/'
// Check environment variable first, then check common Linux path, then use relative fallback
$env_path = getenv('IMAGE_UPLOAD_PATH');
$linux_path = '/var/www/html/public/images/';
$relative_path = realpath(__DIR__ . '/../../../public/images/') . DIRECTORY_SEPARATOR;

if ($env_path) {
    define('IMAGE_UPLOAD_PATH', $env_path);
} elseif (is_dir($linux_path)) {
    define('IMAGE_UPLOAD_PATH', $linux_path);
} else {
    define('IMAGE_UPLOAD_PATH', $relative_path);
}

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
