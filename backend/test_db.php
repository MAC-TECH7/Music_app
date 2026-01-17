<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing connection to MySQL...\n";
try {
    $pdo = new PDO("mysql:host=127.0.0.1;charset=utf8", 'root', '', [
        PDO::ATTR_TIMEOUT => 5,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "SUCCESS: Connected to MySQL host.\n";
    
    $stmt = $pdo->query("SHOW DATABASES LIKE 'music_app'");
    if ($stmt->fetch()) {
        echo "SUCCESS: Database 'music_app' exists.\n";
        $pdo->exec("USE music_app");
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $count = $stmt->fetchColumn();
        echo "SUCCESS: 'users' table has $count records.\n";
    } else {
        echo "WARNING: Database 'music_app' does not exist.\n";
    }
} catch (Exception $e) {
    echo "FAILURE: " . $e->getMessage() . "\n";
}
