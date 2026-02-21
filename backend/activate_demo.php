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

try {
    $demo_emails = [
        'john.mbarga@email.com',
        'marie.ndongo@email.com',
        'thomas.n@email.com'
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
