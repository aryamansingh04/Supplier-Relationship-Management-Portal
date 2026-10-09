<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$input = is_array($input) ? $input : [];
$email = isset($input['email']) ? trim((string) $input['email']) : '';
$password = isset($input['password']) ? (string) $input['password'] : '';
$role = isset($input['role']) ? trim((string) $input['role']) : '';

if ($email === '' || $password === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required.',
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Enter a valid email address.',
    ]);
    exit;
}

// Built-in demo accounts (used when MySQL is not running / not set up)
$demoUsers = [
    'admin@srm.local' => [
        'id' => 1,
        'full_name' => 'Admin User',
        'role' => 'admin',
        'company_name' => null,
    ],
    'supplier@srm.local' => [
        'id' => 2,
        'full_name' => 'Supplier User',
        'role' => 'supplier',
        'company_name' => 'Apex Industrial Components',
    ],
];
$demoPassword = 'password123';

$user = null;
$connection = db_try_connection();

if ($connection) {
    $stmt = $connection->prepare('SELECT id, full_name, role, password_hash, company_name FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if ($user && !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Incorrect password.',
        ]);
        exit;
    }
}

// No database, or the demo account is not in it yet -> use built-in demo accounts
if (!$user && isset($demoUsers[strtolower($email)])) {
    if (!hash_equals($demoPassword, $password)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Incorrect password.',
        ]);
        exit;
    }
    $user = $demoUsers[strtolower($email)];
}

if (!$user) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'No account found for this email address.',
    ]);
    exit;
}

if ($role !== '' && $role !== $user['role']) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Selected role does not match this account.',
    ]);
    exit;
}

session_start();
$_SESSION['user'] = [
    'id' => (int) $user['id'],
    'fullName' => $user['full_name'],
    'email' => $email,
    'role' => $user['role'],
    'companyName' => $user['company_name'] !== null ? $user['company_name'] : 'Apex Industrial Components',
];

echo json_encode([
    'success' => true,
    'message' => 'Login successful.',
    'user' => $_SESSION['user'],
]);
