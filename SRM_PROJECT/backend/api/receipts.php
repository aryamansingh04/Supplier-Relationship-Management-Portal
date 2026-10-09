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
    $result = $connection->query('SELECT * FROM goods_receipts ORDER BY created_at DESC');
    $receipts = [];
    while ($row = $result->fetch_assoc()) {
        $row['received'] = (int)$row['received'];
        $row['accepted'] = (int)$row['accepted'];
        $receipts[] = $row;
    }
    echo json_encode([
        'success' => true,
        'receipts' => $receipts
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $input = is_array($input) ? $input : [];

    $receipt = isset($input['receipt']) ? trim((string)$input['receipt']) : '';
    $po = isset($input['po']) ? trim((string)$input['po']) : '';
    $item = isset($input['item']) ? trim((string)$input['item']) : '';
    $received = isset($input['received']) ? (int)$input['received'] : 0;
    $accepted = isset($input['accepted']) ? (int)$input['accepted'] : 0;
    $status = isset($input['status']) ? trim((string)$input['status']) : 'Approved';
    $damaged = isset($input['damaged_items']) ? (int)$input['damaged_items'] : 0;
    $remarks = isset($input['remarks']) ? trim((string)$input['remarks']) : '';
    $po_id = isset($input['po_id']) && (int)$input['po_id'] > 0 ? (int)$input['po_id'] : null;

    if ($receipt === '' || $po === '') {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Receipt ID and PO reference are required.'
        ]);
        exit;
    }

    $stmt = $connection->prepare('
        INSERT INTO goods_receipts (receipt, po, item, received, accepted, status, damaged_items, remarks, po_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE po=?, item=?, received=?, accepted=?, status=?, damaged_items=?, remarks=?, po_id=?
    ');
    $types = 'sssiisisi' . 'sssiisii';
    $stmt->bind_param(
        $types,
        $receipt, $po, $item, $received, $accepted, $status, $damaged, $remarks, $po_id,
        $po, $item, $received, $accepted, $status, $damaged, $remarks, $po_id
    );

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Goods receipt recorded successfully.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save goods receipt: ' . $stmt->error
        ]);
    }
    $stmt->close();
    exit;
}

if ($method === 'DELETE') {
    $receipt = isset($_GET['receipt']) ? trim((string)$_GET['receipt']) : '';

    if ($receipt === '') {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Receipt reference ID is required.'
        ]);
        exit;
    }

    $stmt = $connection->prepare('DELETE FROM goods_receipts WHERE receipt = ?');
    $stmt->bind_param('s', $receipt);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Receipt record deleted successfully.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete receipt record.'
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
