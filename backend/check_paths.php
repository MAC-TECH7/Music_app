<?php
require_once 'db.php';
$stmt = $pdo->query("SELECT id, title, file_path FROM songs LIMIT 5");
$songs = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Current Directory: " . getcwd() . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";

foreach ($songs as $song) {
    echo "Song: {$song['title']}\n";
    echo "  DB Path: {$song['file_path']}\n";
    
    // Check relative to project root (assuming we run this from project root)
    if (file_exists($song['file_path'])) {
        echo "  [OK] File exists relative to root.\n";
        echo "  Size: " . filesize($song['file_path']) . " bytes\n";
    } else {
        echo "  [FAIL] File NOT found relative to root.\n";
    }
}
?>
