<?php
// ============================================================
// api/negotiations.php — Bid Negotiation & Live Room API
// ============================================================

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$config = db_config();
try {
    $pdo = new PDO("mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4", $config['user'], $config['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $e->getMessage()]);
    exit;
}

function update_bid_negotiated_values($pdo, $bid_id, $new_price) {
    // 1. Fetch current quote
    $stmt = $pdo->prepare("SELECT * FROM supplier_quotes WHERE id = ?");
    $stmt->execute([$bid_id]);
    $quote = $stmt->fetch();
    if (!$quote) {
        throw new Exception("Quotation not found for value updates", 404);
    }

    // 2. Update grand_total in supplier_quotes and price in bids
    $pdo->prepare("UPDATE supplier_quotes SET grand_total = ? WHERE id = ?")->execute([$new_price, $bid_id]);
    $pdo->prepare("UPDATE bids SET price = ? WHERE id = ?")->execute([$new_price, $bid_id]);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $bid_id = isset($_GET['bid_id']) ? trim((string)$_GET['bid_id']) : '';

    if ($bid_id === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "bid_id parameter is required"]);
        exit;
    }

    try {
        // 1. Fetch bid details from supplier_quotes
        $stmt = $pdo->prepare("SELECT * FROM supplier_quotes WHERE id = ?");
        $stmt->execute([$bid_id]);
        $bid = $stmt->fetch();

        if (!$bid) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Bid quotation not found"]);
            exit;
        }

        // Fetch bid items
        $stmtItems = $pdo->prepare("
            SELECT sqi.*, ri.item_name, ri.specification, ri.unit
            FROM supplier_quote_items sqi
            JOIN rfq_items ri ON sqi.rfq_item_id = ri.id
            WHERE sqi.supplier_quote_id = ?
        ");
        $stmtItems->execute([$bid_id]);
        $bid['items'] = $stmtItems->fetchAll();

        // 2. Fetch RFQ details
        $stmtRfq = $pdo->prepare("SELECT * FROM rfqs WHERE id = ?");
        $stmtRfq->execute([$bid['rfq_id']]);
        $rfq = $stmtRfq->fetch();

        if ($rfq) {
            $stmtRfqItems = $pdo->prepare("SELECT * FROM rfq_items WHERE rfq_id = ?");
            $stmtRfqItems->execute([$rfq['id']]);
            $rfq['items'] = $stmtRfqItems->fetchAll();
        }

        // 3. Fetch negotiations rounds
        $stmtNegs = $pdo->prepare("SELECT n.*, u.full_name as initiator_name FROM negotiations n JOIN users u ON n.initiated_by = u.id WHERE n.bid_id = ? ORDER BY n.round_number ASC");
        $stmtNegs->execute([$bid_id]);
        $negotiations = $stmtNegs->fetchAll();

        // 4. Fetch chat messages
        $stmtMsgs = $pdo->prepare("
            SELECT bm.*, u.full_name as sender_name, u.role as sender_role 
            FROM bid_messages bm 
            JOIN users u ON bm.sender_id = u.id 
            WHERE bm.bid_id = ? 
            ORDER BY bm.created_at ASC
        ");
        $stmtMsgs->execute([$bid_id]);
        $messages = $stmtMsgs->fetchAll();

        echo json_encode([
            "success" => true,
            "bid" => $bid,
            "rfq" => $rfq,
            "negotiations" => $negotiations,
            "messages" => $messages
        ]);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to fetch negotiation room details: " . $e->getMessage()]);
        exit;
    }
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    $input = is_array($input) ? $input : [];

    $action = isset($input['action']) ? trim((string)$input['action']) : '';
    $bid_id = isset($input['bid_id']) ? trim((string)$input['bid_id']) : '';
    $user_id = isset($input['user_id']) ? (int)$input['user_id'] : 0;

    if ($bid_id === '' || $user_id === 0 || $action === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "bid_id, user_id, and action are required"]);
        exit;
    }

    $pdo->beginTransaction();

    try {
        // Fetch current quote
        $stmtQuote = $pdo->prepare("SELECT * FROM supplier_quotes WHERE id = ?");
        $stmtQuote->execute([$bid_id]);
        $quote = $stmtQuote->fetch();

        if (!$quote) {
            throw new Exception("Quotation not found", 404);
        }

        // Fetch current user details
        $stmtUser = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmtUser->execute([$user_id]);
        $user = $stmtUser->fetch();
        if (!$user) {
            throw new Exception("User not found", 404);
        }

        if ($action === 'send_message') {
            $message = isset($input['message']) ? trim((string)$input['message']) : '';
            if ($message === '') {
                throw new Exception("Message content cannot be empty", 400);
            }

            $stmtMsg = $pdo->prepare("INSERT INTO bid_messages (bid_id, sender_id, message, message_type) VALUES (?, ?, ?, 'message')");
            $stmtMsg->execute([$bid_id, $user_id, $message]);

            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Message sent successfully"]);
            exit;
        }

        if ($action === 'counter_offer') {
            $price = isset($input['price']) ? (float)$input['price'] : 0.0;
            $message = isset($input['message']) ? trim((string)$input['message']) : '';

            if ($price <= 0) {
                throw new Exception("Counter offer price must be greater than zero", 400);
            }

            // Get active round count
            $stmtRnd = $pdo->prepare("SELECT COALESCE(MAX(round_number), 0) FROM negotiations WHERE bid_id = ?");
            $stmtRnd->execute([$bid_id]);
            $max_rnd = (int)$stmtRnd->fetchColumn();
            $next_rnd = $max_rnd + 1;

            // Mark any previous PENDING round as COUNTERED (or rejected implicitly)
            $pdo->prepare("UPDATE negotiations SET status = 'COUNTERED' WHERE bid_id = ? AND status = 'PENDING'")->execute([$bid_id]);

            // Insert new negotiation round
            $stmtInsertNeg = $pdo->prepare("INSERT INTO negotiations (bid_id, round_number, initiated_by, offered_price, message, status) VALUES (?, ?, ?, ?, ?, 'PENDING')");
            $stmtInsertNeg->execute([$bid_id, $next_rnd, $user_id, $price, $message]);

            // Update bid/quote status
            $pdo->prepare("UPDATE supplier_quotes SET status = 'countered' WHERE id = ?")->execute([$bid_id]);
            $pdo->prepare("UPDATE bids SET status = 'countered' WHERE id = ?")->execute([$bid_id]);

            // Update negotiated price and scale line items in the DB
            update_bid_negotiated_values($pdo, $bid_id, $price);

            // Insert system message
            $initiator_title = ($user['role'] === 'admin') ? "Procurement Admin" : $quote['supplier_name'];
            $msgContent = "{$initiator_title} proposed counter-offer of INR " . number_format($price, 2) . ". " . ($message ? "Note: \"{$message}\"" : "");
            
            $stmtMsg = $pdo->prepare("INSERT INTO bid_messages (bid_id, sender_id, message, message_type) VALUES (?, ?, ?, 'counter_offer')");
            $stmtMsg->execute([$bid_id, $user_id, $msgContent]);

            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Counter-offer proposed successfully", "round" => $next_rnd]);
            exit;
        }

        if ($action === 'respond_counter') {
            $response = isset($input['response']) ? trim((string)$input['response']) : ''; // 'accept' | 'reject' | 'counter'
            $price = isset($input['price']) ? (float)$input['price'] : 0.0;
            $message = isset($input['message']) ? trim((string)$input['message']) : '';

            // Fetch active pending round
            $stmtRnd = $pdo->prepare("SELECT * FROM negotiations WHERE bid_id = ? AND status = 'PENDING' ORDER BY round_number DESC LIMIT 1");
            $stmtRnd->execute([$bid_id]);
            $pending_rnd = $stmtRnd->fetch();

            if ($response === 'accept') {
                $agreed_price = $pending_rnd ? (float)$pending_rnd['offered_price'] : (float)$quote['grand_total'];

                if ($pending_rnd) {
                    // Update active round
                    $pdo->prepare("UPDATE negotiations SET status = 'ACCEPTED' WHERE id = ?")->execute([$pending_rnd['id']]);
                }

                // Update bid/quote status
                $pdo->prepare("UPDATE supplier_quotes SET status = 'accepted' WHERE id = ?")->execute([$bid_id]);
                $pdo->prepare("UPDATE bids SET status = 'accepted' WHERE id = ?")->execute([$bid_id]);

                // Update negotiated price and scale line items in the DB
                update_bid_negotiated_values($pdo, $bid_id, $agreed_price);

                // Insert chat log
                $responder_title = ($user['role'] === 'admin') ? "Procurement Admin" : $quote['supplier_name'];
                $msgContent = "{$responder_title} accepted the bid price of INR " . number_format($agreed_price, 2) . ". " . ($message ? "Note: \"{$message}\"" : "");

                $stmtMsg = $pdo->prepare("INSERT INTO bid_messages (bid_id, sender_id, message, message_type) VALUES (?, ?, ?, 'acceptance')");
                $stmtMsg->execute([$bid_id, $user_id, $msgContent]);

            } else if ($response === 'reject') {
                if ($pending_rnd) {
                    $pdo->prepare("UPDATE negotiations SET status = 'REJECTED' WHERE id = ?")->execute([$pending_rnd['id']]);
                }

                // Update bid/quote status
                $pdo->prepare("UPDATE supplier_quotes SET status = 'rejected' WHERE id = ?")->execute([$bid_id]);
                $pdo->prepare("UPDATE bids SET status = 'rejected' WHERE id = ?")->execute([$bid_id]);

                // Insert chat log
                $responder_title = ($user['role'] === 'admin') ? "Procurement Admin" : $quote['supplier_name'];
                $msgContent = "{$responder_title} rejected and withdrew from negotiation. " . ($message ? "Note: \"{$message}\"" : "");

                $stmtMsg = $pdo->prepare("INSERT INTO bid_messages (bid_id, sender_id, message, message_type) VALUES (?, ?, ?, 'rejection')");
                $stmtMsg->execute([$bid_id, $user_id, $msgContent]);

            } else if ($response === 'counter') {
                if ($price <= 0) {
                    throw new Exception("Counter price must be greater than zero", 400);
                }

                if ($pending_rnd) {
                    $pdo->prepare("UPDATE negotiations SET status = 'COUNTERED' WHERE id = ?")->execute([$pending_rnd['id']]);
                }

                // Get new round count
                $stmtRndCount = $pdo->prepare("SELECT COALESCE(MAX(round_number), 0) FROM negotiations WHERE bid_id = ?");
                $stmtRndCount->execute([$bid_id]);
                $max_rnd = (int)$stmtRndCount->fetchColumn();
                $next_rnd = $max_rnd + 1;

                // Insert new round
                $stmtInsertNeg = $pdo->prepare("INSERT INTO negotiations (bid_id, round_number, initiated_by, offered_price, message, status) VALUES (?, ?, ?, ?, ?, 'PENDING')");
                $stmtInsertNeg->execute([$bid_id, $next_rnd, $user_id, $price, $message]);

                // Update status in bids & quotes
                $pdo->prepare("UPDATE supplier_quotes SET status = 'under_negotiation' WHERE id = ?")->execute([$bid_id]);
                $pdo->prepare("UPDATE bids SET status = 'under_negotiation' WHERE id = ?")->execute([$bid_id]);

                // Update negotiated price and scale line items in the DB
                update_bid_negotiated_values($pdo, $bid_id, $price);

                // Insert system message
                $initiator_title = ($user['role'] === 'admin') ? "Procurement Admin" : $quote['supplier_name'];
                $msgContent = "{$initiator_title} proposed revised counter-offer of INR " . number_format($price, 2) . ". " . ($message ? "Note: \"{$message}\"" : "");

                $stmtMsg = $pdo->prepare("INSERT INTO bid_messages (bid_id, sender_id, message, message_type) VALUES (?, ?, ?, 'counter_offer')");
                $stmtMsg->execute([$bid_id, $user_id, $msgContent]);
            }

            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Response submitted successfully"]);
            exit;
        }

        if ($action === 'finalize_contract') {
            // Replication of award contract logic but referencing negotiated locked price
            if ($quote['status'] === 'finalized' || $quote['status'] === 'awarded') {
                throw new Exception("This contract has already been finalized", 400);
            }

            // 1. Fetch supplier details
            $stmtS = $pdo->prepare("
                SELECT u.id, u.full_name, u.email, u.phone, s.company_name, s.address 
                FROM users u 
                LEFT JOIN suppliers s ON s.user_id = u.id 
                WHERE u.id = ?
            ");
            $stmtS->execute([$quote['supplier_id']]);
            $supplier = $stmtS->fetch();

            if (!$supplier) {
                throw new Exception("Supplier user account not found", 404);
            }

            $supplier_name = $supplier['company_name'] ?: $quote['supplier_name'];

            // 2. Fetch quote line items
            $stmt2 = $pdo->prepare("SELECT * FROM supplier_quote_items WHERE supplier_quote_id = ?");
            $stmt2->execute([$bid_id]);
            $quote_items = $stmt2->fetchAll();

            if (empty($quote_items)) {
                throw new Exception("Quotation has no line items", 400);
            }

            // 3. Generate unique PO number
            $year      = date('Y');
            $count     = $pdo->query("SELECT COUNT(*) FROM purchase_orders")->fetchColumn();
            $po_number = 'PO-' . $year . '-' . str_pad((int)($count + 1), 4, '0', STR_PAD_LEFT);

            // 4. Compute delivery date
            $delivery_str = $quote['delivery'] ?? '30 Days';
            preg_match('/\d+/', $delivery_str, $matches);
            $delivery_days = !empty($matches) ? (int)$matches[0] : 30;
            
            $order_date    = date('Y-m-d');
            $delivery_date = date('Y-m-d', strtotime('+' . $delivery_days . ' days'));

            // 5. Build legal terms
            $legal_terms = "PURCHASE ORDER AGREEMENT — NEXUS MANUFACTURING LTD
 
PO Number      : {$po_number}
Issued Date    : " . date('d M Y') . "
Supplier       : {$supplier_name}
Supplier Email : {$supplier['email']}
Order Date     : {$order_date}
Delivery By    : {$delivery_date}
Total Value    : INR " . number_format((float)$quote['grand_total'], 2) . "
 
TERMS & CONDITIONS:
1. This Purchase Order constitutes a legally binding procurement contract issued by Nexus Manufacturing Ltd. (hereinafter referred to as 'the Buyer').
2. The Supplier agrees to deliver all items specified herein in full, on or before the delivery date stated above.
3. Payment Terms: Net 30 days upon delivery and submission of a valid GST tax invoice.
4. Any deviation in quantity, specifications, or delivery schedule requires prior written approval from Nexus Manufacturing Procurement Department.
5. Goods not conforming to specifications will be rejected at the Supplier's expense.
6. Nexus Manufacturing reserves the right to cancel this PO if the Supplier fails to meet agreed terms, with written notice of 7 business days.
7. Governing Law: Laws of India. Jurisdiction: Jharkhand High Court.
 
This Purchase Order is issued electronically and is legally valid without a physical signature under the Information Technology Act, 2000.";

            // 6. Insert Purchase Order
            $stmt3 = $pdo->prepare("
                INSERT INTO purchase_orders
                    (po_number, supplier_quote_id, rfq_id, supplier_id, total_amount, issued_by, expected_delivery, status, legal_terms, final_terms_agreed, issued_to_supplier)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'issued', ?, 1, 1)
            ");
            $stmt3->execute([
                $po_number,
                $bid_id,
                $quote['rfq_id'],
                $quote['supplier_id'],
                $quote['grand_total'],
                $user_id,
                $delivery_date,
                trim($legal_terms)
            ]);
            $po_id = $pdo->lastInsertId();

            // 7. Insert PO Items
            $itemStmt = $pdo->prepare("
                INSERT INTO po_items (po_id, item_name, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            // Adjust quote items if unit_price was modified? 
            // Since we accept the counter-offer on the grand total price, we scale unit prices proportionally or keep them.
            // Let's copy them directly.
            foreach ($quote_items as $item) {
                $stmtItem = $pdo->prepare("SELECT item_name FROM rfq_items WHERE id = ?");
                $stmtItem->execute([$item['rfq_item_id']]);
                $rfq_item_name = $stmtItem->fetchColumn() ?: "Line Item";

                $itemStmt->execute([
                    $po_id,
                    $rfq_item_name,
                    $item['quantity'],
                    $item['unit_price'],
                    $item['line_total']
                ]);
            }

            // 8. Update winner status to finalized
            $pdo->prepare("UPDATE supplier_quotes SET status = 'finalized', best = 1 WHERE id = ?")->execute([$bid_id]);
            $pdo->prepare("UPDATE bids SET status = 'finalized', best = 1 WHERE id = ?")->execute([$bid_id]);

            // 9. Reject all other bids for this RFQ
            $pdo->prepare("UPDATE supplier_quotes SET status = 'rejected', best = 0 WHERE rfq_id = ? AND id != ?")->execute([$quote['rfq_id'], $bid_id]);
            $pdo->prepare("UPDATE bids SET status = 'rejected', best = 0 WHERE rfq_package = ? AND id != ?")->execute([$quote['rfq_id'], $bid_id]);

            // 10. Close RFQ status
            $pdo->prepare("UPDATE rfqs SET status = 'Awarded' WHERE id = ?")->execute([$quote['rfq_id']]);

            // 11. Add system message in chat logs
            $msgContent = "Contract finalized. Legally binding Purchase Order {$po_number} has been generated and issued.";
            $stmtMsg = $pdo->prepare("INSERT INTO bid_messages (bid_id, sender_id, message, message_type) VALUES (?, ?, ?, 'system')");
            $stmtMsg->execute([$bid_id, $user_id, $msgContent]);

            $pdo->commit();
            echo json_encode([
                "success" => true,
                "message" => "Contract finalized successfully. PO generated.",
                "po_id" => (int)$po_id,
                "po_number" => $po_number
            ]);
            exit;
        }

        throw new Exception("Unknown action: " . $action, 400);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
        http_response_code($code);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
