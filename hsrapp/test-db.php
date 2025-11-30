<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "✅ Database connected successfully!\n";
    
    // Test query
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total users: " . $result['count'] . "\n";
} else {
    echo "❌ Database connection failed!\n";
}
?>