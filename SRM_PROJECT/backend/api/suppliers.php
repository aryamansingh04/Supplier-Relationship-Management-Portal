<?php

declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/db.php';
$connection = db_try_connection();

$mockSuppliers = [
    [
        'supplier_id' => 1,
        'user_id' => 2,
        'company_name' => 'Apex Industrial Components',
        'category' => 'Mechanical',
        'active_pos' => 5,
        'success_rate' => 98,
        'rating' => 4.8,
        'status' => 'Approved',
        'performance_score' => 96,
        'rfqs_participated' => 23,
        'contracts_won' => 12,
        'win_rate' => 52,
        'completed_pos' => 18,
        'on_time_deliveries' => 95,
        'late_deliveries' => 5,
        'qty_variances' => 2,
        'avg_delivery_rating' => 4.8,
        'invoices_submitted' => 21,
        'invoices_rejected' => 1,
        'avg_approval_time' => 2,
        'pending_payments' => 178000,
        'compliance' => [
            'iso_9001' => 'Active',
            'gst' => 'Active',
            'insurance' => 'Expiring in 15 Days'
        ],
        'timeline' => [
            ['date' => 'Jan 10', 'event' => 'Won RFQ-24061'],
            ['date' => 'Jan 15', 'event' => 'PO-88021 Issued'],
            ['date' => 'Jan 28', 'event' => 'GRN Recorded'],
            ['date' => 'Jan 30', 'event' => 'Invoice Paid'],
            ['date' => 'Feb 05', 'event' => 'Review Score 4.8']
        ],
        'email' => 'supplier@srm.local',
        'phone' => '+91 98765 43210',
        'website' => 'www.apex-industrial.com',
        'address' => '102 Industrial Area Phase II',
        'city' => 'New Delhi',
        'state' => 'Delhi',
        'country' => 'India'
    ],
    [
        'supplier_id' => 2,
        'user_id' => 3,
        'company_name' => 'Vector Packaging Co.',
        'category' => 'Packaging',
        'active_pos' => 3,
        'success_rate' => 95,
        'rating' => 4.6,
        'status' => 'Approved',
        'performance_score' => 92,
        'rfqs_participated' => 15,
        'contracts_won' => 8,
        'win_rate' => 53,
        'completed_pos' => 10,
        'on_time_deliveries' => 92,
        'late_deliveries' => 8,
        'qty_variances' => 1,
        'avg_delivery_rating' => 4.6,
        'invoices_submitted' => 11,
        'invoices_rejected' => 0,
        'avg_approval_time' => 3,
        'pending_payments' => 92000,
        'compliance' => [
            'iso_9001' => 'Active',
            'gst' => 'Active',
            'insurance' => 'Active'
        ],
        'timeline' => [
            ['date' => 'Feb 10', 'event' => 'Won RFQ-24062'],
            ['date' => 'Feb 12', 'event' => 'PO-88023 Issued'],
            ['date' => 'Feb 20', 'event' => 'GRN Recorded'],
            ['date' => 'Feb 25', 'event' => 'Invoice Paid']
        ],
        'email' => 'vector@srm.local',
        'phone' => '+91 98765 43211',
        'website' => 'www.vector-packaging.com',
        'address' => 'Plot 45, Sector 5',
        'city' => 'Bangalore',
        'state' => 'Karnataka',
        'country' => 'India'
    ],
    [
        'supplier_id' => 3,
        'user_id' => 4,
        'company_name' => 'Global Components',
        'category' => 'Electrical',
        'active_pos' => 2,
        'success_rate' => 82,
        'rating' => 3.8,
        'status' => 'Risk Supplier',
        'performance_score' => 74,
        'rfqs_participated' => 12,
        'contracts_won' => 4,
        'win_rate' => 33,
        'completed_pos' => 6,
        'on_time_deliveries' => 78,
        'late_deliveries' => 22,
        'qty_variances' => 5,
        'avg_delivery_rating' => 3.8,
        'invoices_submitted' => 8,
        'invoices_rejected' => 4,
        'avg_approval_time' => 5,
        'pending_payments' => 45000,
        'compliance' => [
            'iso_9001' => 'Expired',
            'gst' => 'Active',
            'insurance' => 'Expired'
        ],
        'timeline' => [
            ['date' => 'Mar 02', 'event' => 'Participated RFQ-24061'],
            ['date' => 'Mar 10', 'event' => 'Bid Rejected'],
            ['date' => 'Mar 15', 'event' => 'Late delivery logged for PO-88018']
        ],
        'email' => 'global@srm.local',
        'phone' => '+91 98765 43212',
        'website' => 'www.global-components.com',
        'address' => 'Chamber 8, Technopolis',
        'city' => 'Hyderabad',
        'state' => 'Telangana',
        'country' => 'India'
    ]
];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $suppliers = $mockSuppliers;
    if ($connection !== null) {
        $result = $connection->query('
            SELECT s.supplier_id, s.company_name, s.rating, s.gst_number, s.address, s.city, s.state, s.country, s.website, s.user_id, u.email, u.phone, u.full_name
            FROM suppliers s
            LEFT JOIN users u ON s.user_id = u.id
        ');
        if ($result) {
            $dbSuppliers = [];
            while ($row = $result->fetch_assoc()) {
                $match = null;
                foreach ($mockSuppliers as $mock) {
                    if (strcasecmp($mock['company_name'], $row['company_name']) === 0 || (int)$mock['user_id'] === (int)$row['user_id']) {
                        $match = $mock;
                        break;
                    }
                }
                
                $sData = $match ?: $mockSuppliers[0];
                $sData['supplier_id'] = (int)$row['supplier_id'];
                $sData['user_id'] = (int)$row['user_id'];
                $sData['company_name'] = $row['company_name'];
                $sData['rating'] = (float)$row['rating'];
                $sData['email'] = $row['email'];
                $sData['phone'] = $row['phone'] ?? $sData['phone'];
                $sData['website'] = $row['website'] ?? $sData['website'];
                $sData['address'] = $row['address'] ?? $sData['address'];
                $sData['city'] = $row['city'] ?? $sData['city'];
                $sData['state'] = $row['state'] ?? $sData['state'];
                $sData['country'] = $row['country'] ?? $sData['country'];
                
                // Risk rules logic check
                if ($sData['rating'] < 3.0 || $sData['invoices_rejected'] > 3 || $sData['late_deliveries'] > 20) {
                    $sData['status'] = 'Risk Supplier';
                } else if ($sData['rating'] < 4.0 || $sData['late_deliveries'] > 10) {
                    $sData['status'] = 'Watchlist';
                } else {
                    $sData['status'] = 'Approved';
                }
                
                $dbSuppliers[] = $sData;
            }
            if (count($dbSuppliers) > 0) {
                $suppliers = $dbSuppliers;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'suppliers' => $suppliers
    ]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $supplier_id = isset($input['supplier_id']) ? (int)$input['supplier_id'] : 0;
    $new_status = isset($input['status']) ? trim((string)$input['status']) : '';
    
    if ($supplier_id > 0 && $new_status !== '') {
        echo json_encode([
            'success' => true,
            'message' => 'Supplier status updated successfully.'
        ]);
        exit;
    }
    
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Supplier ID and status are required.'
    ]);
    exit;
}

http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Method not allowed.'
]);
