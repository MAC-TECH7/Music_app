<?php
header('Content-Type: application/json');
session_start();
// Allow same-origin requests only for now
try {
    require_once __DIR__ . '/../db.php';
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>'DB error']);
    exit;
}

// Expect `backend/db.php` to provide $pdo. Ensure it's available.
global $pdo;
if (!isset($pdo) || !$pdo) {
    echo json_encode(['success'=>false,'message'=>'DB connection not available']);
    exit;
}

// Ensure table exists
$pdo->exec("CREATE TABLE IF NOT EXISTS client_storage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    storage_key VARCHAR(191) NOT NULL,
    storage_value LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY user_key (user_id, storage_key)
)");

$user_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : null;
if ($method === 'GET' && $action === 'get' && isset($_GET['key'])) {
    $key = $_GET['key'];
    // Prefer user-specific value, fallback to global (user_id IS NULL)
    $stmt = $pdo->prepare('SELECT storage_value FROM client_storage WHERE storage_key = ? AND (user_id = ? OR user_id IS NULL) ORDER BY user_id IS NOT NULL DESC LIMIT 1');
    $stmt->execute([$key, $user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true,'value'=>$row ? $row['storage_value'] : null]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$act = $input['action'] ?? $input['act'] ?? ($action ?: null);
$key = $input['key'] ?? null;

if (!$act || !$key) {
    echo json_encode(['success'=>false,'message'=>'missing action or key']);
    exit;
}

if ($act === 'set') {
    $value = isset($input['value']) ? json_encode($input['value']) : '';
    // Check if exists
    if ($user_id !== null) {
        $stmt = $pdo->prepare('SELECT id FROM client_storage WHERE storage_key = ? AND user_id = ?');
        $stmt->execute([$key, $user_id]);
        $exists = $stmt->fetchColumn();
        if ($exists) {
            $stmt = $pdo->prepare('UPDATE client_storage SET storage_value = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$value, $exists]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO client_storage (user_id, storage_key, storage_value) VALUES (?, ?, ?)');
            $stmt->execute([$user_id, $key, $value]);
        }
    } else {
        // global (anonymous) value stored with user_id NULL
        $stmt = $pdo->prepare('SELECT id FROM client_storage WHERE storage_key = ? AND user_id IS NULL');
        $stmt->execute([$key]);
        $exists = $stmt->fetchColumn();
        if ($exists) {
            $stmt = $pdo->prepare('UPDATE client_storage SET storage_value = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$value, $exists]);
        } else {
            $stmt = $pdo->prepare('INSERT INTO client_storage (user_id, storage_key, storage_value) VALUES (NULL, ?, ?)');
            $stmt->execute([$key, $value]);
        }
    }
    echo json_encode(['success'=>true]);
    exit;
}

if ($act === 'remove' || $act === 'delete') {
    if ($user_id !== null) {
        $stmt = $pdo->prepare('DELETE FROM client_storage WHERE storage_key = ? AND user_id = ?');
        $stmt->execute([$key, $user_id]);
    } else {
        $stmt = $pdo->prepare('DELETE FROM client_storage WHERE storage_key = ? AND user_id IS NULL');
        $stmt->execute([$key]);
    }
    echo json_encode(['success'=>true]);
    exit;
}

echo json_encode(['success'=>false,'message'=>'unknown action']);
exit;
