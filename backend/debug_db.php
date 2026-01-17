<?php
require_once 'db.php';

try {
    $stmt = $pdo->query('SELECT email, type, status FROM users');
    if ($stmt->rowCount() == 0) {
        echo 'DB_EMPTY';
    } else {
        while ($row = $stmt->fetch()) {
            echo $row['email'] . ' (' . $row['type'] . '): ' . $row['status'] . PHP_EOL;
        }
    }
} catch (PDOException $e) {
    echo 'DB_ERROR: ' . $e->getMessage();
}
