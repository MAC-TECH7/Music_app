<?php
header('Content-Type: application/json');
require_once '../cors.php';

require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM plans ORDER BY id ASC");
            $plans = $stmt->fetchAll();
            // Decode JSON features for frontend
            foreach ($plans as &$plan) {
                $plan['features'] = json_decode($plan['features']);
                $plan['is_popular'] = (bool)$plan['is_popular'];
            }
            echo json_encode(['success' => true, 'data' => $plans]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "INSERT INTO plans (name, price, currency, period, description, features, is_popular, button_text, button_style) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            
            $features = is_array($data['features']) ? json_encode($data['features']) : $data['features'];
            $is_popular = isset($data['is_popular']) ? (int)$data['is_popular'] : 0;
            
            $stmt->execute([
                $data['name'], 
                $data['price'], 
                $data['currency'] ?? 'FCFA', 
                $data['period'] ?? '/month', 
                $data['description'], 
                $features, 
                $is_popular,
                $data['button_text'] ?? 'Choose Plan',
                $data['button_style'] ?? 'btn-outline-primary'
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Plan created successfully', 'id' => $pdo->lastInsertId()]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $sql = "UPDATE plans SET name=?, price=?, currency=?, period=?, description=?, features=?, is_popular=?, button_text=?, button_style=? WHERE id=?";
            $stmt = $pdo->prepare($sql);
            
            $features = is_array($data['features']) ? json_encode($data['features']) : $data['features'];
            $is_popular = isset($data['is_popular']) ? (int)$data['is_popular'] : 0;

            $stmt->execute([
                $data['name'], 
                $data['price'], 
                $data['currency'], 
                $data['period'], 
                $data['description'], 
                $features, 
                $is_popular,
                $data['button_text'],
                $data['button_style'],
                $data['id']
            ]);
            echo json_encode(['success' => true, 'message' => 'Plan updated successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM plans WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'Plan deleted successfully']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;
}
?>
