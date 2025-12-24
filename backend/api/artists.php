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
            $stmt = $pdo->query("SELECT a.*, u.name as user_name FROM artists a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.id DESC");
            $artists = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $artists]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "INSERT INTO artists (user_id, name, genre, followers, songs_count, status, verification, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['user_id'], $data['name'], $data['genre'], $data['followers'] ?? 0, $data['songs_count'] ?? 0, $data['status'] ?? 'pending', $data['verification'] ?? 'pending', $data['bio']]);
            echo json_encode(['success' => true, 'message' => 'Artist created successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE artists SET name=?, genre=?, followers=?, songs_count=?, status=?, verification=?, bio=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['name'], $data['genre'], $data['followers'], $data['songs_count'], $data['status'], $data['verification'], $data['bio'], $data['id']]);
            echo json_encode(['success' => true, 'message' => 'Artist updated successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM artists WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Artist deleted successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
}
?>