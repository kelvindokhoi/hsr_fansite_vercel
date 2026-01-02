<?php
require_once 'config/database.php';

echo "Testing Supabase Connection...\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    if ($db) {
        echo "✅ Database connected successfully!\n";
        
        // Test query - list tables (PostgreSQL way)
        $stmt = $db->query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "Found tables in public schema:\n";
        foreach ($tables as $table) {
            echo "- $table\n";
            
            // Count rows for known tables
            if (in_array($table, ['users', 'roles', 'characters'])) {
                $countStmt = $db->query("SELECT COUNT(*) FROM $table");
                $count = $countStmt->fetchColumn();
                echo "  (Row count: $count)\n";
            }
        }
    } else {
        echo "❌ Database connection failed (getConnection returned null)!\n";
    }
} catch (PDOException $e) {
    echo "❌ PDO Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
