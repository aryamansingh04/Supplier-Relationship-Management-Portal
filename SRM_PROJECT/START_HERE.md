# Run the SRM portal locally

## Quick start (login works immediately, no MySQL needed)
1. `npm install`
2. Windows: double-click `start-windows.bat`   |   Mac/Linux: `./start.sh`
   (or run `npm start`)
3. Open http://127.0.0.1:5173

## Login credentials
| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@srm.local      | password123 |
| Supplier | supplier@srm.local   | password123 |

Pick the matching role on the first screen, then sign in.

## For full data (RFQs, bids, POs, invoices...) you also need MySQL
1. Start MySQL in XAMPP.
2. Create DB `srm_portal` and import `backend/database/schema.sql` (phpMyAdmin or `mysql -u root srm_portal < backend/database/schema.sql`).
3. From `backend/`: `php database/migrate_all.php`

Different MySQL password/user? Set env vars DB_HOST, DB_USER, DB_PASS, DB_NAME before starting.
