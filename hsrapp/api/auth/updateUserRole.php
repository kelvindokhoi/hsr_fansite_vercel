<?php
require_once '../../config/database.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// ------------------------------
// 1. Extract + validate token
// ------------------------------
$headers = getallheaders();
$authorization = isset($headers['Authorization'])
    ? $headers['Authorization']
    : (isset($headers['authorization']) ? $headers['authorization'] : '');

if (empty($authorization)) {
    http_response_code(401);
    echo json_encode(["error" => "No authorization token provided"]);
    exit();
}

$token = str_replace("Bearer ", "", $authorization);
$decoded = json_decode(base64_decode($token), true);

if (!$decoded || !isset($decoded["user_id"]) || !isset($decoded["exp"])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit();
}

if ($decoded["exp"] < time()) {
    http_response_code(401);
    echo json_encode(["error" => "Token expired"]);
    exit();
}

$admin_requester_id = (int)$decoded["user_id"];

// ------------------------------
// 2. Parse POST body
// ------------------------------
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!isset($data["user_id"]) || !isset($data["role_name"])) {
    http_response_code(400);
    echo json_encode(["error" => "user_id and role_name required"]);
    exit();
}

$target_user_id = (int)$data["user_id"];
$new_role_name = $data["role_name"];

// ------------------------------
// 3. DB connection
// ------------------------------
try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
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

    // Fetch target role ID dynamically
    $targetRoleQuery = "SELECT id FROM roles WHERE role_name = :role_name LIMIT 1";
    $targetRoleStmt = $db->prepare($targetRoleQuery);
    $targetRoleStmt->bindParam(":role_name", $new_role_name);
    $targetRoleStmt->execute();

    if ($targetRoleStmt->rowCount() === 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid role name"]);
        exit();
    }

    $targetRole = $targetRoleStmt->fetch(PDO::FETCH_ASSOC);
    $targetRoleId = $targetRole['id'];

    // ---------------------------------------
    // 4. Make sure the requester is an admin
    // ---------------------------------------
    $checkAdminQuery = "
        SELECT role_id
        FROM users
        WHERE id = :id
        LIMIT 1
    ";

    $stmt = $db->prepare($checkAdminQuery);
    $stmt->bindParam(":id", $admin_requester_id);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(["error" => "Requester user not found"]);
        exit();
    }

    $requester = $stmt->fetch(PDO::FETCH_ASSOC);

    if ((int)$requester["role_id"] !== $adminRoleId) {
        http_response_code(403);
        echo json_encode(["error" => "Admin privileges required"]);
        exit();
    }

    // Prevent an admin from demoting themselves (optional)
    if ($admin_requester_id === $target_user_id) {
        http_response_code(403);
        echo json_encode(["error" => "Admins cannot change their own role"]);
        exit();
    }

    // ---------------------------------------
    // 5. Update user role
    // ---------------------------------------
    $updateQuery = "
        UPDATE users
        SET role_id = :role_id
        WHERE id = :id
    ";

    $stmt = $db->prepare($updateQuery);
    $stmt->bindParam(":role_id", $targetRoleId, PDO::PARAM_INT);
    $stmt->bindParam(":id", $target_user_id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "User role updated",
            "updated_user_id" => $target_user_id,
            "new_role" => $new_role_name
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update role"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
