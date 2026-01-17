<?php
require_once 'db.php';

// 1. Create uploads directory
$uploadDir = dirname(__DIR__) . '/uploads/songs/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
    echo "Created directory: $uploadDir<br>";
}

// 2. Download sample audio file (Google Actions Sound Library - royalty free)
$audioUrl = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
$localFile = 'sample.ogg';
$localPath = $uploadDir . $localFile;
$dbPath = 'uploads/songs/' . $localFile;

if (!file_exists($localPath)) {
    echo "Downloading sample audio from $audioUrl...<br>";
    $audioContent = file_get_contents($audioUrl);
    if ($audioContent) {
        file_put_contents($localPath, $audioContent);
        echo "Sample audio saved to $localPath<br>";
    } else {
        die("Failed to download sample audio.<br>");
    }
} else {
    echo "Sample audio already exists.<br>";
}

// 3. Update all songs to use this file
try {
    $stmt = $pdo->prepare("UPDATE songs SET file_path = ? WHERE file_path IS NULL OR file_path = ''");
    $stmt->execute([$dbPath]);
    $count = $stmt->rowCount();
    echo "Updated $count songs to use the sample audio file.<br>";
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "<br>";
}

echo "Audio setup complete. Go play some music!";
?>
