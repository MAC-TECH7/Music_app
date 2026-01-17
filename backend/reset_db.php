<?php
require_once 'db.php';

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    $tables = ['songs', 'artists', 'users', 'listening_history', 'playlists', 'playlist_songs', 'favorites', 'follows', 'settings', 'notifications'];
    
    foreach ($tables as $table) {
        try {
            $pdo->exec("TRUNCATE TABLE $table");
            echo "Truncated $table<br>";
        } catch (PDOException $e) {
            echo "Error truncating $table: " . $e->getMessage() . "<br>";
            // Attempt DELETE if TRUNCATE fails (though MySQL usually allows TRUNCATE with FK checks off)
             $pdo->exec("DELETE FROM $table");
        }
    }
    
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "Database reset complete.<br>";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
