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
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT s.*, u.name as user_name FROM subscriptions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.id DESC");
            $subscriptions = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $subscriptions]);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // Only admin or the user themselves can create subscriptions
        $me = getCurrentUserInfo($pdo);
        if (!$me){ http_response_code(403); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }

        $user_id = intval($data['user_id'] ?? 0);
        if ($me['type'] !== 'admin' && $me['id'] !== $user_id){ http_response_code(403); echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }

        $plan = trim($data['plan_name'] ?? '');
        if (!$plan){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Missing plan_name']); exit; }

        try {
            $sql = "INSERT INTO subscriptions (user_id, plan_name, amount, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$user_id, $plan, $data['amount'] ?? 0, $data['status'] ?? 'active', $data['start_date'] ?? null, $data['end_date'] ?? null]);
            echo json_encode(['success' => true, 'message' => 'Subscription created successfully']);
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

        try {
            $sql = "UPDATE subscriptions SET user_id=?, plan_name=?, amount=?, status=?, start_date=?, end_date=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['user_id'], $data['plan_name'], $data['amount'], $data['status'], $data['start_date'], $data['end_date'], $id]);
            echo json_encode(['success' => true, 'message' => 'Subscription updated successfully']);
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
            $stmt = $pdo->prepare("DELETE FROM subscriptions WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Subscription deleted successfully']);
        } catch(PDOException $e) {
            logError($e);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
        break;
}
?>