<?php
// Database configuration — load from .env if present, fall back to defaults for local dev
function _env(string $key, string $default = ''): string {
    $val = getenv($key);
    if ($val !== false) return $val;
    // Parse .env file relative to project root (two levels up from /backend/)
    static $envVars = null;
    if ($envVars === null) {
        $envVars = [];
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
                [$k, $v] = explode('=', $line, 2);
                $envVars[trim($k)] = trim($v);
            }
        }
    }
    return $envVars[$key] ?? $default;
}

$host     = _env('DB_HOST', 'localhost');
$dbname   = _env('DB_NAME', 'music_app');
$username = _env('DB_USER', 'root');
$password = _env('DB_PASS', '');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_TIMEOUT          => 5,
        PDO::ATTR_ERRMODE          => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch(PDOException $e) {
    if (strpos($_SERVER['REQUEST_URI'] ?? '', '/api/') !== false || 
        strpos($_SERVER['PHP_SELF'] ?? '', '/api/') !== false ||
        (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
        
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        if (ob_get_length()) ob_clean();
        
        echo json_encode([
            'success' => false, 
            'message' => 'Database connection failed. Please ensure MySQL is running.'
        ]);
        exit;
    }
    die("Connection failed. Please ensure MySQL is running in XAMPP.");
}