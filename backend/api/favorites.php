<?php
header('Content-Type: application/json');
require_once '../cors.php';

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $user_id = $_GET['user_id'] ?? null;
            $song_id = $_GET['song_id'] ?? null;
            
            if (!$user_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'user_id is required']);
                exit;
            }
            
            if ($song_id) {
                // Check if song is favorited
                $stmt = $pdo->prepare("SELECT id FROM user_likes WHERE user_id = ? AND song_id = ?");
                $stmt->execute([$user_id, $song_id]);
                $like = $stmt->fetch();
                echo json_encode(['success' => true, 'data' => ['is_favorited' => $like !== false]]);
            } else {
                // Get all favorited songs for user
                $stmt = $pdo->prepare("
                    SELECT ul.*, s.title, s.genre, s.duration, s.plays, s.likes, s.file_path, s.cover_art,
                           a.name as artist_name, a.id as artist_id
                    FROM user_likes ul
                    JOIN songs s ON ul.song_id = s.id
                    LEFT JOIN artists a ON s.artist_id = a.id
                    WHERE ul.user_id = ?
                    ORDER BY ul.created_at DESC
                ");
                $stmt->execute([$user_id]);
                $favorites = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $favorites]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? null;
        $song_id = $data['song_id'] ?? null;
        
        if (!$user_id || !$song_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'user_id and song_id are required']);
            exit;
        }
        
        try {
            // Check if already favorited
            $stmt = $pdo->prepare("SELECT id FROM user_likes WHERE user_id = ? AND song_id = ?");
            $stmt->execute([$user_id, $song_id]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Song already in favorites']);
                exit;
            }
            
            // Add to favorites
            $stmt = $pdo->prepare("INSERT INTO user_likes (user_id, song_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $song_id]);
            
            // Update song likes count
            $stmt = $pdo->prepare("UPDATE songs SET likes = likes + 1 WHERE id = ?");
            $stmt->execute([$song_id]);
            
            echo json_encode(['success' => true, 'message' => 'Song added to favorites']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? $_GET['user_id'] ?? null;
        $song_id = $data['song_id'] ?? $_GET['song_id'] ?? null;
        
        if (!$user_id || !$song_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'user_id and song_id are required']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM user_likes WHERE user_id = ? AND song_id = ?");
            $stmt->execute([$user_id, $song_id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Favorite not found']);
            } else {
                // Update song likes count
                $stmt = $pdo->prepare("UPDATE songs SET likes = GREATEST(0, likes - 1) WHERE id = ?");
                $stmt->execute([$song_id]);
                
                echo json_encode(['success' => true, 'message' => 'Song removed from favorites']);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>

