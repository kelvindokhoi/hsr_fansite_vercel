<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

// Verify the token using your existing verify endpoint
$verifyUrl = 'http://localhost/hsrapp/api/auth/verify.php';
$options = [
    'http' => [
        'header' => "Authorization: Bearer $token\r\n",
        'method' => 'GET'
    ]
];
$context = stream_context_create($options);
$verifyResponse = file_get_contents($verifyUrl, false, $context);

if ($verifyResponse === FALSE) {
    http_response_code(401);
    echo json_encode(["error" => "Token verification failed"]);
    exit();
}

$verifyData = json_decode($verifyResponse, true);

if (!$verifyData || !isset($verifyData['user'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token"]);
    exit();
}

// Token is valid, proceed with database operations
require_once '../../config/database.php';

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
