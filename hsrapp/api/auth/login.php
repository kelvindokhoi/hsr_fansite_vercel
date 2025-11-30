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

    // Updated query: fetch role_id and join roles table
    $query = "
        SELECT u.id, u.username, u.password_hash, u.stellar_jade_balance, u.role_id, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.username = :username
        LIMIT 1
    ";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":username", $username);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid username or password"]);
        exit();
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid username or password"]);
        exit();
    }

    // Check if user is admin
    $isAdmin = ($user['role_id'] == $adminRoleId) ? 1 : 0;

    // Create token with admin info
    $token = base64_encode(json_encode([
        "user_id" => $user['id'],
        "username" => $user['username'],
        "is_admin" => $isAdmin,
        "exp" => time() + (7 * 24 * 60 * 60) // 7 days
    ]));

    http_response_code(200);
    echo json_encode([
        "token" => $token,
        "user" => [
            "id" => (int)$user['id'],
            "username" => $user['username'],
            "stellar_jade_balance" => (int)$user['stellar_jade_balance'],
            "is_admin" => $isAdmin
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Login failed: " . $e->getMessage()]);
}
?>
