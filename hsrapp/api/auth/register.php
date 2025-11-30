<?php
require_once '../../config/database.php';

header("Access-Control-Allow-Origin: http://localhost:5173");
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get raw POST data
$raw_data = file_get_contents("php://input");
$data = json_decode($raw_data);

if (empty($data) || !isset($data->username) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode([
        "error" => "Username and password required",
        "debug" => "Received: " . $raw_data
    ]);
    exit();
}

$username = trim($data->username);
$password = $data->password;

// Validate input
if (strlen($username) < 3) {
    http_response_code(400);
    echo json_encode(["error" => "Username must be at least 3 characters"]);
    exit();
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 6 characters"]);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Check if username exists
    $checkQuery = "SELECT id FROM users WHERE username = :username";
    $stmt = $db->prepare($checkQuery);
    $stmt->bindParam(":username", $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["error" => "Username already exists"]);
        exit();
    }

    // Fetch default user role ID dynamically
    $defaultRoleQuery = "SELECT id FROM roles WHERE role_name = 'user' LIMIT 1";
    $defaultRoleStmt = $db->prepare($defaultRoleQuery);
    $defaultRoleStmt->execute();
    $defaultRole = $defaultRoleStmt->fetch(PDO::FETCH_ASSOC);

    if (!$defaultRole) {
        throw new Exception("Default user role not found");
    }

    $defaultRoleId = $defaultRole['id'];

    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user with role_id
    $insertQuery = "
        INSERT INTO users (username, password_hash, stellar_jade_balance, role_id)
        VALUES (:username, :password_hash, :balance, :role_id)
    ";

    $stmt = $db->prepare($insertQuery);
    $starting_balance = 1600;
    $stmt->bindParam(":username", $username);
    $stmt->bindParam(":password_hash", $password_hash);
    $stmt->bindParam(":balance", $starting_balance);
    $stmt->bindParam(":role_id", $defaultRoleId);

    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();

        // Build token
        $token = base64_encode(json_encode([
            "user_id" => (int)$user_id,
            "username" => $username,
            "is_admin" => 0, // Always 0 for new accounts (user role)
            "role_id" => $defaultRoleId,
            "exp" => time() + (7 * 24 * 60 * 60) // 7 days
        ]));

        http_response_code(200);
        echo json_encode([
            "token" => $token,
            "user" => [
                "id" => (int)$user_id,
                "username" => $username,
                "stellar_jade_balance" => $starting_balance,
                "is_admin" => 0,
                "role_name" => "user"
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create user"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
}
?>
