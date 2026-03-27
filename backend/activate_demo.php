<?php
// activate_demo.php — Admin only: activates the seeded demo accounts.
// This file should ONLY be accessible to logged-in admins.
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user']) || !$_SESSION['user']['isLoggedIn'] || $_SESSION['user']['type'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden: admin access required']);
    exit;
}

require_once 'db.php';

function demo_env(string $key, string $default = ''): string
{
    $value = getenv($key);
    if ($value !== false) {
        return $value;
    }

    static $envVars = null;
    if ($envVars === null) {
        $envVars = [];
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                    continue;
                }
                [$k, $v] = explode('=', $line, 2);
                $envVars[trim($k)] = trim($v);
            }
        }
    }

    return $envVars[$key] ?? $default;
}

try {
    $adminEmail = demo_env('ADMIN_EMAIL', 'camsound@gmail.com');
    $demo_emails = [
        'john.mbarga@email.com',
        'marie.ndongo@email.com',
        $adminEmail
    ];

    $placeholders = str_repeat('?,', count($demo_emails) - 1) . '?';
    $sql = "UPDATE users SET status = 'active' WHERE email IN ($placeholders)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($demo_emails);
    $count = $stmt->rowCount();

    echo json_encode([
        'success' => true,
        'message' => "Successfully activated $count demo accounts.",
        'affected_rows' => $count
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
