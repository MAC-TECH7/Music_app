<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'OPTIONS') {
    exit(0);
}

// Sessions and admin check
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

$me = getCurrentUserInfo($pdo);
if (!$me || $me['type'] !== 'admin'){
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

switch ($method) {
    case 'GET':
        handleGetRequests($action);
        break;
    case 'POST':
        handlePostRequests($action);
        break;
    case 'PUT':
        handlePutRequests($action);
        break;
    case 'DELETE':
        handleDeleteRequests($action);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function handleGetRequests($action) {
    global $pdo;

    try {
        switch ($action) {
            case 'users':
                $type = $_GET['type'] ?? '';
                $status = $_GET['status'] ?? '';
                $sql = "SELECT id, name, email, phone, type, status, joined, avatar FROM users WHERE 1=1";
                $params = [];

                if ($type) {
                    $sql .= " AND type = ?";
                    $params[] = $type;
                }
                if ($status) {
                    $sql .= " AND status = ?";
                    $params[] = $status;
                }

                $sql .= " ORDER BY id DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $users = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $users]);
                break;

            case 'artists':
                $verification = $_GET['verification'] ?? '';
                $sql = "SELECT a.*, u.name as user_name, u.email FROM artists a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1";
                $params = [];

                if ($verification) {
                    $sql .= " AND a.verification = ?";
                    $params[] = $verification;
                }

                $sql .= " ORDER BY a.id DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $artists = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $artists]);
                break;

            case 'songs':
                $status = $_GET['status'] ?? '';
                $sql = "SELECT s.*, a.name as artist_name FROM songs s JOIN artists a ON s.artist_id = a.id WHERE 1=1";
                $params = [];

                if ($status) {
                    $sql .= " AND s.status = ?";
                    $params[] = $status;
                }

                $sql .= " ORDER BY s.id DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $songs = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $songs]);
                break;

            case 'reports':
                $status = $_GET['status'] ?? '';
                $sql = "SELECT r.*, ru.name as reporter_name, rd.name as reported_name, s.title as song_title
                        FROM reports r
                        LEFT JOIN users ru ON r.reporter_id = ru.id
                        LEFT JOIN users rd ON r.reported_user_id = rd.id
                        LEFT JOIN songs s ON r.reported_song_id = s.id
                        WHERE 1=1";
                $params = [];

                if ($status) {
                    $sql .= " AND r.status = ?";
                    $params[] = $status;
                }

                $sql .= " ORDER BY r.created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $reports = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $reports]);
                break;

            case 'activity_logs':
                $user_id = $_GET['user_id'] ?? '';
                $sql = "SELECT al.*, u.name FROM activity_logs al JOIN users u ON al.user_id = u.id WHERE 1=1";
                $params = [];

                if ($user_id) {
                    $sql .= " AND al.user_id = ?";
                    $params[] = $user_id;
                }

                $sql .= " ORDER BY al.created_at DESC LIMIT 100";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $logs = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $logs]);
                break;

            case 'revenue':
                // Get revenue data
                $period = $_GET['period'] ?? 'month'; // month, quarter, year

                $dateCondition = "";
                switch ($period) {
                    case 'month':
                        $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)";
                        break;
                    case 'quarter':
                        $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
                        break;
                    case 'year':
                        $dateCondition = "AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)";
                        break;
                }

                // Subscription revenue
                $stmt = $pdo->prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'completed' $dateCondition");
                $stmt->execute();
                $subscriptionRevenue = $stmt->fetch()['total'] ?? 0;

                // Ad revenue
                $stmt = $pdo->prepare("SELECT SUM(amount) as total FROM ad_revenue WHERE status = 'completed' $dateCondition");
                $stmt->execute();
                $adRevenue = $stmt->fetch()['total'] ?? 0;

                // Royalties paid
                $stmt = $pdo->prepare("SELECT SUM(amount) as total FROM royalties WHERE status = 'paid' $dateCondition");
                $stmt->execute();
                $royaltiesPaid = $stmt->fetch()['total'] ?? 0;

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'subscription_revenue' => floatval($subscriptionRevenue),
                        'ad_revenue' => floatval($adRevenue),
                        'royalties_paid' => floatval($royaltiesPaid),
                        'total_revenue' => floatval($subscriptionRevenue) + floatval($adRevenue),
                        'period' => $period
                    ]
                ]);
                break;

            case 'analytics':
                // General analytics
                $stmt = $pdo->query("SELECT COUNT(*) as total_users FROM users");
                $totalUsers = $stmt->fetch()['total_users'];

                $stmt = $pdo->query("SELECT COUNT(*) as total_artists FROM artists WHERE verification = 'approved'");
                $totalArtists = $stmt->fetch()['total_artists'];

                $stmt = $pdo->query("SELECT COUNT(*) as total_songs FROM songs WHERE status = 'active'");
                $totalSongs = $stmt->fetch()['total_songs'];

                $stmt = $pdo->query("SELECT SUM(plays) as total_plays FROM songs");
                $totalPlays = $stmt->fetch()['total_plays'];

                $stmt = $pdo->query("SELECT COUNT(*) as active_subscriptions FROM subscriptions WHERE status = 'active'");
                $activeSubscriptions = $stmt->fetch()['active_subscriptions'];

                echo json_encode([
                    'success' => true,
                    'data' => [
                        'total_users' => intval($totalUsers),
                        'total_artists' => intval($totalArtists),
                        'total_songs' => intval($totalSongs),
                        'total_plays' => intval($totalPlays),
                        'active_subscriptions' => intval($activeSubscriptions)
                    ]
                ]);
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } catch(PDOException $e) {
        logError($e);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error']);
    }
}

function handlePostRequests($action) {
    global $pdo;
    $data = json_decode(file_get_contents('php://input'), true);

    try {
        switch ($action) {
            case 'approve_artist':
                $sql = "UPDATE artists SET verification = 'approved', status = 'verified' WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data['artist_id']]);
                echo json_encode(['success' => true, 'message' => 'Artist approved successfully']);
                break;

            case 'reject_artist':
                $sql = "UPDATE artists SET verification = 'rejected', status = 'pending' WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data['artist_id']]);
                echo json_encode(['success' => true, 'message' => 'Artist rejected']);
                break;

            case 'approve_song':
                $sql = "UPDATE songs SET status = 'active' WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data['song_id']]);
                echo json_encode(['success' => true, 'message' => 'Song approved successfully']);
                break;

            case 'block_song':
                $sql = "UPDATE songs SET status = 'blocked' WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data['song_id']]);
                echo json_encode(['success' => true, 'message' => 'Song blocked']);
                break;

            case 'feature_content':
                $sql = "INSERT INTO featured_content (content_type, content_id, position, section, start_date, end_date, created_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $data['content_type'],
                    $data['content_id'],
                    $data['position'] ?? 1,
                    $data['section'] ?? 'homepage',
                    $data['start_date'],
                    $data['end_date'],
                    $data['admin_id'] ?? 1
                ]);
                echo json_encode(['success' => true, 'message' => 'Content featured successfully']);
                break;

            case 'resolve_report':
                $sql = "UPDATE reports SET status = 'resolved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data['admin_id'] ?? 1, $data['report_id']]);
                echo json_encode(['success' => true, 'message' => 'Report resolved']);
                break;

            case 'assign_role':
                $sql = "UPDATE users SET type = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data['role'], $data['user_id']]);
                echo json_encode(['success' => true, 'message' => 'Role assigned successfully']);
                break;

            case 'change_status':
                $sql = "UPDATE users SET status = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data['status'], $data['user_id']]);
                echo json_encode(['success' => true, 'message' => 'User status updated']);
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } catch(PDOException $e) {
        logError($e);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error']);
    }
}

function handlePutRequests($action) {
    // Similar to POST, for updates
    handlePostRequests($action);
}

function handleDeleteRequests($action) {
    global $pdo;

    try {
        switch ($action) {
            case 'user':
                $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid id']);
                    return;
                }
                $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
                break;

            case 'featured_content':
                $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid id']);
                    return;
                }
                $stmt = $pdo->prepare("DELETE FROM featured_content WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Featured content removed']);
                break;

            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } catch(PDOException $e) {
        logError($e);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error']);
    }
}
?>