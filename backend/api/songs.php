<?php
header('Content-Type: application/json');
require_once '../cors.php';

require_once '../db.php';

function getExistingSong(PDO $pdo, int $id)
{
    $stmt = $pdo->prepare("SELECT * FROM songs WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("SELECT s.*, a.name as artist_name, a.instagram_url, a.twitter_url, a.facebook_url, a.youtube_url FROM songs s LEFT JOIN artists a ON s.artist_id = a.id WHERE s.id = ?");
                $stmt->execute([$id]);
                $song = $stmt->fetch();
                if ($song) {
                    echo json_encode(['success' => true, 'data' => $song]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Song not found']);
                }
            } else {
                $stmt = $pdo->query("SELECT s.*, a.name as artist_name, a.instagram_url, a.twitter_url, a.facebook_url, a.youtube_url FROM songs s LEFT JOIN artists a ON s.artist_id = a.id ORDER BY s.id DESC");
                $songs = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $songs]);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "INSERT INTO songs (title, artist_id, genre, duration, plays, likes, downloads, file_path, cover_art, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['title'], $data['artist_id'], $data['genre'], $data['duration'], $data['plays'] ?? 0, $data['likes'] ?? 0, $data['downloads'] ?? 0, $data['file_path'], $data['cover_art'], $data['status'] ?? 'active']);
            echo json_encode(['success' => true, 'message' => 'Song created successfully']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Song ID is required']);
                break;
            }

            $existingSong = getExistingSong($pdo, (int) $data['id']);
            if (!$existingSong) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Song not found']);
                break;
            }

            $sql = "UPDATE songs SET title=?, artist_id=?, genre=?, duration=?, plays=?, likes=?, downloads=?, file_path=?, cover_art=?, status=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['title'] ?? $existingSong['title'],
                $data['artist_id'] ?? $existingSong['artist_id'],
                $data['genre'] ?? $existingSong['genre'],
                $data['duration'] ?? $existingSong['duration'],
                $data['plays'] ?? $existingSong['plays'],
                $data['likes'] ?? $existingSong['likes'],
                $data['downloads'] ?? ($existingSong['downloads'] ?? 0),
                $data['file_path'] ?? $existingSong['file_path'],
                $data['cover_art'] ?? $existingSong['cover_art'],
                $data['status'] ?? $existingSong['status'],
                $data['id']
            ]);
            echo json_encode(['success' => true, 'message' => 'Song updated successfully']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM songs WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Song deleted successfully']);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
}
?>