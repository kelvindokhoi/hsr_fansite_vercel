<?php
require_once '../../config/database.php';
require_once 'config.php';

// Disable display errors to prevent JSON corruption
ini_set('display_errors', 0);
error_reporting(E_ALL);

$debug_log = [];

function logDebug($message, $data = null) {
    global $debug_log;
    $entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'data' => $data
    ];
    $debug_log[] = $entry;
}

function sendResponse($success, $message, $data = []) {
    global $debug_log;
    $response = [
        'success' => $success,
        'message' => $message,
        'debug_log' => $debug_log
    ];
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit();
}

logDebug("Script started. POST data:", $_POST);
logDebug("FILES data:", $_FILES);


// Get token from Authorization header
$headers = getallheaders();
$authorization = isset($headers['Authorization'])
    ? $headers['Authorization']
    : (isset($headers['authorization']) ? $headers['authorization'] : '');

if (empty($authorization)) {
    http_response_code(401);
    sendResponse(false, "No token provided");
}

$token = str_replace('Bearer ', '', $authorization);

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    sendResponse(false, "Database connection failed");
}

// INLINE TOKEN VERIFICATION
try {
    $decoded = json_decode(base64_decode($token), true);

    if (!$decoded || !isset($decoded['user_id']) || !isset($decoded['exp'])) {
        throw new Exception("Invalid token format");
    }

    // Check if token expired
    if ($decoded['exp'] < time()) {
        http_response_code(401);
        sendResponse(false, "Token expired");
    }

    // Fetch admin role ID dynamically
    $adminRoleQuery = "SELECT id FROM roles WHERE role_name = 'admin' LIMIT 1";
    $adminStmt = $db->prepare($adminRoleQuery);
    $adminStmt->execute();
    $adminRole = $adminStmt->fetch(PDO::FETCH_ASSOC);

    if (!$adminRole) {
        throw new Exception("Admin role not found");
    }

    $adminRoleId = $adminRole['id'];

    // Fetch user including role_id
    $query = "SELECT role_id FROM users WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $decoded['user_id'], PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        sendResponse(false, "User not found");
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check if user is admin
    if ($user['role_id'] != $adminRoleId) {
        http_response_code(403);
        sendResponse(false, "Access denied. Admin privileges required.");
    }

} catch (Exception $e) {
    http_response_code(401);
    sendResponse(false, "Invalid token: " . $e->getMessage());
}

// Get form data
$name = $_POST['name'] ?? '';
$rarity = $_POST['rarity'] ?? '';
$element = $_POST['element'] ?? '';
$path = $_POST['path'] ?? '';
$description = $_POST['description'] ?? '';

// Validate required fields
if (empty($name) || empty($rarity) || empty($element) || empty($path)) {
    http_response_code(400);
    sendResponse(false, "Missing required fields");
}

// Handle image upload
$imageName = null;

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $imageFile = $_FILES['image'];
    $imageTmpName = $imageFile['tmp_name'];
    $imageType = $imageFile['type'];
    $imageSize = $imageFile['size'];
    
    // Validate image type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($imageType, $allowedTypes)) {
        sendResponse(false, "Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed");
    }
    
    // Validate image size (max 5MB)
    if ($imageSize > 5 * 1024 * 1024) {
        sendResponse(false, "Image size too large. Maximum 5MB allowed");
    }
    
    // Generate image name based on character name (always png)
    $imageName = str_replace(' ', '_', $name) . '_portrait.png';
    $imagePath = IMAGE_UPLOAD_PATH . $imageName;
    
    // Create directory if it doesn't exist
    $imageDir = dirname($imagePath);
    if (!is_dir($imageDir)) {
        if (!mkdir($imageDir, 0777, true)) {
            logDebug("Failed to create directory");
            sendResponse(false, "Failed to create images directory");
        }
    }
    
    // Move and process image
    if (move_uploaded_file($imageTmpName, $imagePath)) {
        logDebug("File moved successfully");
    } else {
        logDebug("Failed to move file", ['tmp' => $imageTmpName, 'dest' => $imagePath]);
        sendResponse(false, "Failed to move uploaded file");
    }
}

try {
    // Modified for PostgreSQL with RETURNING id
    $query = "INSERT INTO characters (name, rarity, element, path) VALUES (:name, :rarity, :element, :path) RETURNING id";
    $stmt = $db->prepare($query);

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':rarity', $rarity);
    $stmt->bindParam(':element', $element);
    $stmt->bindParam(':path', $path);

    if ($stmt->execute()) {
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        sendResponse(true, "Character added successfully", ["id" => $result['id']]);
    } else {
        sendResponse(false, "Failed to add character");
    }
} catch (PDOException $e) {
    http_response_code(500);
    sendResponse(false, "Database error: " . $e->getMessage());
}
?>
