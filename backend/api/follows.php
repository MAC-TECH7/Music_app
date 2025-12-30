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
            $artist_id = $_GET['artist_id'] ?? null;
            
            if ($user_id && $artist_id) {
                // Check if user follows artist
                $stmt = $pdo->prepare("SELECT id FROM follows WHERE user_id = ? AND artist_id = ?");
                $stmt->execute([$user_id, $artist_id]);
                $follow = $stmt->fetch();
                echo json_encode(['success' => true, 'data' => ['is_following' => $follow !== false]]);
            } elseif ($user_id) {
                // Get all artists user follows
                $stmt = $pdo->prepare("
                    SELECT f.*, a.name as artist_name, a.genre, a.followers, a.bio, a.status
                    FROM follows f
                    JOIN artists a ON f.artist_id = a.id
                    WHERE f.user_id = ?
                    ORDER BY f.created_at DESC
                ");
                $stmt->execute([$user_id]);
                $follows = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $follows]);
            } elseif ($artist_id) {
                // Get all users following this artist
                $stmt = $pdo->prepare("
                    SELECT f.*, u.name as user_name, u.email
                    FROM follows f
                    JOIN users u ON f.user_id = u.id
                    WHERE f.artist_id = ?
                    ORDER BY f.created_at DESC
                ");
                $stmt->execute([$artist_id]);
                $followers = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $followers]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'user_id or artist_id is required']);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? null;
        $artist_id = $data['artist_id'] ?? null;
        
        if (!$user_id || !$artist_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'user_id and artist_id are required']);
            exit;
        }
        
        try {
            // Check if already following
            $stmt = $pdo->prepare("SELECT id FROM follows WHERE user_id = ? AND artist_id = ?");
            $stmt->execute([$user_id, $artist_id]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Already following this artist']);
                exit;
            }
            
            // Add follow
            $stmt = $pdo->prepare("INSERT INTO follows (user_id, artist_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $artist_id]);
            
            // Update artist followers count
            $stmt = $pdo->prepare("UPDATE artists SET followers = followers + 1 WHERE id = ?");
            $stmt->execute([$artist_id]);
            
            echo json_encode(['success' => true, 'message' => 'Successfully followed artist']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? $_GET['user_id'] ?? null;
        $artist_id = $data['artist_id'] ?? $_GET['artist_id'] ?? null;
        
        if (!$user_id || !$artist_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'user_id and artist_id are required']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM follows WHERE user_id = ? AND artist_id = ?");
            $stmt->execute([$user_id, $artist_id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Follow relationship not found']);
            } else {
                // Update artist followers count
                $stmt = $pdo->prepare("UPDATE artists SET followers = GREATEST(0, followers - 1) WHERE id = ?");
                $stmt->execute([$artist_id]);
                
                echo json_encode(['success' => true, 'message' => 'Successfully unfollowed artist']);
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

