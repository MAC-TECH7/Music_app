<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

// Sessions and helpers
if (session_status() === PHP_SESSION_NONE) session_start();

function logError($e){
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) @mkdir($logDir, 0777, true);
    $file = $logDir . '/error.log';
    @file_put_contents($file, date('Y-m-d H:i:s') . " - " . $e->getMessage() . PHP_EOL, FILE_APPEND);
}

function getCurrentUserInfo($pdo){
    if (empty($_SESSION['user_id'])) return null;
    try{
        $stmt = $pdo->prepare('SELECT id,type FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }catch(Exception $e){ return null; }
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT id, name, email, phone, type, status, joined, avatar FROM users ORDER BY id DESC");
            $users = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $users]);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // Only admin can create users
        $me = getCurrentUserInfo($pdo);
        if (!$me || $me['type'] !== 'admin'){
            http_response_code(403);
            echo json_encode(['success'=>false,'message'=>'Unauthorized']);
            exit;
        }

        // Basic validation
        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        if (!$name || !$email || !$password){
            http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'Missing required fields']);
            exit;
        }

        try {
            $sql = "INSERT INTO users (name, email, phone, password, type, status) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt->execute([$name, $email, $data['phone'] ?? null, $hashedPassword, $data['type'] ?? 'fan', $data['status'] ?? 'active']);
            echo json_encode(['success' => true, 'message' => 'User created successfully']);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        // Only admin can update users
        $me = getCurrentUserInfo($pdo);
        if (!$me || $me['type'] !== 'admin'){
            http_response_code(403);
            echo json_encode(['success'=>false,'message'=>'Unauthorized']);
            exit;
        }

        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid id']); exit; }

        try {
            $sql = "UPDATE users SET name=?, email=?, phone=?, type=?, status=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['type'], $data['status'], $id]);
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'DELETE':
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid id']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;
}
?>