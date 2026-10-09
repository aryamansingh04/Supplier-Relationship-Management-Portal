<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$connection = db_connection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $connection->query('SELECT * FROM compliance_documents ORDER BY created_at DESC');
    $docs = [];
    while ($row = $result->fetch_assoc()) {
        $docs[] = $row;
    }
    echo json_encode([
        'success' => true,
        'compliance' => $docs
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $input = is_array($input) ? $input : [];

    $id = isset($input['id']) ? trim((string)$input['id']) : '';
    $type = isset($input['type']) ? trim((string)$input['type']) : '';
    $issuer = isset($input['issuer']) ? trim((string)$input['issuer']) : '';
    $expiry = isset($input['expiry']) ? trim((string)$input['expiry']) : '';
    $status = isset($input['status']) ? trim((string)$input['status']) : 'Active';

    if ($id === '' || $type === '') {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Document ID and Type are required.'
        ]);
        exit;
    }

    $stmt = $connection->prepare('INSERT INTO compliance_documents (id, type, issuer, expiry, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=?, issuer=?, expiry=?, status=?');
    $stmt->bind_param('sssssssss', $id, $type, $issuer, $expiry, $status, $type, $issuer, $expiry, $status);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Compliance document saved successfully.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save compliance document: ' . $stmt->error
        ]);
    }
    $stmt->close();
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? trim((string)$_GET['id']) : '';

    if ($id === '') {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Document ID is required.'
        ]);
        exit;
    }

    $stmt = $connection->prepare('DELETE FROM compliance_documents WHERE id = ?');
    $stmt->bind_param('s', $id);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Compliance document removed successfully.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to remove compliance document.'
        ]);
    }
    $stmt->close();
    exit;
}

http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Method not allowed.'
]);
