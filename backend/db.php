<?php
// Database configuration
$host = 'localhost';
$dbname = 'music_app';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
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
            'message' => 'Database connection failed. Please ensure MySQL is running in XAMPP.',
            'error_detail' => $e->getMessage()
        ]);
        exit;
    }
    die("Connection failed: " . $e->getMessage() . ". Please ensure MySQL is running in XAMPP.");
}