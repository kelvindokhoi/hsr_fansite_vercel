<?php
// Dynamic CORS handling
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    // Allow localhost and vercel domains
    if (strpos($origin, 'localhost') !== false || strpos($origin, 'vercel.app') !== false) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
    }
} else {
    // Fallback if no origin is sent
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    // Supabase PostgreSQL details - use environment variables in production
    private $host;
    private $port;
    private $user;
    private $pass;
    private $dbname;
    public $conn;

    public function __construct() {
        $this->loadEnv(__DIR__ . '/../.env');
        $this->host = getenv('DB_HOST') ?: "your-supabase-db-host";
        $this->port = getenv('DB_PORT') ?: "5432";
        $this->dbname = getenv('DB_NAME') ?: "postgres";
        $this->user = getenv('DB_USER') ?: "postgres";
        $this->pass = getenv('DB_PASS') ?: "your-password";
    }

    private function loadEnv($path) {
        if (!file_exists($path)) return;
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            list($name, $value) = explode('=', $line, 2);
            putenv(trim($name) . "=" . trim($value));
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->dbname;
            $this->conn = new PDO($dsn, $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // PostgreSQL default characterset is usually UTF8, but good to be explicit if needed
            // $this->conn->exec("SET NAMES 'UTF8'");
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
        }

        return $this->conn;
    }
}
?>
