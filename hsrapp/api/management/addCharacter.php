<?php
require_once '../../config/database.php';

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

//
// Read JSON input
//
$input = json_decode(file_get_contents("php://input"), true);

if (
    !isset($input["name"]) ||
    !isset($input["rarity"]) ||
    !isset($input["element"]) ||
    !isset($input["path"])
) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

$name    = trim($input["name"]);
$rarity  = intval($input["rarity"]);
$element = trim($input["element"]);
$path    = trim($input["path"]);

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $sql = "
        INSERT INTO characters (name, rarity, element, path)
        VALUES (:name, :rarity, :element, :path)
    ";

    $stmt = $db->prepare($sql);
    
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":rarity", $rarity, PDO::PARAM_INT);
    $stmt->bindParam(":element", $element);
    $stmt->bindParam(":path", $path);

    if ($stmt->execute()) {
        $newId = $db->lastInsertId();
        echo json_encode([
            "success" => true,
            "message" => "Character added successfully",
            "id" => $newId
        ]);
    } else {
        throw new Exception("Failed to insert character");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to insert character",
        "details" => $e->getMessage()
    ]);
}
?>
