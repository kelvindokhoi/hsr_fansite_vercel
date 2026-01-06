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

// Create connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

// INLINE TOKEN VERIFICATION (Modified from external call for better reliability)
try {
    $decoded = json_decode(base64_decode($token), true);

    if (!$decoded || !isset($decoded['user_id']) || !isset($decoded['exp'])) {
        throw new Exception("Invalid token format");
    }

    if ($decoded['exp'] < time()) {
        http_response_code(401);
        echo json_encode(["error" => "Token expired"]);
        exit();
    }

    // Verify user exists
    $query = "SELECT id FROM users WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $decoded['user_id'], PDO::PARAM_INT);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(["error" => "User not found"]);
        exit();
    }

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid token: " . $e->getMessage()]);
    exit();
}

// Query to get all characters with their details
$sql = "SELECT id, name, rarity, element, path, description, image_extension FROM characters ORDER BY name";
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
            'description' => $row['description'] ?? "",
            'imageExtension' => $row['image_extension'] ?? 'png',
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
