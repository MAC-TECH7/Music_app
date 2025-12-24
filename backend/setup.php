<?php
require_once 'db.php';

// Create database if it doesn't exist
try {
    $pdo = new PDO("mysql:host=localhost;charset=utf8", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "CREATE DATABASE IF NOT EXISTS music_app";
    $pdo->exec($sql);
    echo "Database created successfully<br>";
} catch(PDOException $e) {
    echo "Error creating database: " . $e->getMessage() . "<br>";
}

// Now connect to the database
require_once 'db.php';

// Create tables
$tables = [
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        type ENUM('admin', 'artist', 'fan', 'moderator') NOT NULL,
        status ENUM('active', 'pending', 'blocked') DEFAULT 'active',
        joined DATE DEFAULT CURRENT_DATE,
        avatar VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    "CREATE TABLE IF NOT EXISTS artists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        followers INT DEFAULT 0,
        songs_count INT DEFAULT 0,
        status ENUM('verified', 'pending', 'rejected') DEFAULT 'pending',
        verification ENUM('approved', 'pending', 'rejected') DEFAULT 'pending',
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist_id INT,
        genre VARCHAR(100),
        duration VARCHAR(10),
        plays INT DEFAULT 0,
        likes INT DEFAULT 0,
        file_path VARCHAR(500),
        cover_art VARCHAR(500),
        status ENUM('active', 'pending', 'blocked') DEFAULT 'active',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        plan_name VARCHAR(100),
        amount DECIMAL(10,2),
        status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS user_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        song_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (user_id, song_id)
    )",

    "CREATE TABLE IF NOT EXISTS playlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS playlist_songs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        playlist_id INT,
        song_id INT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reporter_id INT,
        reported_user_id INT,
        reported_song_id INT,
        type ENUM('user', 'song', 'playlist') NOT NULL,
        reason TEXT,
        status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INT,
        reviewed_at TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_song_id) REFERENCES songs(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )",

    "CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        subscription_id INT,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'XAF',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS royalties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        artist_id INT,
        song_id INT,
        amount DECIMAL(10,2) NOT NULL,
        period_start DATE,
        period_end DATE,
        plays_count INT,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        status ENUM('pending', 'paid') DEFAULT 'pending',
        FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
    )",

    "CREATE TABLE IF NOT EXISTS ad_revenue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_name VARCHAR(255),
        amount DECIMAL(10,2) NOT NULL,
        impressions INT,
        clicks INT,
        start_date DATE,
        end_date DATE,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",

    "CREATE TABLE IF NOT EXISTS featured_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_type ENUM('song', 'artist', 'playlist') NOT NULL,
        content_id INT NOT NULL,
        position INT,
        section VARCHAR(100),
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )",

    "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        parent_id INT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    )"
];

foreach ($tables as $sql) {
    try {
        $pdo->exec($sql);
        echo "Table created successfully<br>";
    } catch(PDOException $e) {
        echo "Error creating table: " . $e->getMessage() . "<br>";
    }
}

// Insert sample data
$sampleUsers = [
    ['John Mbarga', 'john.mbarga@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'fan', 'active', '2023-08-15', 'JM'],
    ['Marie Ndongo', 'marie.ndongo@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'artist', 'active', '2023-07-22', 'MN'],
    ['Pierre Essomba', 'pierre.e@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'artist', 'pending', '2023-09-10', 'PE'],
    ['Sarah Ewane', 'sarah.ewane@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'fan', 'active', '2023-06-05', 'SE'],
    ['Thomas Nkono', 'thomas.n@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'moderator', 'active', '2023-05-18', 'TN'],
    ['Alice Bikoko', 'alice.b@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'fan', 'active', '2023-10-12', 'AB'],
    ['David Essomba', 'david.e@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'artist', 'pending', '2023-11-05', 'DE'],
    ['Grace Ngo', 'grace.n@email.com', '+237 6XX XXX XXX', password_hash('password123', PASSWORD_DEFAULT), 'fan', 'blocked', '2023-04-22', 'GN']
];

$sql = "INSERT INTO users (name, email, phone, password, type, status, joined, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);

foreach ($sampleUsers as $user) {
    try {
        $stmt->execute($user);
        echo "User inserted<br>";
    } catch(PDOException $e) {
        echo "Error inserting user: " . $e->getMessage() . "<br>";
    }
}

// Insert sample artists
$sampleArtists = [
    [2, 'Manu Dibango Legacy', 'Makossa', 150000, 45, 'verified', 'approved'],
    [3, 'Bikutsi Queens', 'Bikutsi', 85000, 28, 'verified', 'approved'],
    [null, 'Yaoundé Vibes', 'Afrobeat', 210000, 62, 'verified', 'approved'],
    [7, 'Bamenda Roots', 'Traditional', 95000, 37, 'pending', 'pending'],
    [null, 'Douala Beats', 'Assiko', 120000, 41, 'verified', 'approved'],
    [null, 'Afrobeat Collective', 'Afrobeat', 180000, 52, 'verified', 'approved'],
    [null, 'Makossa Masters', 'Makossa', 75000, 33, 'pending', 'pending'],
    [null, 'Gospel Harmony', 'Gospel', 110000, 48, 'verified', 'approved']
];

$sql = "INSERT INTO artists (user_id, name, genre, followers, songs_count, status, verification) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);

foreach ($sampleArtists as $artist) {
    try {
        $stmt->execute($artist);
        echo "Artist inserted<br>";
    } catch(PDOException $e) {
        echo "Error inserting artist: " . $e->getMessage() . "<br>";
    }
}

// Insert sample songs
$sampleSongs = [
    ['Soul Makossa', 1, 'Makossa', '4:32', 1500000, 85000],
    ['Bikutsi Dance', 2, 'Bikutsi', '3:45', 950000, 62000],
    ['Yaoundé Nights', 3, 'Afrobeat', '5:12', 2100000, 120000],
    ['Bamenda Spirit', 4, 'Traditional', '6:18', 780000, 45000],
    ['Douala Groove', 5, 'Assiko', '4:55', 1100000, 78000],
    ['Afrobeat Fusion', 6, 'Afrobeat', '4:28', 1800000, 95000],
    ['Makossa Classic', 7, 'Makossa', '5:03', 650000, 38000],
    ['Gospel Joy', 8, 'Gospel', '4:41', 920000, 71000]
];

$sql = "INSERT INTO songs (title, artist_id, genre, duration, plays, likes) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);

foreach ($sampleSongs as $song) {
    try {
        $stmt->execute($song);
        echo "Song inserted<br>";
    } catch(PDOException $e) {
        echo "Error inserting song: " . $e->getMessage() . "<br>";
    }
}

echo "Database setup completed!";
?>