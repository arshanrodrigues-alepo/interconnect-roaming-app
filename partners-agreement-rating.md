Update the Partner, Agreement and Rating module following the below instructions. I don't want Agreements to be a separate module but a part of the partner module.
This system must handle partner classification, agreement association, and real-time charging of usage events (CDRs/EDRs) based on complex rate sheets and policies.

### 1. Data Model and Entities

Define the following core entities and their properties:

| Entity | Key Properties & Relationships |
| :--- | :--- |
| **Interconnect Partner** | **ID**, **Name**, **Status** (Active/Inactive), **Partner Type** (must be one of: **Vendor** (Outgoing only), **Customer** (Incoming only), or **Reciprocal**). Must be linked to exactly one **Agreement** and one or more **Rate Sheets**. |
| **Agreement** | **ID**, **Name**, **Policy Status**, **Document Template** (text content), linked to **Partner**. |
| **Rate Sheet** | **ID**, **Name**, **Effective Date**, contains tiered or per-event **Rates** based on parameters like **Called Number Prefix**, **Call Type**, **Direction**, etc. |

### 2. AI-Generated Policies and Content Templates

The system must host the following documents and structured formats, which the AI must generate based on industry best practices and common telecom regulations:

1.  **Template Generation:** Generate a comprehensive, multi-section **Master Interconnect Agreement Template** (in Markdown or plain text format).
2.  **Policy Definition:** Generate a detailed **Monthly Outgoing SMS Revenue Commitment Policy** document.
3.  **Tax Policy:** Generate a basic outline for a **Telecommunications Service Tax Policy** document, detailing common international components (e.g., VAT, regulatory fees).
4.  **Structured EDR/CDR Formats:** Define the precise, structured schema (JSON or similar) for the following **Event Detail Records (EDRs)**, ensuring all required fields are present:
    * Monthly Incoming Voice EDR Format
    * Monthly Outgoing Voice EDR Format
    * Monthly Incoming SMS EDR Format
    * Monthly Outgoing SMS EDR Format

### 3. Core Partner Management Functionality

The Tenant Admin role must be able to perform the following operations:

* **Partner Creation/Update:** Create new Interconnect Partners and update their details, including assigning the **Partner Type** (Vendor/Customer/Reciprocal).
* **Agreement Association:** Associate pre-configured **Agreement Templates** (generated in Section 2) with a specific Interconnect Partner.
* **Rate Sheet Linking:** Link multiple **Rate Sheets** to a single Partner for dynamic rating based on effective dates and services.

### 4. Rating Engine Logic and Acceptance Criteria

Develop the core rating engine logic based on the following flow and constraints:

**Input (Mediation CDR Format):** The Rating Engine will receive Usage Detail Records with the following exact fields:

* `Calling Number`
* `Called Number`
* `Call Type` (e.g., Voice, SMS)
* `Duration` (for Voice, in seconds)
* `Number of events` (for SMS)
* `Direction` (Incoming/Outgoing)
* `Date of Event`
* `Operator ID` (Identifying the partner)
* `Charge` (Placeholder for the calculated charge)

**Processing Rule:**

1.  **Activation Check:** The Rating Engine **MUST** only process and charge CDRs/EDRs where the associated **Interconnect Partner** is explicitly marked as **Active**. Any CDR/EDR associated with an Inactive partner must be flagged and rejected, not charged.
2.  **Rating Logic:** For every valid CDR/EDR, the engine must look up the Partner's active **Rate Sheet** and apply the appropriate rate based on the event's **Call Type**, **Direction**, and **Called Number Prefix** to calculate the final `Charge`.
3.  **Output:** The system must output the original CDR/EDR data with the calculated `Charge` populated.