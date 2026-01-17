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
            if (isset($_GET['user_id'])) {
                $stmt = $pdo->prepare("SELECT a.*, u.name as user_name FROM artists a LEFT JOIN users u ON a.user_id = u.id WHERE a.user_id = ?");
                $stmt->execute([$_GET['user_id']]);
            } else {
                $stmt = $pdo->query("SELECT a.*, u.name as user_name FROM artists a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.id DESC");
            }
            $artists = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $artists]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "INSERT INTO artists (user_id, name, genre, followers, songs_count, status, verification, bio, instagram_url, twitter_url, facebook_url, youtube_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['user_id'], $data['name'], $data['genre'], $data['followers'] ?? 0, $data['songs_count'] ?? 0, $data['status'] ?? 'pending', $data['verification'] ?? 'pending', $data['bio'], $data['instagram_url'] ?? null, $data['twitter_url'] ?? null, $data['facebook_url'] ?? null, $data['youtube_url'] ?? null]);
            echo json_encode(['success' => true, 'message' => 'Artist created successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE artists SET name=?, genre=?, followers=?, songs_count=?, status=?, verification=?, bio=?, instagram_url=?, twitter_url=?, facebook_url=?, youtube_url=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['name'], $data['genre'], $data['followers'], $data['songs_count'], $data['status'], $data['verification'], $data['bio'], $data['instagram_url'], $data['twitter_url'], $data['facebook_url'], $data['youtube_url'], $data['id']]);
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