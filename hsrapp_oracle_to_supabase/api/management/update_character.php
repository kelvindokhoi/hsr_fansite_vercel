<?php
require_once '../../config/database.php';
require_once 'config.php';

// Disable display errors to prevent JSON corruption
ini_set('display_errors', 0);

header("Content-Type: application/json");

// Get token from Authorization header
$headers = getallheaders();
$authorization = isset($headers['Authorization'])
    ? $headers['Authorization']
    : (isset($headers['authorization']) ? $headers['authorization'] : '');

if (empty($authorization)) {
    http_response_code(401);
    echo json_encode(["error" => "No token provided"]);
    exit();
}

$token = str_replace('Bearer ', '', $authorization);

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
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
        echo json_encode(["error" => "Token expired"]);
        exit();
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
        echo json_encode(["error" => "User not found"]);
        exit();
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check if user is admin
    if ($user['role_id'] != $adminRoleId) {
        http_response_code(403);
        echo json_encode(["error" => "Access denied. Admin privileges required."]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token: " . $e->getMessage()]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get form data
    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $element = $_POST['element'] ?? '';
    $path = $_POST['path'] ?? '';
    $rarity = $_POST['rarity'] ?? 5;
    $description = $_POST['description'] ?? '';
    
    // Validate required fields
    if (empty($id) || empty($name) || empty($element) || empty($path)) {
        echo json_encode(['success' => false, 'message' => 'ID, name, element, and path are required']);
        exit();
    }
    
    // Check if character exists and get current name for potential image renaming
    $currentCharacter = $checkStmt->fetch(PDO::FETCH_ASSOC);
    $oldName = $currentCharacter['name'];
    $currentExt = $currentCharacter['image_extension'] ?? 'png';

    // Handle image upload (optional)
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        // ... (Image upload logic remains largely the same)
        $imageFile = $_FILES['image'];
        $imageTmpName = $imageFile['tmp_name'];
        $imageType = $imageFile['type'];
        
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (in_array($imageType, $allowedTypes)) {
            $ext = pathinfo($imageFile['name'], PATHINFO_EXTENSION) ?: 'png';
            if (strtolower($ext) === 'jpeg') $ext = 'jpg';
            $currentExt = $ext;
            
            $imageName = str_replace(' ', '_', $name) . '_portrait.' . $currentExt;
            $imagePath = IMAGE_UPLOAD_PATH . $imageName;
            
            $imageDir = dirname($imagePath);
            if (!is_dir($imageDir)) {
                mkdir($imageDir, 0777, true);
            }
            if (!move_uploaded_file($imageTmpName, $imagePath)) {
                error_log("Failed to move uploaded file to $imagePath");
            }
        }
    } else if ($oldName !== $name) {
        // Rename image if name changed - use the known extension
        $oldPath = IMAGE_UPLOAD_PATH . str_replace(' ', '_', $oldName) . '_portrait.' . $currentExt;
        $newPath = IMAGE_UPLOAD_PATH . str_replace(' ', '_', $name) . '_portrait.' . $currentExt;
        
        if (file_exists($oldPath)) {
            rename($oldPath, $newPath);
        } else {
            // Fallback: search for potential files if DB was out of sync
            foreach (['png', 'jpg', 'webp'] as $fe) {
                $oldP = IMAGE_UPLOAD_PATH . str_replace(' ', '_', $oldName) . '_portrait.' . $fe;
                $newP = IMAGE_UPLOAD_PATH . str_replace(' ', '_', $name) . '_portrait.' . $fe;
                if (file_exists($oldP)) {
                    rename($oldP, $newP);
                    $currentExt = $fe;
                    break;
                }
            }
        }
    }

    // Update character in database
    $sql = "UPDATE characters SET name = :name, element = :element, path = :path, rarity = :rarity, description = :description, image_extension = :image_extension WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':element', $element);
    $stmt->bindParam(':path', $path);
    $stmt->bindParam(':rarity', $rarity);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':image_extension', $currentExt);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Character updated successfully'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update character']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
