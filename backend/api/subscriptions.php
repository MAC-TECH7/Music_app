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
            $stmt = $pdo->query("SELECT s.*, u.name as user_name FROM subscriptions s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.id DESC");
            $subscriptions = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $subscriptions]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "INSERT INTO subscriptions (user_id, plan_name, amount, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['user_id'], $data['plan_name'], $data['amount'], $data['status'] ?? 'active', $data['start_date'], $data['end_date']]);
            echo json_encode(['success' => true, 'message' => 'Subscription created successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE subscriptions SET user_id=?, plan_name=?, amount=?, status=?, start_date=?, end_date=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data['user_id'], $data['plan_name'], $data['amount'], $data['status'], $data['start_date'], $data['end_date'], $data['id']]);
            echo json_encode(['success' => true, 'message' => 'Subscription updated successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM subscriptions WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Subscription deleted successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
}
?>