<?php
require_once 'db.php';
try {
    $stmt = $pdo->query("SELECT count(*) as count FROM songs");
    $result = $stmt->fetch();
    echo "Total songs: " . $result['count'] . "<br>";

    $stmt = $pdo->query("SELECT id, title, file_path FROM songs LIMIT 5");
    $songs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>" . print_r($songs, true) . "</pre>";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
