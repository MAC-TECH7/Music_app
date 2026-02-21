<?php
header('Content-Type: application/json');
require_once '../cors.php';

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $user_id = $_GET['user_id'] ?? null;
            $playlist_id = $_GET['playlist_id'] ?? null;
            
            if ($playlist_id) {
                // Get single playlist with songs
                $stmt = $pdo->prepare("
                    SELECT p.*, u.name as creator_name,
                    COUNT(ps.song_id) as song_count
                    FROM playlists p
                    LEFT JOIN users u ON p.user_id = u.id
                    LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
                    WHERE p.id = ?
                    GROUP BY p.id
                ");
                $stmt->execute([$playlist_id]);
                $playlist = $stmt->fetch();
                
                if (!$playlist) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Playlist not found']);
                    exit;
                }
                
                // Get songs in playlist
                $stmt = $pdo->prepare("
                    SELECT s.*, a.name as artist_name, ps.added_at
                    FROM playlist_songs ps
                    JOIN songs s ON ps.song_id = s.id
                    LEFT JOIN artists a ON s.artist_id = a.id
                    WHERE ps.playlist_id = ?
                    ORDER BY ps.added_at ASC
                ");
                $stmt->execute([$playlist_id]);
                $songs = $stmt->fetchAll();
                
                $playlist['songs'] = $songs;
                echo json_encode(['success' => true, 'data' => $playlist]);
            } else {
                // Get all playlists or user's playlists
                $type = $_GET['type'] ?? '';

                if ($type === 'public') {
                     $stmt = $pdo->query("
                        SELECT p.*, u.name as creator_name,
                        COUNT(ps.song_id) as song_count
                        FROM playlists p
                        LEFT JOIN users u ON p.user_id = u.id
                        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
                        WHERE p.is_public = 1
                        GROUP BY p.id, u.name
                        ORDER BY p.likes DESC, p.created_at DESC
                        LIMIT 20
                    ");
                } elseif ($user_id) {
                    $stmt = $pdo->prepare("
                        SELECT p.*, u.name as creator_name,
                        COUNT(ps.song_id) as song_count
                        FROM playlists p
                        LEFT JOIN users u ON p.user_id = u.id
                        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
                        WHERE p.user_id = ? OR p.is_public = 1
                        GROUP BY p.id, u.name
                        ORDER BY p.created_at DESC
                    ");
                    $stmt->execute([$user_id]);
                } else {
                    $stmt = $pdo->query("
                        SELECT p.*, u.name as creator_name,
                        COUNT(ps.song_id) as song_count
                        FROM playlists p
                        LEFT JOIN users u ON p.user_id = u.id
                        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
                        GROUP BY p.id, u.name
                        ORDER BY p.created_at DESC
                    ");
                }
                $playlists = $stmt->fetchAll();
                echo json_encode(['success' => true, 'data' => $playlists]);
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Check if adding song to playlist or creating playlist
        if (isset($data['playlist_id']) && isset($data['song_id'])) {
            // Add song to playlist
            try {
                // Check if song already in playlist
                $stmt = $pdo->prepare("SELECT id FROM playlist_songs WHERE playlist_id = ? AND song_id = ?");
                $stmt->execute([$data['playlist_id'], $data['song_id']]);
                if ($stmt->fetch()) {
                    http_response_code(409);
                    echo json_encode(['success' => false, 'message' => 'Song already in playlist']);
                    exit;
                }
                
                $stmt = $pdo->prepare("INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)");
                $stmt->execute([$data['playlist_id'], $data['song_id']]);
                echo json_encode(['success' => true, 'message' => 'Song added to playlist']);
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            // Create new playlist
            $user_id = $data['user_id'] ?? null;
            $name = $data['name'] ?? '';
            $description = $data['description'] ?? '';
            $is_public = $data['is_public'] ?? false;
            
            if (empty($name) || !$user_id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Playlist name and user_id are required']);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare("INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)");
                $stmt->execute([$user_id, $name, $description, $is_public ? 1 : 0]);
                $playlist_id = $pdo->lastInsertId();
                
                // Add songs if provided
                if (isset($data['songs']) && is_array($data['songs'])) {
                    $stmt = $pdo->prepare("INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)");
                    foreach ($data['songs'] as $song_id) {
                        $stmt->execute([$playlist_id, $song_id]);
                    }
                }
                
                echo json_encode(['success' => true, 'message' => 'Playlist created successfully', 'data' => ['id' => $playlist_id]]);
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $playlist_id = $data['playlist_id'] ?? null;
        
        if (!$playlist_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'playlist_id is required']);
            exit;
        }
        
        // Check if removing song from playlist
        if (isset($data['action']) && $data['action'] === 'remove_song' && isset($data['song_id'])) {
            try {
                $stmt = $pdo->prepare("DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?");
                $stmt->execute([$playlist_id, $data['song_id']]);
                echo json_encode(['success' => true, 'message' => 'Song removed from playlist']);
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            // Update playlist details
            try {
                $updates = [];
                $params = [];
                
                if (isset($data['name'])) {
                    $updates[] = "name = ?";
                    $params[] = $data['name'];
                }
                if (isset($data['description'])) {
                    $updates[] = "description = ?";
                    $params[] = $data['description'];
                }
                if (isset($data['is_public'])) {
                    $updates[] = "is_public = ?";
                    $params[] = $data['is_public'] ? 1 : 0;
                }
                
                if (empty($updates)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'No fields to update']);
                    exit;
                }
                
                $params[] = $playlist_id;
                $sql = "UPDATE playlists SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                
                echo json_encode(['success' => true, 'message' => 'Playlist updated successfully']);
            } catch(PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        $playlist_id = $_GET['id'] ?? null;
        
        if (!$playlist_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Playlist ID is required']);
            exit;
        }
        
        try {
            // Delete playlist (cascade will delete playlist_songs)
            $stmt = $pdo->prepare("DELETE FROM playlists WHERE id = ?");
            $stmt->execute([$playlist_id]);
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Playlist not found']);
            } else {
                echo json_encode(['success' => true, 'message' => 'Playlist deleted successfully']);
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

