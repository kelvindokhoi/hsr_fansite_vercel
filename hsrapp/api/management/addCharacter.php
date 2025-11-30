<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin");

// Database connection
$host = "localhost";
$user = "root";
$pass = "root";
$dbname = "hsr_fansite";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit; // CORS preflight
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
    $conn->begin_transaction();

    $sql = "
        INSERT INTO characters (name, rarity, element, path)
        VALUES (?, ?, ?, ?)
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("siss", $name, $rarity, $element, $path);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $newId = $stmt->insert_id;

    $stmt->close();
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Character added successfully",
        "id" => $newId
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to insert character",
        "details" => $e->getMessage()
    ]);
}

$conn->close();
?>
