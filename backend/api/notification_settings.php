<?php
header('Content-Type: application/json');
require_once '../db.php';
session_start();

$userId = $_SESSION['user']['id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT notif_new_followers, notif_comments, notif_stream_milestones, notif_revenue_updates, notif_marketing FROM user_notification_settings WHERE user_id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        // Defaults if not set
        $row = [
            'notif_new_followers' => 1,
            'notif_comments' => 1,
            'notif_stream_milestones' => 1,
            'notif_revenue_updates' => 1,
            'notif_marketing' => 1
        ];
    }
    echo json_encode(['success' => true, 'data' => $row]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO user_notification_settings (user_id, notif_new_followers, notif_comments, notif_stream_milestones, notif_revenue_updates, notif_marketing) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE notif_new_followers=VALUES(notif_new_followers), notif_comments=VALUES(notif_comments), notif_stream_milestones=VALUES(notif_stream_milestones), notif_revenue_updates=VALUES(notif_revenue_updates), notif_marketing=VALUES(notif_marketing)');
    $stmt->execute([
        $userId,
        !empty($input['notif_new_followers']) ? 1 : 0,
        !empty($input['notif_comments']) ? 1 : 0,
        !empty($input['notif_stream_milestones']) ? 1 : 0,
        !empty($input['notif_revenue_updates']) ? 1 : 0,
        !empty($input['notif_marketing']) ? 1 : 0
    ]);
    echo json_encode(['success' => true, 'message' => 'Notification settings saved']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
