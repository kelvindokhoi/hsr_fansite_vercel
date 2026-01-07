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
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Remove optional quotes from the value
            if (preg_match('/^["\'](.*)["\']$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            putenv("$name=$value");
            $_ENV[$name] = $value; // Also set in $_ENV for good measure
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            // Check if PostgreSQL driver is installed
            if (!extension_loaded('pdo_pgsql')) {
                throw new PDOException("PHP extension 'pdo_pgsql' is not installed or enabled on this server. Please install it (e.g., 'sudo apt install php-pgsql') and restart Apache.");
            }
            
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->dbname;
            $this->conn = new PDO($dsn, $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // Log full error for the server admin
            error_log("Supabase Connection Error: " . $exception->getMessage());
            // Rethrow or handle based on how you want the API to respond
            throw new Exception("Database connection failed: " . $exception->getMessage());
        }

        return $this->conn;
    }
}
?>
