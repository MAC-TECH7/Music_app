<?php
header('Content-Type: application/json');

// Session management
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../db.php';
require_once '../cors.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user']['id'] ?? null;

switch ($method) {
    case 'GET':
        // GET /backend/api/comments.php?song_id=123
        try {
            $songId = $_GET['song_id'] ?? null;
            if (!$songId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Song ID is required']);
                break;
            }

            // Fetch comments with user details - Sort pinned comments to the top
            $stmt = $pdo->prepare("
                SELECT c.*, u.name as user_name, u.avatar as user_avatar 
                FROM comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.song_id = ? 
                ORDER BY c.is_pinned DESC, c.created_at DESC
            ");
            $stmt->execute([$songId]);
            $comments = $stmt->fetchAll();

            echo json_encode(['success' => true, 'data' => $comments]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        // POST /backend/api/comments.php
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $songId = $data['song_id'] ?? null;
        $content = $data['content'] ?? '';
        $parentId = $data['parent_id'] ?? null;

        if (!$songId || empty(trim($content))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Song ID and content are required']);
            break;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO comments (user_id, song_id, content, parent_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userId, $songId, $content, $parentId]);
            
            $newId = $pdo->lastInsertId();
            
            // Get the newly created comment back with user info
            $stmt = $pdo->prepare("
                SELECT c.*, u.name as user_name, u.avatar as user_avatar 
                FROM comments c 
                JOIN users u ON c.user_id = u.id 
                WHERE c.id = ?
            ");
            $stmt->execute([$newId]);
            $newComment = $stmt->fetch();

            echo json_encode(['success' => true, 'data' => $newComment]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Pin/Unpin comment: PUT /backend/api/comments.php
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $commentId = $data['id'] ?? null;
        $pin = $data['pin'] ?? null; // true to pin, false to unpin

        if (!$commentId || $pin === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Comment ID and pin status are required']);
            break;
        }

        try {
            // Security check: Only the ARTIST of the song can pin/unpin comments
            $stmt = $pdo->prepare("
                SELECT s.user_id as artist_user_id 
                FROM comments c 
                JOIN songs s ON c.song_id = s.id 
                WHERE c.id = ?
            ");
            $stmt->execute([commentId]);
            $result = $stmt->fetch();

            if (!$result) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Comment or Song not found']);
                break;
            }

            if ($result['artist_user_id'] != $userId) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Only the artist can pin/unpin comments']);
                break;
            }

            // Update is_pinned status
            $stmt = $pdo->prepare("UPDATE comments SET is_pinned = ? WHERE id = ?");
            $stmt->execute([$pin ? 1 : 0, $commentId]);

            echo json_encode(['success' => true, 'message' => $pin ? 'Comment pinned' : 'Comment unpinned']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // DELETE /backend/api/comments.php?id=123
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            break;
        }

        $commentId = $_GET['id'] ?? null;
        if (!$commentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Comment ID is required']);
            break;
        }

        try {
            // Check if user owns the comment OR is the artist of the song OR is admin
            $stmt = $pdo->prepare("
                SELECT c.user_id as author_id, s.user_id as artist_user_id 
                FROM comments c 
                JOIN songs s ON c.song_id = s.id 
                WHERE c.id = ?
            ");
            $stmt->execute([$commentId]);
            $comment = $stmt->fetch();

            if (!$comment) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Comment not found']);
                break;
            }

            $userType = $_SESSION['user']['type'] ?? '';
            $isAuthor = ($comment['author_id'] == $userId);
            $isArtist = ($comment['artist_user_id'] == $userId);
            $isAdmin = ($userType === 'admin');

            if (!$isAuthor && !$isArtist && !$isAdmin) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'You do not have permission to delete this comment']);
                break;
            }

            $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
            $stmt->execute([$commentId]);

            echo json_encode(['success' => true, 'message' => 'Comment deleted successfully']);
        } catch (PDOException $e) {
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
