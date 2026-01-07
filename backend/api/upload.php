<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session for authentication
session_start();

// Check if user is authenticated
if (!isset($_SESSION['user']) || !$_SESSION['user']['isLoggedIn']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Create uploads directory if it doesn't exist
$uploadDir = '../../uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Create subdirectories for organization
$songsDir = $uploadDir . 'songs/';
$artworkDir = $uploadDir . 'artwork/';

if (!file_exists($songsDir)) {
    mkdir($songsDir, 0755, true);
}
if (!file_exists($artworkDir)) {
    mkdir($artworkDir, 0755, true);
}

$response = ['success' => false, 'message' => ''];

try {
    // Get upload type and metadata
    $uploadType = $_POST['upload_type'] ?? '';
    $title = trim($_POST['title'] ?? '');
    $genre = trim($_POST['genre'] ?? '');
    $artistId = $_POST['artist_id'] ?? null;

    // Validate required fields
    if (empty($uploadType)) {
        throw new Exception('Upload type is required');
    }

    if ($uploadType === 'song') {
        if (empty($title) || empty($genre)) {
            throw new Exception('Title and genre are required for song uploads');
        }

        // Handle song file upload
        if (!isset($_FILES['song_file'])) {
            throw new Exception('Song file is required');
        }

        $songFile = $_FILES['song_file'];
        $allowedSongTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
        $maxSongSize = 50 * 1024 * 1024; // 50MB

        // Validate song file
        if (!in_array($songFile['type'], $allowedSongTypes)) {
            throw new Exception('Invalid song file type. Only MP3, WAV, and OGG files are allowed.');
        }

        if ($songFile['size'] > $maxSongSize) {
            throw new Exception('Song file size exceeds 50MB limit.');
        }

        // Generate unique filename for song
        $songExtension = pathinfo($songFile['name'], PATHINFO_EXTENSION);
        $songFilename = uniqid('song_', true) . '.' . $songExtension;
        $songPath = $songsDir . $songFilename;

        // Move uploaded song file
        if (!move_uploaded_file($songFile['tmp_name'], $songPath)) {
            throw new Exception('Failed to save song file');
        }

        // Handle cover art if provided
        $coverArtPath = null;
        if (isset($_FILES['cover_art']) && $_FILES['cover_art']['error'] !== UPLOAD_ERR_NO_FILE) {
            $coverFile = $_FILES['cover_art'];
            $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $maxImageSize = 5 * 1024 * 1024; // 5MB

            if (!in_array($coverFile['type'], $allowedImageTypes)) {
                throw new Exception('Invalid cover art file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
            }

            if ($coverFile['size'] > $maxImageSize) {
                throw new Exception('Cover art file size exceeds 5MB limit.');
            }

            $coverExtension = pathinfo($coverFile['name'], PATHINFO_EXTENSION);
            $coverFilename = uniqid('cover_', true) . '.' . $coverExtension;
            $coverArtPath = $artworkDir . $coverFilename;

            if (!move_uploaded_file($coverFile['tmp_name'], $coverArtPath)) {
                // Don't fail the whole upload if cover art fails
                $coverArtPath = null;
            }
        }

        // Get duration from file (simplified - in production you'd use a proper audio library)
        $duration = '0:00'; // Placeholder - would need audio processing library

        // Insert song into database
        $stmt = $pdo->prepare("INSERT INTO songs (title, artist_id, genre, duration, file_path, cover_art, status, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())");
        $stmt->execute([
            $title,
            $artistId,
            $genre,
            $duration,
            '/uploads/songs/' . $songFilename,
            $coverArtPath ? '/uploads/artwork/' . basename($coverArtPath) : null
        ]);

        $songId = $pdo->lastInsertId();

        $response = [
            'success' => true,
            'message' => 'Song uploaded successfully and pending review',
            'data' => [
                'song_id' => $songId,
                'file_path' => '/uploads/songs/' . $songFilename,
                'cover_art' => $coverArtPath ? '/uploads/artwork/' . basename($coverArtPath) : null
            ]
        ];

    } elseif ($uploadType === 'artwork') {
        // Handle standalone artwork upload
        if (!isset($_FILES['cover_art'])) {
            throw new Exception('Cover art file is required');
        }

        $coverFile = $_FILES['cover_art'];
        $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxImageSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($coverFile['type'], $allowedImageTypes)) {
            throw new Exception('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
        }

        if ($coverFile['size'] > $maxImageSize) {
            throw new Exception('File size exceeds 5MB limit.');
        }

        $coverExtension = pathinfo($coverFile['name'], PATHINFO_EXTENSION);
        $coverFilename = uniqid('cover_', true) . '.' . $coverExtension;
        $coverArtPath = $artworkDir . $coverFilename;

        if (!move_uploaded_file($coverFile['tmp_name'], $coverArtPath)) {
            throw new Exception('Failed to save cover art file');
        }

        $response = [
            'success' => true,
            'message' => 'Cover art uploaded successfully',
            'data' => [
                'file_path' => '/uploads/artwork/' . $coverFilename
            ]
        ];

    } else {
        throw new Exception('Invalid upload type');
    }

} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];

    // Clean up uploaded files if something went wrong
    if (isset($songPath) && file_exists($songPath)) {
        unlink($songPath);
    }
    if (isset($coverArtPath) && file_exists($coverArtPath)) {
        unlink($coverArtPath);
    }
}

echo json_encode($response);
?>