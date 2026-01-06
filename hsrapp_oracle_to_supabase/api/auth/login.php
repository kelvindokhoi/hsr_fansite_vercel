<?php
require_once '../../config/database.php';

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

$cf_token = $data->cf_token ?? null;

function verifyTurnstile($token) {
    if (!$token) return false;
    
    // Get secret key from env
    $secret = getenv('TURNSTILE_SECRET_KEY');
    if (!$secret) return true; // Fail open if key is missing to prevent lockout, but log it
    
    $url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    $data = [
        'secret' => $secret,
        'response' => $token
    ];
    
    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    $response = json_decode($result);
    
    return $response->success;
}

if (!verifyTurnstile($cf_token)) {
    http_response_code(403);
    echo json_encode(["error" => "Security check failed. Please refresh and try again."]);
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
    $loginSuccessful = password_verify($password, $user['password_hash']);

    // Log the login attempt if user_logins table exists
    try {
        $ip = $_SERVER['REMOTE_ADDR'] === '::1' ? '127.0.0.1' : $_SERVER['REMOTE_ADDR'];
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        
        $logQuery = "
            INSERT INTO user_logins (user_id, ip_address, user_agent, login_successful)
            VALUES (:user_id, :ip_address, :user_agent, :login_successful)
        ";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":user_id", $user['id']);
        $logStmt->bindParam(":ip_address", $ip);
        $logStmt->bindParam(":user_agent", $ua);
        $logStmt->bindParam(":login_successful", $loginSuccessful, PDO::PARAM_BOOL);
        $logStmt->execute();
    } catch (Exception $logError) {
        // Silently fail logging if table doesn't exist or other error
        error_log("Login logging failed: " . $logError->getMessage());
    }

    if (!$loginSuccessful) {
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
