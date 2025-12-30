<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
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
            $unread_only = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
            
            if (!$user_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'user_id is required']);
                exit;
            }
            
            if ($unread_only) {
                $stmt = $pdo->prepare("
                    SELECT * FROM notifications 
                    WHERE user_id = ? AND is_read = 0 
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$user_id]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT * FROM notifications 
                    WHERE user_id = ? 
                    ORDER BY created_at DESC
                    LIMIT 100
                ");
                $stmt->execute([$user_id]);
            }
            
            $notifications = $stmt->fetchAll();
            
            // Count unread
            $stmt = $pdo->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0");
            $stmt->execute([$user_id]);
            $unread = $stmt->fetch();
            
            echo json_encode([
                'success' => true, 
                'data' => $notifications,
                'unread_count' => (int)$unread['unread_count']
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'] ?? null;
        $message = $data['message'] ?? '';
        
        if (!$user_id || empty($message)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'user_id and message are required']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)");
            $stmt->execute([$user_id, $message, 0]);
            $notification_id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true, 
                'message' => 'Notification created successfully',
                'data' => ['id' => $notification_id]
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $notification_id = $data['id'] ?? null;
        $action = $data['action'] ?? null;
        
        if (!$notification_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Notification ID is required']);
            exit;
        }
        
        try {
            if ($action === 'mark_read') {
                // Mark single notification as read
                $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
                $stmt->execute([$notification_id]);
                echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
            } elseif ($action === 'mark_all_read') {
                // Mark all user notifications as read
                $user_id = $data['user_id'] ?? null;
                if (!$user_id) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'user_id is required for mark_all_read']);
                    exit;
                }
                $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
                $stmt->execute([$user_id]);
                echo json_encode(['success' => true, 'message' => 'All notifications marked as read']);
            } else {
                // Update notification message or other fields
                $updates = [];
                $params = [];
                
                if (isset($data['message'])) {
                    $updates[] = "message = ?";
                    $params[] = $data['message'];
                }
                if (isset($data['is_read'])) {
                    $updates[] = "is_read = ?";
                    $params[] = $data['is_read'] ? 1 : 0;
                }
                
                if (empty($updates)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'No fields to update']);
                    exit;
                }
                
                $params[] = $notification_id;
                $sql = "UPDATE notifications SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                
                echo json_encode(['success' => true, 'message' => 'Notification updated successfully']);
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

