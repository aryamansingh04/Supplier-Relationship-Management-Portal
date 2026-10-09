<?php

require_once __DIR__ . '/../config/db.php';

$connection = db_connection();

echo "Running migrations...\n";

// Check if user_id column exists in bids table
$result = $connection->query("SHOW COLUMNS FROM bids LIKE 'user_id'");
if ($result->num_rows === 0) {
    if ($connection->query("ALTER TABLE bids ADD COLUMN user_id INT UNSIGNED DEFAULT NULL")) {
        echo "Successfully added user_id column to bids table.\n";
    } else {
        echo "Failed to add user_id column: " . $connection->error . "\n";
    }
} else {
    echo "user_id column already exists.\n";
}

// Check if company_name column exists in users table
$result = $connection->query("SHOW COLUMNS FROM users LIKE 'company_name'");
if ($result->num_rows === 0) {
    if ($connection->query("ALTER TABLE users ADD COLUMN company_name VARCHAR(190) DEFAULT NULL")) {
        echo "Successfully added company_name column to users table.\n";
    } else {
        echo "Failed to add company_name column: " . $connection->error . "\n";
    }
} else {
    echo "company_name column already exists.\n";
}

// Check if supplier_name column exists in bids table
$result = $connection->query("SHOW COLUMNS FROM bids LIKE 'supplier_name'");
if ($result->num_rows === 0) {
    if ($connection->query("ALTER TABLE bids ADD COLUMN supplier_name VARCHAR(120) DEFAULT NULL")) {
        echo "Successfully added supplier_name column to bids table.\n";
    } else {
        echo "Failed to add supplier_name column: " . $connection->error . "\n";
    }
} else {
    echo "supplier_name column already exists.\n";
}

// Check if quantity column exists in invoices table
$result = $connection->query("SHOW COLUMNS FROM invoices LIKE 'quantity'");
if ($result->num_rows === 0) {
    if ($connection->query("ALTER TABLE invoices ADD COLUMN quantity INT UNSIGNED DEFAULT 0")) {
        echo "Successfully added quantity column to invoices table.\n";
    } else {
        echo "Failed to add quantity column: " . $connection->error . "\n";
    }
} else {
    echo "quantity column already exists in invoices table.\n";
}

// Check if generated_from_po_id column exists in invoices table
$result = $connection->query("SHOW COLUMNS FROM invoices LIKE 'generated_from_po_id'");
if ($result->num_rows === 0) {
    if ($connection->query("ALTER TABLE invoices ADD COLUMN generated_from_po_id INT DEFAULT NULL")) {
        echo "Successfully added generated_from_po_id column to invoices table.\n";
    } else {
        echo "Failed to add generated_from_po_id column: " . $connection->error . "\n";
    }
} else {
    echo "generated_from_po_id column already exists.\n";
}

// Check if generated_from_grn_id column exists in invoices table
$result = $connection->query("SHOW COLUMNS FROM invoices LIKE 'generated_from_grn_id'");
if ($result->num_rows === 0) {
    if ($connection->query("ALTER TABLE invoices ADD COLUMN generated_from_grn_id VARCHAR(50) DEFAULT NULL")) {
        echo "Successfully added generated_from_grn_id column to invoices table.\n";
    } else {
        echo "Failed to add generated_from_grn_id column: " . $connection->error . "\n";
    }
} else {
    echo "generated_from_grn_id column already exists.\n";
}

echo "Migration finished.\n";
?>
