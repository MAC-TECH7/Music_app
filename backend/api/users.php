<?php
header('Content-Type: application/json');

// Allow only same-origin requests that include credentials
$allowedOrigin = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
header("Access-Control-Allow-Origin: $allowedOrigin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$method = $_SERVER['REQUEST_METHOD'];

// Helper: is the current session an authenticated admin?
function isAdmin(): bool {
    return isset($_SESSION['user'])
        && !empty($_SESSION['user']['isLoggedIn'])
        && ($_SESSION['user']['type'] ?? '') === 'admin';
}

switch ($method) {
    case 'GET':
        // User list is sensitive — admin only
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            break;
        }
        
        $id = $_GET['id'] ?? null;
        try {
            if ($id) {
                $stmt = $pdo->prepare("SELECT id, name, email, phone, type, status, joined, avatar FROM users WHERE id = ?");
                $stmt->execute([$id]);
                $user = $stmt->fetch();
                if ($user) {
                    echo json_encode(['success' => true, 'data' => $user]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'User not found']);
                }
            } else {
                $stmt = $pdo->query("SELECT id, name, email, phone, type, status, joined, avatar FROM users ORDER BY id DESC");
                $users = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $users]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // Basic validation
        if (!$data || empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['type'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            break;
        }
        // Only allow fan/artist self-registration; admins/moderators must be created by an admin
        $allowedTypes = ['fan', 'artist'];
        if (!in_array($data['type'], $allowedTypes) && !isAdmin()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden account type']);
            break;
        }
        try {
            $sql = "INSERT INTO users (name, email, phone, password, type, status, joined, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            // Derive avatar initials from name
            $avatar = strtoupper(mb_substr($data['name'], 0, 2));
            $joined = date('Y-m-d');
            $status = $data['status'] ?? 'active';
            $stmt->execute([
                $data['name'],
                $data['email'],
                $data['phone'] ?? null,
                $hashedPassword,
                $data['type'],
                $status,
                $joined,
                $avatar
            ]);
            $newId = $pdo->lastInsertId();
            echo json_encode(['success' => true, 'message' => 'User created successfully', 'data' => ['id' => (int)$newId]]);
        } catch(PDOException $e) {
            if ($e->getCode() === '23000') {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Server error']);
            }
        }
        break;

    case 'PUT':
        // Only admins can update users via this endpoint
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            break;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE users SET name=?, email=?, phone=?, type=?, status=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['type'], $data['status'], $data['id']]);
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'DELETE':
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            break;
        }
        $id = $_GET['id'] ?? null;
        if (!$id) { http_response_code(400); echo json_encode(['success' => false, 'message' => 'Missing id']); break; }
        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;
}
?>