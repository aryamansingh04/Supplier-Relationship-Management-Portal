<?php
declare(strict_types=1);

echo "Starting SRM database migrations...\n";

// Execute all migrations sequentially
require_once __DIR__ . '/migrate.php';
require_once __DIR__ . '/migrate_po.php';
require_once __DIR__ . '/migrate_negotiation.php';
require_once __DIR__ . '/migrate_evaluations_tracking.php';
require_once __DIR__ . '/migrate_ratings.php';

echo "\nAll SRM portal schema modifications & database seed updates executed successfully!\n";
?>
