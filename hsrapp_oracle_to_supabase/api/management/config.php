<?php
// Image path configuration - Update this for Oracle Cloud
// On many Linux instances, this might be something like '/var/www/html/public/images/'
// Check environment variable first, then check common Linux path, then use relative fallback
$env_path = getenv('IMAGE_UPLOAD_PATH');
$linux_path = '/var/www/html/public/images/';
$curr_dir = __DIR__;
$is_inside_images = (basename($curr_dir) === 'images');

if ($env_path) {
    $final_path = $env_path;
} elseif ($is_inside_images) {
    $final_path = $curr_dir;
} elseif (is_dir($linux_path)) {
    $final_path = $linux_path;
} else {
    // Standard project structure fallback (.../api/management/ -> .../public/images/)
    $target = realpath(__DIR__ . '/../../../public/images/');
    $final_path = $target ? $target : __DIR__;
}

// Ensure it ends with a separator
define('IMAGE_UPLOAD_PATH', rtrim($final_path, '/\\') . DIRECTORY_SEPARATOR);

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
