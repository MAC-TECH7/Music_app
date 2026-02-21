<?php
header('Content-Type: application/json');
require_once '../cors.php';

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];


switch ($method) {
    case 'GET':
        try {
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("
                    SELECT a.*, u.name as user_name,
                           COUNT(DISTINCT s.id) as real_songs_count,
                           COALESCE(SUM(s.plays), 0) as total_plays,
                           COALESCE(SUM(s.likes), 0) as total_likes,
                           COALESCE(SUM(s.downloads), 0) as total_downloads
                    FROM artists a 
                    LEFT JOIN users u ON a.user_id = u.id 
                    LEFT JOIN songs s ON a.id = s.artist_id
                    WHERE a.id = ?
                    GROUP BY a.id
                ");
                $stmt->execute([$id]);
                $artist = $stmt->fetch();
                if ($artist) {
                    echo json_encode(['success' => true, 'data' => $artist]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Artist not found']);
                }
            } elseif (isset($_GET['user_id'])) {
                $stmt = $pdo->prepare("
                    SELECT a.*, u.name as user_name,
                           COUNT(DISTINCT s.id) as real_songs_count,
                           COALESCE(SUM(s.plays), 0) as total_plays,
                           COALESCE(SUM(s.likes), 0) as total_likes,
                           COALESCE(SUM(s.downloads), 0) as total_downloads
                    FROM artists a 
                    LEFT JOIN users u ON a.user_id = u.id 
                    LEFT JOIN songs s ON a.id = s.artist_id
                    WHERE a.user_id = ?
                    GROUP BY a.id
                ");
                $stmt->execute([$_GET['user_id']]);
                $artists = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $artists]);
            } else {
                $stmt = $pdo->query("
                    SELECT a.*, u.name as user_name,
                           COUNT(DISTINCT s.id) as real_songs_count,
                           COALESCE(SUM(s.plays), 0) as total_plays,
                           COALESCE(SUM(s.likes), 0) as total_likes,
                           COALESCE(SUM(s.downloads), 0) as total_downloads
                    FROM artists a 
                    LEFT JOIN users u ON a.user_id = u.id 
                    LEFT JOIN songs s ON a.id = s.artist_id
                    GROUP BY a.id
                    ORDER BY a.id DESC
                ");
                $artists = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $artists]);
            }
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "INSERT INTO artists (user_id, name, real_name, genre, followers, songs_count, status, verification, bio, instagram_url, twitter_url, facebook_url, youtube_url, website, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['user_id'], 
                $data['name'], 
                $data['real_name'] ?? null, 
                $data['genre'] ?? '', 
                $data['followers'] ?? 0, 
                $data['songs_count'] ?? 0, 
                $data['status'] ?? 'pending', 
                $data['verification'] ?? 'pending', 
                $data['bio'] ?? '', 
                $data['instagram_url'] ?? null, 
                $data['twitter_url'] ?? null, 
                $data['facebook_url'] ?? null, 
                $data['youtube_url'] ?? null, 
                $data['website'] ?? null, 
                $data['location'] ?? null
            ]);
            echo json_encode(['success' => true, 'message' => 'Artist created successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE artists SET name=?, real_name=?, genre=?, followers=?, songs_count=?, status=?, verification=?, bio=?, instagram_url=?, twitter_url=?, facebook_url=?, youtube_url=?, website=?, location=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['name'] ?? '', 
                $data['real_name'] ?? null,
                $data['genre'] ?? '', 
                $data['followers'] ?? 0, 
                $data['songs_count'] ?? 0, 
                $data['status'] ?? 'pending', 
                $data['verification'] ?? 'pending', 
                $data['bio'] ?? '', 
                $data['instagram_url'] ?? null, 
                $data['twitter_url'] ?? null, 
                $data['facebook_url'] ?? null, 
                $data['youtube_url'] ?? null, 
                $data['website'] ?? null, 
                $data['location'] ?? null, 
                $data['id']
            ]);
            echo json_encode(['success' => true, 'message' => 'Artist updated successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM artists WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Artist deleted successfully']);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;
}
?>