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
            $stmt = $pdo->query("SELECT s.*, a.name as artist_name FROM songs s LEFT JOIN artists a ON s.artist_id = a.id ORDER BY s.id DESC");
            $songs = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $songs]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "INSERT INTO songs (title, artist_id, genre, duration, plays, likes, file_path, cover_art, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['title'], $data['artist_id'], $data['genre'], $data['duration'], $data['plays'] ?? 0, $data['likes'] ?? 0, $data['file_path'], $data['cover_art'], $data['status'] ?? 'active']);
            echo json_encode(['success' => true, 'message' => 'Song created successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE songs SET title=?, artist_id=?, genre=?, duration=?, plays=?, likes=?, file_path=?, cover_art=?, status=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['title'], $data['artist_id'], $data['genre'], $data['duration'], $data['plays'], $data['likes'], $data['file_path'], $data['cover_art'], $data['status'], $data['id']]);
            echo json_encode(['success' => true, 'message' => 'Song updated successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM songs WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Song deleted successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
}
?>