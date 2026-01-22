<?php
require_once 'db.php';

try {
    // Fix Marie Ndongo's account - set type to 'artist'
    $stmt = $pdo->prepare("UPDATE users SET type = 'artist' WHERE id = 2");
    $stmt->execute();
    
    echo "✓ Updated Marie Ndongo's account to type 'artist'\n\n";
    
    // Also fix Pierre Essomba if needed
    $stmt = $pdo->prepare("UPDATE users SET type = 'artist' WHERE id = 3 AND (type IS NULL OR type = '')");
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        echo "✓ Updated Pierre Essomba's account to type 'artist'\n\n";
    }
    
    // Verify the changes
    $stmt = $pdo->query("SELECT id, name, email, type FROM users WHERE id IN (2, 3, 7, 8)");
    $artists = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Artist accounts after fix:\n";
    echo str_repeat("-", 80) . "\n";
    foreach ($artists as $artist) {
        printf("ID: %d | Name: %s | Email: %s | Type: %s\n", 
            $artist['id'], 
            $artist['name'], 
            $artist['email'], 
            $artist['type']
        );
    }
    echo str_repeat("-", 80) . "\n";
    echo "\n✅ All artist accounts are now properly configured!\n";
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
