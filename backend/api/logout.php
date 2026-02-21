<?php
header('Content-Type: application/json');
session_start();

// Unset all session variables
$_SESSION = array();

// Destroy the session cookie if it exists
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 42000, '/');
}

// Destroy the session
session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
