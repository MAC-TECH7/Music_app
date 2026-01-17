<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['user'])) {
    echo json_encode([
        'success' => true,
        'data' => [
            'user' => $_SESSION['user']
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in'
    ]);
}
?>