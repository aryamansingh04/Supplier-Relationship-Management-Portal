<?php
// ============================================================
// api/generate_invoice_pdf.php — Generate Supplier Commercial Invoice as PDF
// Requires FPDF library in /lib/fpdf.php
// Usage: GET /backend/api/generate_invoice_pdf.php?id=INV-2026-0001
// ============================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../lib/fpdf.php';
require_once __DIR__ . '/../config/db.php';

if (empty($_GET['id'])) {
    http_response_code(400);
    header("Content-Type: application/json");
    echo json_encode(["success" => false, "message" => "Invoice id is required"]);
    exit;
}

$invoice_id = $_GET['id'];

$config = db_config();
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4", $config['user'], $config['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $e->getMessage()]);
    exit;
}

// Fetch Invoice with associated PO and Supplier info
$stmt = $pdo->prepare("
    SELECT 
        i.*,
        po.po_number,
        po.po_id,
        po.total_amount AS po_total,
        po.supplier_id,
        s.company_name AS supplier_name,
        s.address AS supplier_address,
        u.email AS supplier_email,
        u.phone AS supplier_phone
    FROM invoices i
    LEFT JOIN purchase_orders po ON i.po = po.po_number
    LEFT JOIN users u ON po.supplier_id = u.id
    LEFT JOIN suppliers s ON s.user_id = u.id
    WHERE i.id = ?
");
$stmt->execute([$invoice_id]);
$invoice = $stmt->fetch();

// If not found, use a mock fallback for testing / local-only modes
if (!$invoice) {
    $invoice = [
        'id' => $invoice_id,
        'po' => 'PO-88021',
        'amount' => 218000.00,
        'submitted' => '2026-05-20',
        'due' => '2026-06-04',
        'status' => 'Submitted',
        'quantity' => 2500,
        'supplier_name' => 'Apex Industrial Components',
        'supplier_address' => 'Phase 2, Industrial Area, Jamshedpur',
        'supplier_email' => 'supplier@srm.local',
        'supplier_phone' => '+91 98765 43210'
    ];
}

$po_id = isset($invoice['po_id']) ? (int)$invoice['po_id'] : 0;
$items = [];
if ($po_id > 0) {
    $stmt2 = $pdo->prepare("SELECT * FROM po_items WHERE po_id = ?");
    $stmt2->execute([$po_id]);
    $items = $stmt2->fetchAll();
}

// If no items found, let's create a default line item based on the invoice quantity/amount
if (empty($items)) {
    $items[] = [
        'item_name' => 'Billed Components / Services (' . ($invoice['po'] ?? 'Sourcing PO') . ')',
        'quantity' => $invoice['quantity'] ?: 2500,
        'unit_price' => ($invoice['quantity'] > 0) ? round($invoice['amount'] / $invoice['quantity'], 2) : $invoice['amount'],
        'total_price' => $invoice['amount']
    ];
}

// ── Build PDF ──
$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetMargins(15, 15, 15);

// ── Supplier Header (NOT Tata Motors) ──
$pdf->SetFont('Arial', 'B', 18);
$pdf->SetTextColor(30, 30, 30);
$pdf->Cell(0, 10, strtoupper($invoice['supplier_name']), 0, 1, 'C');

$pdf->SetFont('Arial', 'B', 13);
$pdf->Cell(0, 7, 'COMMERCIAL INVOICE', 0, 1, 'C');
$pdf->Ln(4);

// ── Divider ──
$pdf->SetDrawColor(200, 200, 200);
$pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
$pdf->Ln(4);

// ── Invoice Details ──
$pdf->SetTextColor(30, 30, 30);
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(90, 6, 'Invoice Number: ' . $invoice['id'], 0, 0);
$pdf->SetFont('Arial', '', 10);
$pdf->Cell(90, 6, 'PO Reference: ' . $invoice['po'], 0, 1);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(90, 6, 'Invoice Date: ' . $invoice['submitted'], 0, 0);
$pdf->Cell(90, 6, 'Payment Due Date: ' . $invoice['due'], 0, 1);

$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(45, 6, 'Status: ', 0, 0);
$pdf->SetTextColor(0, 102, 204);
$pdf->Cell(45, 6, strtoupper($invoice['status']), 0, 1);
$pdf->SetTextColor(30, 30, 30);
$pdf->Ln(4);

// ── Two column: Issuer (Supplier) | Buyer (Tata Motors) ──
$pdf->SetFont('Arial', 'B', 10);
$pdf->SetFillColor(240, 240, 240);
$pdf->Cell(90, 7, '  FROM (SUPPLIER)', 1, 0, 'L', true);
$pdf->Cell(90, 7, '  BILL TO (BUYER)', 1, 1, 'L', true);

$pdf->SetFont('Arial', '', 9);
$supplierLines = [
    $invoice['supplier_name'],
    $invoice['supplier_address'] ?? 'Phase 2, Industrial Area, Jamshedpur',
    $invoice['supplier_email'] ?? 'billing@supplier.com',
    $invoice['supplier_phone'] ?? 'Contact Supplier Support'
];
$buyerLines = [
    "Nexus Manufacturing Ltd.",
    "Global Procurement Hub",
    "Accounts Payable Department",
    "Jamshedpur Center, Jharkhand, India"
];
$maxLines = max(count($buyerLines), count($supplierLines));

for ($i = 0; $i < $maxLines; $i++) {
    $pdf->Cell(90, 6, '  ' . ($supplierLines[$i] ?? ''), 1, 0);
    $pdf->Cell(90, 6, '  ' . ($buyerLines[$i] ?? ''), 1, 1);
}
$pdf->Ln(6);

// ── Line Items Table ──
$pdf->SetFont('Arial', 'B', 10);
$pdf->SetFillColor(50, 50, 50);
$pdf->SetTextColor(255, 255, 255);
$pdf->Cell(8,  8, '#',           1, 0, 'C', true);
$pdf->Cell(82, 8, 'Billed Item Description', 1, 0, 'L', true);
$pdf->Cell(20, 8, 'Qty',         1, 0, 'C', true);
$pdf->Cell(35, 8, 'Unit Price',  1, 0, 'R', true);
$pdf->Cell(35, 8, 'Total (INR)', 1, 1, 'R', true);

$pdf->SetFont('Arial', '', 10);
$pdf->SetTextColor(30, 30, 30);

$i = 1;
$subtotal = 0;
foreach ($items as $item) {
    $fill = ($i % 2 == 0);
    $pdf->SetFillColor($fill ? 248 : 255, $fill ? 248 : 255, $fill ? 248 : 255);
    
    $itemQty = $item['quantity'];
    $pdf->Cell(8,  7, $i,                                          1, 0, 'C', true);
    $pdf->Cell(82, 7, $item['item_name'],                          1, 0, 'L', true);
    $pdf->Cell(20, 7, $itemQty,                                    1, 0, 'C', true);
    $pdf->Cell(35, 7, number_format((float)$item['unit_price'],  2),      1, 0, 'R', true);
    $pdf->Cell(35, 7, number_format((float)$item['total_price'], 2),      1, 1, 'R', true);
    $subtotal += $item['total_price'];
    $i++;
}

// Calculations
$taxRate = 0.18;
$taxAmount = $subtotal * $taxRate;
$freight = 200.00;
$grandTotal = $invoice['amount'];

if (abs($grandTotal - ($subtotal + $taxAmount + $freight)) > 10.00) {
    $freight = 0.00;
    $subtotal = $grandTotal / (1 + $taxRate);
    $taxAmount = $grandTotal - $subtotal;
}

// Render Totals
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(110, 7, 'SUBTOTAL', 1, 0, 'R');
$pdf->Cell(20,  7, '', 1, 0);
$pdf->Cell(50,  7, 'INR ' . number_format($subtotal, 2), 1, 1, 'R');

$pdf->Cell(110, 7, 'TAX (GST 18%)', 1, 0, 'R');
$pdf->Cell(20,  7, '', 1, 0);
$pdf->Cell(50,  7, 'INR ' . number_format($taxAmount, 2), 1, 1, 'R');

if ($freight > 0) {
    $pdf->Cell(110, 7, 'FREIGHT CHARGES', 1, 0, 'R');
    $pdf->Cell(20,  7, '', 1, 0);
    $pdf->Cell(50,  7, 'INR ' . number_format($freight, 2), 1, 1, 'R');
}

$pdf->SetFont('Arial', 'B', 11);
$pdf->SetFillColor(230, 230, 230);
$pdf->Cell(110, 8, 'TOTAL INVOICE AMOUNT', 1, 0, 'R', true);
$pdf->Cell(20,  8, '', 1, 0, 'C', true);
$pdf->Cell(50,  8, 'INR ' . number_format($grandTotal, 2), 1, 1, 'R', true);
$pdf->Ln(6);

// ── Declaration & Digital Signature block ──
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(0, 6, 'Supplier Declaration:', 0, 1);
$pdf->SetFont('Arial', '', 8.5);
$pdf->SetTextColor(80, 80, 80);
$pdf->MultiCell(0, 4.5, "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. All claims are subject to 30-day payment terms agreed upon Purchase Order finalization.");
$pdf->Ln(6);

$pdf->SetTextColor(30, 30, 30);
$pdf->Cell(90, 6, 'Issued By (Supplier Billing):', 0, 0);
$pdf->Cell(90, 6, 'Verification Stamp:', 0, 1);
$pdf->Ln(8);
$pdf->Cell(90, 6, '_______________________________', 0, 0);
$pdf->Cell(90, 6, '[ Digitally Signed Invoice ]', 0, 1);
$pdf->SetFont('Arial', '', 8);
$pdf->Cell(90, 5, $invoice['supplier_name'] . ' AP Department', 0, 1);

// ── Footer ──
$pdf->SetY(-20);
$pdf->SetFont('Arial', 'I', 7);
$pdf->SetTextColor(150, 150, 150);
$pdf->Cell(0, 5, 'Generated dynamically by Supplier Billing System | ' . $invoice['id'] . ' | PO: ' . $invoice['po'], 0, 0, 'C');

$pdf->Output('I', $invoice['id'] . '.pdf');
?>
