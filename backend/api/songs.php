<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

// Start session for auth checks
if (session_status() === PHP_SESSION_NONE) session_start();

// Helpers
function getCurrentUser($pdo) {
    if (empty($_SESSION['user_id'])) return null;
    try {
        $stmt = $pdo->prepare("SELECT id, type FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return null;
    }
}

function artistBelongsToUser($pdo, $artist_id, $user_id) {
    if (!$artist_id || !$user_id) return false;
    $stmt = $pdo->prepare('SELECT id FROM artists WHERE id = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$artist_id, $user_id]);
    return (bool)$stmt->fetchColumn();
}

function songArtistId($pdo, $song_id) {
    $stmt = $pdo->prepare('SELECT artist_id FROM songs WHERE id = ? LIMIT 1');
    $stmt->execute([$song_id]);
    return $stmt->fetchColumn();
}

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
        // Auth: only admin or artist can create
        $me = getCurrentUser($pdo);
        if (!$me || !in_array($me['type'], ['admin','artist'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        // Basic validation
        $title = trim($data['title'] ?? '');
        $artist_id = filter_var($data['artist_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$title || !$artist_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields: title and artist_id']);
            exit;
        }

        // If artist role, ensure they own the artist_id
        if ($me['type'] === 'artist' && !artistBelongsToUser($pdo, $artist_id, $me['id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Artist does not belong to the authenticated user']);
            exit;
        }

        $genre = $data['genre'] ?? null;
        $duration = $data['duration'] ?? null;
        $plays = isset($data['plays']) ? intval($data['plays']) : 0;
        $likes = isset($data['likes']) ? intval($data['likes']) : 0;
        $file_path = $data['file_path'] ?? null;
        $cover_art = $data['cover_art'] ?? null;
        $status = in_array($data['status'] ?? 'active', ['active','pending','blocked']) ? $data['status'] : 'active';

        try {
            $sql = "INSERT INTO songs (title, artist_id, genre, duration, plays, likes, file_path, cover_art, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$title, $artist_id, $genre, $duration, $plays, $likes, $file_path, $cover_art, $status]);
            echo json_encode(['success' => true, 'message' => 'Song created successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        // Auth: only admin or artist can update
        $me = getCurrentUser($pdo);
        if (!$me || !in_array($me['type'], ['admin','artist'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        // Basic validation
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        $title = trim($data['title'] ?? '');
        $artist_id = filter_var($data['artist_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || !$title || !$artist_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields: id, title, artist_id']);
            exit;
        }

        // If artist role, ensure they own the artist_id and the song
        if ($me['type'] === 'artist') {
            if (!artistBelongsToUser($pdo, $artist_id, $me['id'])) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Artist does not belong to the authenticated user']);
                exit;
            }
            $existingArtistId = songArtistId($pdo, $id);
            if ($existingArtistId && !artistBelongsToUser($pdo, $existingArtistId, $me['id'])) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'You do not own this song']);
                exit;
            }
        }

        $genre = $data['genre'] ?? null;
        $duration = $data['duration'] ?? null;
        $plays = isset($data['plays']) ? intval($data['plays']) : 0;
        $likes = isset($data['likes']) ? intval($data['likes']) : 0;
        $file_path = $data['file_path'] ?? null;
        $cover_art = $data['cover_art'] ?? null;
        $status = in_array($data['status'] ?? 'active', ['active','pending','blocked']) ? $data['status'] : 'active';

        try {
            $sql = "UPDATE songs SET title=?, artist_id=?, genre=?, duration=?, plays=?, likes=?, file_path=?, cover_art=?, status=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$title, $artist_id, $genre, $duration, $plays, $likes, $file_path, $cover_art, $status, $id]);
            echo json_encode(['success' => true, 'message' => 'Song updated successfully']);
        } catch(PDOException $e) {
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
        // Auth: only admin or owning artist can delete
        $me = getCurrentUser($pdo);
        if (!$me || !in_array($me['type'], ['admin','artist'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        if ($me['type'] === 'artist') {
            $songArtist = songArtistId($pdo, $id);
            if (!$songArtist || !artistBelongsToUser($pdo, $songArtist, $me['id'])) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'You do not have permission to delete this song']);
                exit;
            }
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM songs WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Song deleted successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;
}
?>