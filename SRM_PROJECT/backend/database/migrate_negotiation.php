<?php
// ============================================================
// migrate_negotiation.php — Set up negotiations & bid messages
// ============================================================

require_once __DIR__ . '/../config/db.php';
$connection = db_connection();

echo "Running negotiation integration migrations...\n";

// 1. Modify bids table status ENUM values
$modifyBidsStatus = "
ALTER TABLE bids MODIFY COLUMN status ENUM(
    'submitted', 'under_review', 'awarded', 'rejected', 'under_negotiation', 'countered', 'finalized'
) DEFAULT 'submitted';
";
if ($connection->query($modifyBidsStatus)) {
    echo "Updated 'bids' table status ENUM values successfully.\n";
} else {
    echo "Failed to update 'bids' status ENUM: " . $connection->error . "\n";
}

// 2. Modify supplier_quotes table status ENUM values
$modifyQuotesStatus = "
ALTER TABLE supplier_quotes MODIFY COLUMN status ENUM(
    'submitted', 'under_review', 'awarded', 'rejected', 'under_negotiation', 'countered', 'finalized'
) DEFAULT 'submitted';
";
if ($connection->query($modifyQuotesStatus)) {
    echo "Updated 'supplier_quotes' table status ENUM values successfully.\n";
} else {
    echo "Failed to update 'supplier_quotes' status ENUM: " . $connection->error . "\n";
}

// 3. Create negotiations table
$createNegotiationsTable = "
CREATE TABLE IF NOT EXISTS negotiations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bid_id VARCHAR(50) NOT NULL,
    round_number INT UNSIGNED NOT NULL DEFAULT 1,
    initiated_by INT UNSIGNED NOT NULL,
    offered_price DECIMAL(15,2) NOT NULL,
    message TEXT DEFAULT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bid_id) REFERENCES supplier_quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
if ($connection->query($createNegotiationsTable)) {
    echo "Table 'negotiations' created or already exists.\n";
} else {
    echo "Failed to create 'negotiations' table: " . $connection->error . "\n";
}

// 4. Create bid_messages table
$createBidMessagesTable = "
CREATE TABLE IF NOT EXISTS bid_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bid_id VARCHAR(50) NOT NULL,
    sender_id INT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('message', 'counter_offer', 'acceptance', 'rejection', 'system') NOT NULL DEFAULT 'message',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bid_id) REFERENCES supplier_quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
if ($connection->query($createBidMessagesTable)) {
    echo "Table 'bid_messages' created or already exists.\n";
} else {
    echo "Failed to create 'bid_messages' table: " . $connection->error . "\n";
}

echo "Negotiation migration completed successfully.\n";
?>
