<?php
require_once '../../config/database.php';

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

// Determine verify URL based on current server path
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
$host = $_SERVER['HTTP_HOST'];
$currentPath = $_SERVER['REQUEST_URI'];
$apiBase = str_replace('management/getCharacter.php', '', $currentPath);
$verifyUrl = "$protocol://$host{$apiBase}auth/verify.php";

// Fallback to localhost if external host fails (sometimes Oracle needs localhost for internal calls)
if (strpos($host, 'localhost') === false) {
    // Attempt with localhost for internal performance
    $localVerifyUrl = "http://localhost{$apiBase}auth/verify.php";
} else {
    $localVerifyUrl = $verifyUrl;
}

$options = [
    'http' => [
        'header' => "Authorization: Bearer $token\r\n",
        'method' => 'GET'
    ]
];
$context = stream_context_create($options);
$verifyResponse = @file_get_contents($localVerifyUrl, false, $context);

// If local fails, try the absolute URL
if ($verifyResponse === FALSE) {
    $verifyResponse = @file_get_contents($verifyUrl, false, $context);
}

if ($verifyResponse === FALSE) {
    http_response_code(401);
    echo json_encode([
        "error" => "Token verification failed",
        "debug" => ["verifyUrl" => $verifyUrl, "localVerifyUrl" => $localVerifyUrl]
    ]);
    exit();
}

$verifyData = json_decode($verifyResponse, true);

if (!$verifyData || !isset($verifyData['user'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit();
}

// Token is valid, proceed with database operations
// Create connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

// Query to get all characters with their details
$sql = "SELECT id, name, rarity, element, path FROM characters ORDER BY name";
$stmt = $db->prepare($sql);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $characters = array();
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $characters[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'rarity' => (int)$row['rarity'],
            'element' => $row['element'],
            'path' => $row['path'],
            'description' => "",
            'imageName' => str_replace(' ', '_', $row['name'])
        ];
    }
    echo json_encode([
        "success" => true,
        "characters" => $characters
    ]);
} else {
    echo json_encode([
        "success" => true,
        "message" => "No characters found",
        "characters" => []
    ]);
}
?>
