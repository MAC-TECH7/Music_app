<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT id, name, email, phone, type, status, joined, avatar FROM users ORDER BY id DESC");
            $users = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $users]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
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
            echo json_encode(['success' => true, 'message' => 'User created successfully']);
        } catch(PDOException $e) {
            // Hide internal details from client, but keep HTTP 409 for duplicate emails
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
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE users SET name=?, email=?, phone=?, type=?, status=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['name'], $data['email'], $data['phone'], $data['type'], $data['status'], $data['id']]);
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
}
?>