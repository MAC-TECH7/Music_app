<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user']) || empty($_SESSION['user']['isLoggedIn'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in'
    ]);
    exit;
}

$sessionUser = $_SESSION['user'];
$userId = $_SESSION['user_id'] ?? ($sessionUser['id'] ?? null);

if ($userId) {
    try {
        require_once '../db.php';

        $stmt = $pdo->prepare("SELECT id, name, email, phone, type, status, joined, avatar FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([(int) $userId]);
        $dbUser = $stmt->fetch();

        if ($dbUser) {
            $_SESSION['user'] = array_merge($sessionUser, [
                'id' => (int) $dbUser['id'],
                'name' => $dbUser['name'],
                'email' => $dbUser['email'],
                'phone' => $dbUser['phone'],
                'type' => $dbUser['type'],
                'status' => $dbUser['status'],
                'joined' => $dbUser['joined'],
                'avatar' => $dbUser['avatar'],
                'isLoggedIn' => true
            ]);
            $sessionUser = $_SESSION['user'];
        }
    } catch (Throwable $e) {
        // Fall back to the current session payload if the database is unavailable.
    }
}

echo json_encode([
    'success' => true,
    'data' => [
        'user' => $sessionUser
    ]
]);
?>