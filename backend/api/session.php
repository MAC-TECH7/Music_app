<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session
session_start();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Check if user is logged in
        if (isset($_SESSION['user']) && $_SESSION['user']['isLoggedIn']) {
            echo json_encode([
                'success' => true,
                'data' => [
                    'user' => $_SESSION['user']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Not authenticated'
            ]);
        }
        break;

    case 'DELETE':
        // Logout - destroy session
        session_destroy();
        echo json_encode([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>