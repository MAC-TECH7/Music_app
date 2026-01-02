<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

if (session_status() === PHP_SESSION_NONE) session_start();

function logError($e){
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) @mkdir($logDir, 0777, true);
    $file = $logDir . '/error.log';
    @file_put_contents($file, date('Y-m-d H:i:s') . " - " . $e->getMessage() . PHP_EOL, FILE_APPEND);
}

function getCurrentUserInfo($pdo){
    if (empty($_SESSION['user_id'])) return null;
    try{
        $stmt = $pdo->prepare('SELECT id,type FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }catch(Exception $e){ return null; }
}

function artistBelongsToUser($pdo,$artist_id,$user_id){
    if (!$artist_id || !$user_id) return false;
    $stmt = $pdo->prepare('SELECT id FROM artists WHERE id = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$artist_id,$user_id]);
    return (bool)$stmt->fetchColumn();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT a.*, u.name as user_name FROM artists a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.id DESC");
            $artists = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $artists]);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // Only admin can create artists, or an authenticated user creating their own artist record
        $me = getCurrentUserInfo($pdo);
        if (!$me){ http_response_code(403); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }

        $user_id = $data['user_id'] ?? $me['id'];
        // If not admin and user_id != me, forbid
        if ($me['type'] !== 'admin' && intval($user_id) !== intval($me['id'])){
            http_response_code(403); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit;
        }

        $name = trim($data['name'] ?? '');
        if (!$name){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Missing name']); exit; }

        try {
            $sql = "INSERT INTO artists (user_id, name, genre, followers, songs_count, status, verification, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$user_id, $name, $data['genre'] ?? null, $data['followers'] ?? 0, $data['songs_count'] ?? 0, $data['status'] ?? 'pending', $data['verification'] ?? 'pending', $data['bio'] ?? null]);
            echo json_encode(['success' => true, 'message' => 'Artist created successfully']);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $me = getCurrentUserInfo($pdo);
        if (!$me){ http_response_code(403); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }

        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid id']); exit; }

        // If artist, ensure they own this artist record
        if ($me['type'] === 'artist'){
            if (!artistBelongsToUser($pdo, $id, $me['id'])){ http_response_code(403); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }
        }

        try {
            $sql = "UPDATE artists SET name=?, genre=?, followers=?, songs_count=?, status=?, verification=?, bio=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['name'], $data['genre'], $data['followers'], $data['songs_count'], $data['status'], $data['verification'], $data['bio'], $id]);
            echo json_encode(['success' => true, 'message' => 'Artist updated successfully']);
        } catch(PDOException $e) {
            logError($e);
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
        try {
            $stmt = $pdo->prepare("DELETE FROM artists WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Artist deleted successfully']);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;
}
?>