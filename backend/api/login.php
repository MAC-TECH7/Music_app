<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../db.php';

// Start PHP session to support server-side auth
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || empty($data['email']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, name, email, phone, password, type, status, joined, avatar FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    if ($user['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Account is not active']);
        exit;
    }

    // Never expose password hash to frontend
    unset($user['password']);

    // Set server session user id for authenticated session
    $_SESSION['user_id'] = $user['id'];

    echo json_encode([
        'success' => true,
        'data' => [
            'user' => $user
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
}


