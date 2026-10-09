# Supplier Relationship Management (SRM) Portal

## Procurement, Fulfillment & Invoice Settlement Workflow

### Overview

The Supplier Relationship Management (SRM) Portal is a centralized procurement platform that enables organizations to manage supplier sourcing, bidding, purchasing, delivery verification, invoice processing, and supplier compliance through a structured digital workflow.

The system mirrors real-world enterprise procurement operations by connecting Procurement, Warehouse, Finance, and Supplier teams within a single platform while maintaining a complete audit trail of all transactions.

The primary objective of the SRM Portal is to ensure that purchases are competitively sourced, goods are properly received, invoices are validated against contractual agreements, and payments are released only after successful verification.

---

# Business Participants

## Internal Organization

### Procurement Team
* **Responsibility**: RFQ Creation, Bids Evaluation, Negotiation, and Purchase Orders (PO) Generation.
* **Scope**: Sourcing events, negotiating pricing, awarding contracts.

### Warehouse Team
* **Responsibility**: Goods Delivery Inspection, recording accepted/damaged quantities, and Goods Receipt Note (GRN) Creation.
* **Scope**: Verification of physical deliveries.

### Finance / Accounts Payable Team
* **Responsibility**: Invoice Match Verification (3-Way Match), payment approval, and payout settlement recording.
* **Scope**: Financial audits, payment releases, 3-way match validation.

### Compliance Team
* **Responsibility**: Monitoring supplier certifications, tax forms, regulatory compliance records, and audits.
* **Scope**: Governance and standards enforcement.

---

## External Organization

### Supplier Sales Team
* **Responsibility**: Product Catalog Management, RFQ Sourcing Inbox monitoring, and Quotation/Bid submission.
* **Scope**: Responding to bids, maintaining active portfolios.

### Supplier Billing Team
* **Responsibility**: Invoice generation and Commercial Invoice PDF uploads.
* **Scope**: Requesting payments for delivered and accepted goods.

### Supplier Compliance Team
* **Responsibility**: Maintaining valid certifications, ISO certificates, and tax filings.
* **Scope**: Legal and operational compliance updates.

---

# Procurement Lifecycle (10 Consolidated Stages)

---

## Stage 1: Supplier Registration & Catalog Management
Before participating in sourcing events, suppliers maintain their product and service catalogs.
Suppliers register credentials and catalog portfolios containing:
* Product SKUs
* Categories
* Unit Prices
* Production Capacity
* Technical Specifications

The Procurement Team inspects supplier portfolios and ratings before initiating sourcing events.
* **Output**: Approved supplier catalog available for sourcing activities.

---

## Stage 2: RFQ Creation
When a business requirement is identified, the Procurement Team creates a Request for Quotation (RFQ).
The RFQ contains project specifications:
* Project Title
* Product Requirements & Quantities
* Technical Specifications
* Submission Deadline & Estimated Budget

The system parses uploaded specification PDFs side-by-side to auto-fill fields and create active sourcing events.
* **Output**: Published RFQ visible to invited suppliers.

---

## Stage 3: Supplier Quotation Submission
Suppliers review open RFQs in their inbox and submit detailed commercial proposals.
Each quotation contains:
* Unit Prices & Taxes per item
* Freight Charges
* Delivery Lead Time
* Warranty Terms

The system automatically calculates the Grand Total: `Subtotal + Taxes + Freight`. The proposal acts as the supplier's binding commercial offer.
* **Output**: Submitted Bid / Quotation.

---

## Stage 4: Bid Evaluation & Negotiation
Procurement evaluates all submitted quotations using a comparison matrix based on competitive pricing, delivery speed, and supplier ratings. Procurement and Suppliers can enter a live negotiation room to collaborate on counter-proposals.

### Important Design Principle (Auditability)
Original supplier quotations are never overwritten. Negotiation counters are recorded dynamically in rounds:
* Original Quote (Version 1) remains archived.
* Counter-offers are recorded chronologically in the negotiations log.
* The accepted final counter-offer price updates the quotation's `grand_total` and bid's `price` directly while preserving original itemization.
* **Output**: Accepted Supplier Quotation at Agreed Negotiated Price.

---

## Stage 5: Purchase Order Generation
After supplier selection, Procurement issues a formal Purchase Order (PO), establishing the organization's legal commitment to purchase.
The PO records:
* Unique PO Number
* Supplier Details & Commercial Terms
* Approved Line Items & Agreed Negotiated Pricing
* Expected Delivery Dates

At this stage, no invoice exists. The supplier has only received authorization to deliver goods.
* **Output**: Issued Purchase Order (PO).

---

## Stage 6: Delivery & Goods Receipt
The supplier ships goods according to the PO schedule. Upon arrival, Warehouse personnel inspect the shipment and record a Goods Receipt Note (GRN) logging:
* Delivered Quantity
* Accepted Quantity
* Damaged Quantity
* Rejected Quantity & Inspection Notes

The GRN is the organization's official receipt of what was actually delivered. Without a logged GRN, no invoices can be matched or paid.
* **Output**: Approved Goods Receipt Note (GRN).

---

## Stage 7: Supplier Invoice Generation
The supplier's billing department generates a Commercial Invoice directly from the approved PO and logged GRN. 
The system automatically compiles a **Draft** invoice calculating line-item totals from the accepted quantities: `Billed Quantity * PO Unit Price`.
The supplier reviews the itemized breakdown, previews the professional invoice PDF (issued by the supplier with a generic/normal company name like Nexus Manufacturing Ltd. as buyer), and clicks submit.
* **Invoice status transitions**: `Draft → Submitted`.
* **Output**: Submitted Invoice.

---

## Stage 8: Three-Way Matching
The Finance / Accounts Payable team performs a mandatory validation audit known as a **Three-Way Match**, comparing three independent records:
1. **Purchase Order (PO)**: What was ordered and at what price?
2. **Goods Receipt Note (GRN)**: What was actually accepted at the warehouse?
3. **Supplier Invoice**: What is the supplier billing us for?

### Matching & Diagnostic Rules
The system audits the transaction using the following checks:
* **PO Reference Verification**: Invoice must reference a valid PO.
* **GRN Check**: Associated Goods Receipt Note must exist.
* **Quantity Match**: `Invoice Quantity <= Accepted GRN Quantity`.
* **Amount Match**: `Invoice Amount <= Accepted GRN Value` (where `Accepted GRN Value = (Accepted Qty / Received Qty) * PO Amount`).

### Match Result
* **Match Successful**: Status becomes **Approved**.
* **Match Failed**: Status becomes **Under Review** (variance detected). Finance can click **Send Back to Supplier** to return it for corrections.
* **Output**: Approved Invoice.

---

## Stage 9: Payment Processing
Once the invoice is approved, Finance initiates payout through banking channels (Bank Transfer, Wire, ACH).
* **Initiating Payment**: Invoice status transitions: `Approved → Payment Processing`.
* **Settlement Confirmed**: Once payout settles, Finance records payment details: `Payment Processing → Paid`.
* **Output**: Paid Invoice with recorded transaction reference.

---

## Stage 10: Compliance & Audit
All activities (RFQ creation, bidding, negotiations, PO generation, goods receipts, matches, and payouts) write automatically to the persistent database audit logs. Suppliers also manage certificates (ISO quality standards, tax registrations) which are parsed for expiration.
* **Output**: Audit trail entries and updated compliance logs.

---

# Simplified End-to-End Flow

```text
Supplier Registration
        ↓
RFQ Creation
        ↓
Supplier Quotation
        ↓
Evaluation & Negotiation
        ↓
Purchase Order (PO)
        ↓
Goods Delivery
        ↓
Goods Receipt Note (GRN)
        ↓
Supplier Invoice Draft Generation
        ↓
Supplier Review & Submission
        ↓
3-Way Match (PO vs GRN vs Invoice)
        ↓
Finance Approval / Send Back
        ↓
Payment Processing
        ↓
Paid
        ↓
Audit & Compliance
```

---

# Key Invoice Clarification

Many procurement systems are incorrectly designed with the following flow:
```text
PO Generated ──> System Generates Invoice
```
This is incorrect. The correct enterprise workflow implemented in the SRM Portal is:
```text
PO Generated ──> Goods Delivered ──> GRN Created ──> Supplier Generates Invoice Draft ──> Supplier Reviews & Submits ──> System Validates Invoice (3-Way Match) ──> Finance Approves Payment
```
The SRM Portal acts as an Invoice Capture, Verification, and Validation System rather than a simple automatic invoice generator.

---

# Real-Time Multi-Event Toast Notification System

To ensure all departments (Procurement, Warehouse, Finance, and Supplier Accounts) collaborate seamlessly, the SRM Portal implements a premium, animated, cross-tab **Real-Time Toast Notification System**.

### Operational Mechanism & Cross-Tab Broadcasts
1. **Event Capture**: When any user triggers a critical event (creating an RFQ, submitting a bid, sending a negotiation room message, responding to a counter-offer, or finalising a PO), a notification object is stored in the database and pre-pended to the local storage list `srm_notifications`.
2. **Tab Communication**: The system dispatches the `srm_notifications_updated` event locally, and the browser automatically dispatches a `storage` event to all other open tabs/windows under the same origin.
3. **Framer Motion Animations**: The `<ToastContainer />` component, integrated globally inside `DashboardLayout`, listens to these updates. When a new unread notification ID is detected, it renders a sliding, glassmorphic toast banner in the top-right corner.
4. **Interaction & Routing**: The toast automatically fades out after 5 seconds or can be manually dismissed. Clicking on the toast marks the notification as read in local storage and deep-links the user directly to their respective Notifications page (`/admin/notifications` or `/supplier/notifications`).
