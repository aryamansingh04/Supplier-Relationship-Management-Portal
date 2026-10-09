# SRM Portal — Step-by-Step User Testing Guide
## Automated Procurement Lifecycle Simulator

Welcome to the Supplier Relationship Management (SRM) Portal! What you are testing is a digital version of how enterprise companies manage their **Procurement Lifecycle** in real life.

Instead of exchanging fragmented emails, manually typing in data, and losing track of billing invoices, this portal automates the entire supply chain. Our **Client-Side PDF Parsing** simulates how modern ERP systems (like SAP Ariba, Coupa, or Oracle Procurement) automate manual data entry.

> [!TIP]
> **Isolated Multi-Account Testing (Tab Independence):**
> The active user session is stored in `sessionStorage`, which is isolated per browser tab. This enables you to open the supplier portal in Tab A as one supplier, and log in to a second supplier account in Tab B, allowing you to test independent supplier behaviors simultaneously in the same browser window without session conflicts.

> [!NOTE]
> **Real-Time Cross-Tab Toast Notifications:**
> The portal includes a premium real-time toast notification system using `localStorage` synchronization and the browser's `storage` events. When an action occurs in one tab (e.g., creating an RFQ or sending a negotiation message), all other open browser tabs/windows will immediately receive a sliding toast notification alert in real-time.

---

## Real-Life Department Mapping

This portal simulates the interactions between several corporate departments and external entities:

| Real Corporate Department / Actor | Portal Module / Feature | Business Stage | Database Store |
| :--- | :--- | :--- | :--- |
| **Procurement / Sourcing Team** | RFQ Management (Admin Console) | 2. RFQ Creation | `rfqs` (D3) |
| **Supplier Sales Team** | Product Catalog | 1. Supplier Registration & Catalog | `srm_products` (localStorage) |
| **Supplier Sales Team** | RFQ Inbox & Bid Submission | 3. Bid Submission | `bids` (D4) |
| **Sourcing / Purchasing Team** | Bid Comparison & PO Issuing | 4. Evaluation & Negotiation | `purchase_orders` (D5) |
| **Warehouse / Logistics Team** | Goods Receipt Note (GRN) | 6. Goods Receipt (GRN) | `goods_receipts` (D7) |
| **Supplier Billing Department** | Invoice Submission | 7. Invoice Submission | `invoices` (D8) |
| **Finance / Accounts Payable** | Invoice Approval & Payment | 8. 3-Way Match & 9. Payment | `invoices` (D8) |
| **Compliance / Legal Team** | Certificate Upload & Profile | 10. Compliance & Audit | `compliance_documents` (D9) |

---

## The 10-Stage End-to-End Testing Flow

Follow these steps sequentially to test the full Procurement Lifecycle.

---

### STAGE 1 — Supplier Registration & Catalog Management
* **Business Context**: Before bidding on sourcing requests, suppliers manage their unique SKU catalogs of offerings to showcase their capabilities and price guidelines to the procurement team.
* **Actions**:
  1. Open the portal, click **Login**, select **Supplier Portal**, and log in (e.g., using default supplier session showing company **Apex Industrial Components**).
  2. Navigate to **Product Catalog** in the sidebar.
  3. Verify the default items (Apex should see mechanical parts like *Hydraulic Valve Assembly*).
  4. Click **Add offering** at the top right, fill in a new offering (e.g. SKU: `PRD-4409`, Offering: "Titanium Valve", Category: "Mechanical", Capacity: `500`, Price: `85000` INR), and save it.
  5. Open the Supplier Portal representing a different company (e.g. **Vector Packaging Co.**) in another tab and verify they see their own catalog (packaging film, etc.) and do *not* see Apex's "Titanium Valve".
  6. Switch to the **Admin Console** and navigate to **Product Management** under *Procurement* in the sidebar.
  7. **UI Verification**: Use the **Supplier Dropdown** selector at the top right:
     * Select **Apex Industrial Components**: Confirm the Admin sees the newly added `PRD-4409` "Titanium Valve".
     * Select **Vector Packaging Co.**: Confirm the Admin sees only Vector's packaging catalog.

---

### STAGE 2 — RFQ Creation
* **Actor**: Admin (Procurement Manager)
* **Actions**:
  1. Open the portal, click **Login**, and select the **Admin Console**.
  2. Navigate to **RFQs** under Sourcing in the sidebar.
  3. Click **New RFQ** at the top right.
  4. Download the sample spec by clicking **Download Sample RFQ Procurement Spec**.
  5. In the **Auto-fill from Document** card, click **Choose PDF File** and select `rfq-procurement-spec.pdf`.
  6. **UI Verification**: Confirm the modal expands to `xxl` (1280px wide) split-screen showing the PDF viewer on the right and form fields on the left.
  7. **Parser Verification**: Verify the parser extracts the Title, Category (`Logistics`), Deadline, and Target value.
  8. Click **Save RFQ** to write the record and its associated line items to the database with status `Active`.
  9. **Toast Verification**: Confirm that upon saving, a purple-themed sourcing toast notification slides in from the top-right corner of the screen.

---

### STAGE 3 — Supplier Quotation Submission
* **Actor**: Supplier (Sales Team)
* **Actions**:
  1. Switch back to the **Supplier Portal**.
  2. Navigate to **RFQ Inbox** in the sidebar.
  3. Verify that the published RFQ is visible.
  4. Click the **Bid** action button next to the RFQ to route to **My Bids** and open the quotation sheet.
  5. Enter the **Unit Price** and **Tax (%)** for each line item. Verify that the line totals and overall subtotal, taxes, and grand totals automatically calculate.
  6. Click **Submit Proposal** to save the quote.
  7. **Toast Verification**: Confirm a success toast slides in indicating that the bid proposal has been submitted.

---

### STAGE 4 — Evaluation & Negotiation
* **Actors**: Admin & Supplier
* **Actions**:
  1. **Admin Proposes Counter-Offer**:
     * In the **Admin Console**, go to **Bid Management** and select the RFQ.
     * Click **Negotiate** next to the supplier's quotation (routes to Negotiation Room).
     * Click **Propose Counter** and enter a revised total price (e.g. `90000` INR). Click **Submit Counter**.
     * **Verification & Toast**: Confirm that the overall quote `grand_total` updates. In the **Supplier Portal** tab, verify that a counter-offer toast immediately slides in.
  2. **Supplier Responds with Counter-Offer**:
     * Open the **Supplier Workspace** negotiation room. Confirm they see the Admin's counter-offer of ₹90,000.
     * Click **Counter-Propose** and submit a revised price of `95000` INR.
     * **Toast Verification**: Verify that a revised counter-proposal toast notification triggers on the Admin Console tab.
  3. **Admin Accepts the Negotiated Price**:
     * Return to the Admin Console negotiation room.
     * The Admin sees the Supplier's counter-offer. Click **Accept Price** and confirm. The terms are locked.
     * **Toast Verification**: Verify the Supplier tab receives an acceptance toast notification immediately.

---

### STAGE 5 — Purchase Order Generation
* **Actor**: Admin (Procurement Team)
* **Actions**:
  1. Under the Bid Comparison screen, select the winning supplier bid and click **Award Contract**.
  2. **Toast Verification**: Confirm that a PO generated/issued toast notification triggers.
  3. Navigate to **Purchase Orders** in the sidebar.
  4. Verify the official legally binding PO has been generated with status `Issued`, recording the agreed final terms.

---

### STAGE 6 — Delivery & Goods Receipt
* **Actor**: Admin (Warehouse Supervisor)
* **Actions**:
  1. Navigate to the Admin Console -> **Receipts & Reviews** in the sidebar.
  2. Click **Record Goods Receipt**.
  3. Click **Choose PDF File** and select `delivery-receipt.pdf` to parse items.
  4. **Multi-Item Grid Verification**: Confirm the line-item grid contains parsed item quantities (e.g. 2,490 accepted of 2,500 units).
  5. Click **Save Receipt** to write items to the `goods_receipts` table.

---

### STAGE 7 — Supplier Invoice Generation & Submission
* **Actor**: Supplier (Billing Team)
* **Actions**:
  1. Open the **Supplier Portal** and navigate to **Active Orders** in the sidebar.
  2. Locate your delivered PO (which must have a corresponding GRN recorded in Stage 6) and click the **Generate Invoice** button next to it.
  3. Verify you are automatically redirected to the **Invoices** dashboard, and see a new **Draft** invoice (e.g., `INV-2026-0001`).
  4. Click the **Inspect** button next to this draft invoice to open the **Invoice Details Drawer**.
  5. Verify that the line item breakdown and totals are computed dynamically from the warehouse's accepted GRN quantities.
  6. Review the live PDF preview, confirming that the Supplier is shown as the issuer in the header and **Nexus Manufacturing Ltd.** is listed as the Buyer.
  7. Click **Submit Invoice** inside the drawer to submit it to Finance. Confirm that its status transitions to **Submitted**.

---

### STAGE 8 — Three-Way Matching
* **Actor**: Admin (Finance / Accounts Payable Team)
* **Actions**:
  1. Navigate to Admin Console -> **Invoices & Billing**.
  2. Find `INV-5401` and click **Review Match** to open the **Invoice Workbench**.
  3. **Match Verification (PO vs GRN vs Invoice)**:
     * Review the side-by-side match summary breakdown of quantities and values.
     * Verify checks for PO, GRN, Quantity Validation (`Invoice Qty <= Accepted GRN Qty`), and Value Validation (`Invoice Amount <= Accepted GRN Value`).
  4. **Test Match Variance**:
     * Open `INV-5403` and click **Review Match**. Notice the quantity variance alert (`Invoice Qty 1200 exceeds Accepted GRN Qty 1180`).
     * Click **Send Back to Supplier** to route this invoice back for AP review (status updates to **Under Review**).
  5. **Approve Match**:
     * Open `INV-5401` in the workbench. Click **Approve Invoice** (status updates to **Approved**).

---

### STAGE 9 — Payment Processing
* **Actor**: Admin (Finance / Accounts Payable Team)
* **Actions**:
  1. In the Invoice Workbench for the approved `INV-5401`, click **Initiate Payment**. The status updates to **Payment Processing**.
  2. Once the wire transfer is settled, click **Record Payment** inside the workbench. The status updates to **Paid**.
  3. Log back to the Supplier Console -> Invoices to verify the payment status has updated to **Paid** on the supplier tracker table.

---

### STAGE 10 — Compliance & Audit
* **Actor**: Supplier & Admin
* **Actions**:
  1. Under Supplier Workspace -> **Profile**, upload `iso-compliance-certificate.pdf` to parse certification ID and expiry dates. Click **Save Document**.
  2. Verify transaction logs in Admin Console -> **Audit Logs** to review the chronological action logs, providing a complete audit trail for corporate security.
