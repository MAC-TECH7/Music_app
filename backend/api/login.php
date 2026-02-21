<?php
ob_start();
session_start();
require_once '../cors.php';
function sendResponse($success, $message, $data = null, $httpCode = 200) {
    if (ob_get_length()) ob_clean();
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    ob_end_flush();
    exit;
}

try {
    require_once '../db.php';
} catch (Exception $e) {
    sendResponse(false, 'Database configuration error', ['error' => $e->getMessage()], 500);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    sendResponse(false, 'Invalid JSON input received', ['raw_input' => substr($input, 0, 100)], 400);
}

if (empty($data['email']) || empty($data['password'])) {
    sendResponse(false, 'Email and password are required', null, 400);
}

try {
    $stmt = $pdo->prepare("SELECT id, name, email, phone, password, type, status, joined, avatar FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['password'])) {
        sendResponse(false, 'Invalid email or password', null, 401);
    }

    if ($user['status'] !== 'active') {
        sendResponse(false, 'Account is not active', null, 403);
    }

    // Regenerate session ID to prevent session fixation attacks
    session_regenerate_id(true);

    // Store user data in session
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'type' => $user['type'],
        'isLoggedIn' => true
    ];
    // For compatibility with me.php
    $_SESSION['user_id'] = $user['id'];

    unset($user['password']);

    sendResponse(true, 'Login successful', [
        'user' => $user,
        'session_id' => session_id()
    ]);

} catch (PDOException $e) {
    sendResponse(false, 'Database error occurred', ['error' => $e->getMessage()], 500);
}
