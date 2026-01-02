<?php
// Allow the Origin of the request if it's from localhost or vercel.app
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = $_SERVER['HTTP_ORIGIN'];
    if (strpos($origin, 'localhost') !== false || strpos($origin, 'vercel.app') !== false) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host = "db.mtyqsfpfbgbwljmzptke.supabase.co";
    private $port = "5432";
    private $user = "postgres";
    private $pass = "QnOo18doVQcpbU3z";
    private $dbname = "postgres";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            // Using pgsql for PostgreSQL
            $dsn = "pgsql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->dbname;
            $this->conn = new PDO($dsn, $this->user, $this->pass);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            // For debugging (remove in production)
            // echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>