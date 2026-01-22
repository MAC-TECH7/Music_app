<?php
require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT id, name, email, type FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Users in database:\n";
    echo str_repeat("-", 80) . "\n";
    foreach ($users as $user) {
        printf("ID: %d | Name: %s | Email: %s | Type: %s\n", 
            $user['id'], 
            $user['name'], 
            $user['email'], 
            $user['type']
        );
    }
    echo str_repeat("-", 80) . "\n";
    echo "Total users: " . count($users) . "\n";
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
