<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $user_id = $_GET['user_id'] ?? null;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            
            if (!$user_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'user_id is required']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                SELECT lh.*, s.title, s.genre, s.duration, s.plays, s.likes,
                       a.name as artist_name, a.id as artist_id
                FROM listening_history lh
                JOIN songs s ON lh.song_id = s.id
                LEFT JOIN artists a ON s.artist_id = a.id
                WHERE lh.user_id = ?
                ORDER BY lh.played_at DESC
                LIMIT ?
            ");
            $stmt->execute([$user_id, $limit]);
            $history = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $history]);
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
            // Insert listening history
            $stmt = $pdo->prepare("INSERT INTO listening_history (user_id, song_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $song_id]);
            
            // Update song play count
            $stmt = $pdo->prepare("UPDATE songs SET plays = plays + 1 WHERE id = ?");
            $stmt->execute([$song_id]);
            
            echo json_encode(['success' => true, 'message' => 'Listening history updated']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? $_GET['user_id'] ?? null;
        $history_id = $data['history_id'] ?? $_GET['history_id'] ?? null;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'user_id is required']);
            exit;
        }
        
        try {
            if ($history_id) {
                // Delete specific history entry
                $stmt = $pdo->prepare("DELETE FROM listening_history WHERE id = ? AND user_id = ?");
                $stmt->execute([$history_id, $user_id]);
            } else {
                // Clear all history for user
                $stmt = $pdo->prepare("DELETE FROM listening_history WHERE user_id = ?");
                $stmt->execute([$user_id]);
            }
            
            echo json_encode(['success' => true, 'message' => 'Listening history cleared']);
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

