**Product Requirements Document**

**Interconnect & Roaming Solution Prototype**

Version 1.0

*Prototype Development Specification*

|**Document Owner**|Product Management|
| :- | :- |
|**Status**|Draft for Development|
|**Target Release**|Prototype v1.0|
|**Last Updated**|[Date]|


# **1. Executive Summary**
## **1.1 Document Purpose**
This Product Requirements Document provides detailed, low-level specifications for building a working prototype of the Interconnect and Roaming solution. It defines the data models, APIs, business logic, user interfaces, and workflows required to implement the core functionality across four development phases.
## **1.2 Prototype Scope**
The prototype will demonstrate the following key capabilities:

- Partner onboarding and agreement management
- TAP file processing and CDR mediation
- Real-time rating and charging
- Automated settlement and invoicing
- Dispute management workflows
- Fraud detection and anomaly monitoring
- Partner and operator dashboards
- Test call automation and validation
## **1.3 Development Phases**
The prototype will be built in four phases:

- Phase 1: Foundation - Core entities, partner onboarding, API gateway
- Phase 2: Interconnect/Roaming Core - TAP parsing, rating, reconciliation
- Phase 3: Analytics & Assurance - Dashboards, anomaly detection, test automation
- Phase 4: UX/Frontend - Partner portal, operator admin, customer service UI


# **2. System Architecture Overview**
## **2.1 Technology Stack**

|**Component**|**Technology**|
| :-: | :-: |
|**Backend Framework**|Node.js with Express.js or Python with FastAPI/Django|
|**Database**|PostgreSQL (relational data) + MongoDB (TAP files, CDRs)|
|**Frontend**|React.js with Material-UI or Tailwind CSS|
|**API Gateway**|Kong or Express Gateway|
|**Message Queue**|RabbitMQ or Redis for job queuing|
|**File Storage**|AWS S3 or MinIO for TAP files, contracts, reports|
|**Authentication**|JWT tokens with OAuth 2.0|
|**Testing**|Jest/Mocha (unit), Cypress (E2E)|

## **2.2 System Components**
The prototype consists of the following microservices:

- Partner Management Service - Partner CRUD, agreements, rate cards
- TAP Processing Service - TAP3.12 parsing, validation, CDR generation
- Rating Engine Service - Apply rates, calculate charges
- Settlement Service - Reconciliation, invoice generation
- Dispute Management Service - Dispute workflows, resolution tracking
- Fraud Detection Service - Anomaly detection, pattern analysis
- Analytics Service - Dashboards, reporting, KPIs
- Notification Service - Alerts, emails, webhooks


# **3. Phase 1: Foundation**
## **3.1 Core Data Entities**
### **3.1.1 Partner Entity**

|**Field Name**|**Type**|**Required**|**Description**|
| :-: | :-: | :-: | :-: |
|partner\_id|UUID|Yes|Primary key|
|partner\_code|VARCHAR(20)|Yes|Unique identifier, TADIG code|
|partner\_name|VARCHAR(255)|Yes|Official company name|
|partner\_type|ENUM|Yes|MNO, MVNO, HUB, CARRIER|
|country\_code|VARCHAR(3)|Yes|ISO 3166-1 alpha-3|
|status|ENUM|Yes|PENDING, ACTIVE, SUSPENDED, INACTIVE|
|contact\_email|VARCHAR(255)|Yes|Primary contact email|
|contact\_phone|VARCHAR(20)|No|Primary contact phone|
|created\_at|TIMESTAMP|Yes|Creation timestamp|
|updated\_at|TIMESTAMP|Yes|Last update timestamp|

### **3.1.2 Agreement Entity**

|**Field Name**|**Type**|**Required**|**Description**|
| :-: | :-: | :-: | :-: |
|agreement\_id|UUID|Yes|Primary key|
|partner\_id|UUID|Yes|Foreign key to Partner|
|agreement\_type|ENUM|Yes|INTERCONNECT, ROAMING, BOTH|
|start\_date|DATE|Yes|Agreement effective date|
|end\_date|DATE|No|Agreement expiry date (null=indefinite)|
|status|ENUM|Yes|DRAFT, PENDING, ACTIVE, EXPIRED, TERMINATED|
|contract\_file\_url|TEXT|No|S3/storage URL for contract PDF|
|raex\_form\_url|TEXT|No|RAEX IR.21 form URL|
|currency|VARCHAR(3)|Yes|Settlement currency (ISO 4217)|
|billing\_cycle|ENUM|Yes|MONTHLY, QUARTERLY, CUSTOM|
|created\_at|TIMESTAMP|Yes|Creation timestamp|


### **3.1.3 Service Entity**

|**Field Name**|**Type**|**Required**|**Description**|
| :-: | :-: | :-: | :-: |
|service\_id|UUID|Yes|Primary key|
|service\_type|ENUM|Yes|VOICE, SMS, DATA, MMS|
|service\_name|VARCHAR(100)|Yes|Service display name|
|unit\_of\_measure|ENUM|Yes|SECONDS, MESSAGE, MB, SESSION|
|is\_active|BOOLEAN|Yes|Service status|

### **3.1.4 RatePlan Entity**

|**Field Name**|**Type**|**Required**|**Description**|
| :-: | :-: | :-: | :-: |
|rate\_plan\_id|UUID|Yes|Primary key|
|agreement\_id|UUID|Yes|Foreign key to Agreement|
|service\_id|UUID|Yes|Foreign key to Service|
|direction|ENUM|Yes|INBOUND, OUTBOUND|
|rate\_per\_unit|DECIMAL(10,6)|Yes|Price per unit|
|currency|VARCHAR(3)|Yes|Currency code (ISO 4217)|
|effective\_from|DATE|Yes|Rate effective start date|
|effective\_to|DATE|No|Rate expiry date (null=no expiry)|
|rounding\_rule|ENUM|Yes|UP, DOWN, NEAREST|
|minimum\_charge|DECIMAL(10,6)|No|Minimum charge per transaction|


### **3.1.5 TAPRecord Entity**

|**Field Name**|**Type**|**Required**|**Description**|
| :-: | :-: | :-: | :-: |
|tap\_record\_id|UUID|Yes|Primary key|
|tap\_file\_id|UUID|Yes|Foreign key to TAP file batch|
|partner\_id|UUID|Yes|Foreign key to Partner|
|service\_type|ENUM|Yes|VOICE, SMS, DATA, MMS|
|call\_date\_time|TIMESTAMP|Yes|Call/session start time|
|msisdn|VARCHAR(20)|Yes|Subscriber number|
|imsi|VARCHAR(15)|No|International Mobile Subscriber Identity|
|duration\_seconds|INTEGER|No|Call duration (for VOICE)|
|data\_volume\_mb|DECIMAL(10,2)|No|Data volume (for DATA)|
|message\_count|INTEGER|No|Number of messages (for SMS)|
|charged\_amount|DECIMAL(10,6)|No|Calculated charge (after rating)|
|currency|VARCHAR(3)|No|Charge currency|
|processing\_status|ENUM|Yes|PENDING, RATED, SETTLED, DISPUTED|
|raw\_tap\_data|JSONB|No|Original TAP record in JSON|


### **3.1.6 Invoice Entity**

|**Field Name**|**Type**|**Required**|**Description**|
| :-: | :-: | :-: | :-: |
|invoice\_id|UUID|Yes|Primary key|
|invoice\_number|VARCHAR(50)|Yes|Unique invoice number|
|partner\_id|UUID|Yes|Foreign key to Partner|
|billing\_period\_start|DATE|Yes|Billing period start|
|billing\_period\_end|DATE|Yes|Billing period end|
|total\_amount|DECIMAL(15,2)|Yes|Total invoice amount|
|currency|VARCHAR(3)|Yes|Invoice currency|
|status|ENUM|Yes|DRAFT, ISSUED, PAID, DISPUTED, CANCELLED|
|invoice\_date|DATE|Yes|Invoice issue date|
|due\_date|DATE|No|Payment due date|
|pdf\_url|TEXT|No|URL to invoice PDF|


### **3.1.7 Dispute Entity**

|**Field Name**|**Type**|**Required**|**Description**|
| :-: | :-: | :-: | :-: |
|dispute\_id|UUID|Yes|Primary key|
|dispute\_number|VARCHAR(50)|Yes|Unique dispute number|
|invoice\_id|UUID|No|Foreign key to Invoice (if related)|
|partner\_id|UUID|Yes|Foreign key to Partner|
|dispute\_type|ENUM|Yes|BILLING, TECHNICAL, QUALITY, OTHER|
|status|ENUM|Yes|OPEN, IN\_REVIEW, RESOLVED, REJECTED, ESCALATED|
|description|TEXT|Yes|Dispute description|
|disputed\_amount|DECIMAL(15,2)|No|Amount in dispute|
|resolution|TEXT|No|Resolution notes|
|created\_at|TIMESTAMP|Yes|Dispute creation date|
|resolved\_at|TIMESTAMP|No|Dispute resolution date|


# **Document Status**
**This is Part 1 of the comprehensive PRD covering:**

- Executive Summary
- System Architecture
- Phase 1 Foundation - Core Data Entities (7 entities defined)

**Remaining sections to be delivered in Part 2:**

- Phase 1: API Specifications and Partner Onboarding Flow
- Phase 2: TAP Processing, Rating Engine, Reconciliation
- Phase 3: Analytics & Fraud Detection
- Phase 4: UX/Frontend Specifications
- User Journey Detailed Specifications (5 journeys)
- API Endpoint Specifications
- UI/UX Requirements and Wireframes
- Testing Requirements



# **3.2 Phase 1 API Specifications**
## **3.2.1 Partner Management APIs**
### **POST /api/v1/partners**
**Description:** Create a new partner

**Request Body:**

{   "partner\_code": "USAVZ1",   "partner\_name": "Verizon Wireless",   "partner\_type": "MNO",   "country\_code": "USA",   "contact\_email": "roaming@verizon.com",   "contact\_phone": "+1-555-0100" }

**Response (201 Created):**

{   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "partner\_code": "USAVZ1",   "partner\_name": "Verizon Wireless",   "partner\_type": "MNO",   "country\_code": "USA",   "status": "PENDING",   "contact\_email": "roaming@verizon.com",   "contact\_phone": "+1-555-0100",   "created\_at": "2025-01-15T10:30:00Z",   "updated\_at": "2025-01-15T10:30:00Z" }

### **GET /api/v1/partners**
**Description:** Retrieve list of partners with filtering

**Query Parameters:**

- status: (optional) PENDING, ACTIVE, SUSPENDED, INACTIVE
- partner\_type: (optional) MNO, MVNO, HUB, CARRIER
- country\_code: (optional) ISO 3166-1 alpha-3
- page: (optional) default=1
- limit: (optional) default=20, max=100

**Response (200 OK):**

{   "partners": [     {       "partner\_id": "550e8400-e29b-41d4-a716-446655440000",       "partner\_code": "USAVZ1",       "partner\_name": "Verizon Wireless",       "partner\_type": "MNO",       "country\_code": "USA",       "status": "ACTIVE"     }   ],   "pagination": {     "current\_page": 1,     "total\_pages": 5,     "total\_records": 97,     "limit": 20   } }


### **PATCH /api/v1/partners/{partner\_id}/status**
**Description:** Update partner status

**Request Body:**

{   "status": "ACTIVE",   "reason": "Completed onboarding and testing" }

**Response (200 OK):**

{   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "status": "ACTIVE",   "updated\_at": "2025-01-15T14:45:00Z" }

## **3.2.2 Agreement Management APIs**
### **POST /api/v1/agreements**
**Description:** Create a new roaming/interconnect agreement

**Request Body:**

{   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "agreement\_type": "BOTH",   "start\_date": "2025-02-01",   "end\_date": null,   "currency": "USD",   "billing\_cycle": "MONTHLY",   "contract\_file": "base64\_encoded\_pdf\_data" }

**Response (201 Created):**

{   "agreement\_id": "660f9511-f3ac-52e5-b827-557766551111",   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "agreement\_type": "BOTH",   "start\_date": "2025-02-01",   "end\_date": null,   "status": "DRAFT",   "currency": "USD",   "billing\_cycle": "MONTHLY",   "contract\_file\_url": "https://storage/agreements/660f9511.pdf",   "created\_at": "2025-01-15T10:35:00Z" }


## **3.2.3 Rate Plan Management APIs**
### **POST /api/v1/rate-plans**
**Description:** Create rate plan for an agreement

**Request Body:**

{   "agreement\_id": "660f9511-f3ac-52e5-b827-557766551111",   "service\_id": "770g0622-g4bd-63f6-c938-668877662222",   "direction": "INBOUND",   "rate\_per\_unit": 0.025,   "currency": "USD",   "effective\_from": "2025-02-01",   "effective\_to": null,   "rounding\_rule": "UP",   "minimum\_charge": 0.01 }

**Response (201 Created):**

{   "rate\_plan\_id": "880h1733-h5ce-74g7-d049-779988773333",   "agreement\_id": "660f9511-f3ac-52e5-b827-557766551111",   "service\_id": "770g0622-g4bd-63f6-c938-668877662222",   "service\_type": "VOICE",   "direction": "INBOUND",   "rate\_per\_unit": 0.025,   "currency": "USD",   "effective\_from": "2025-02-01",   "effective\_to": null,   "rounding\_rule": "UP",   "minimum\_charge": 0.01 }

### **POST /api/v1/rate-plans/bulk**
**Description:** Bulk upload rate plans via CSV

**Request (multipart/form-data):**

- agreement\_id: UUID
- file: CSV file with columns (service\_type, direction, rate\_per\_unit, effective\_from)

**Response (202 Accepted):**

{   "job\_id": "990i2844-i6df-85h8-e150-88aa99884444",   "status": "PROCESSING",   "message": "Rate plan import job queued",   "records\_count": 45 }


# **4. Phase 2: Interconnect/Roaming Core**
## **4.1 TAP File Processing**
### **4.1.1 TAP3.12 Parser Implementation**
The TAP parser will process TAP3.12 files and extract CDR records for rating and settlement.
#### **Requirements:**
- Support TAP3.12 specification (TD.57)
- Parse ASN.1 binary format
- Extract call records (MobileOriginatedCall, MobileTerminatedCall)
- Extract data records (GprsCall)
- Extract SMS records (MessagingEvent)
- Validate file structure and integrity
- Handle file errors and generate error reports
#### **TAP File Upload API:**
### **POST /api/v1/tap/upload**
**Description:** Upload TAP3.12 file for processing

**Request (multipart/form-data):**

- partner\_id: UUID
- direction: INBOUND or OUTBOUND
- file: TAP3.12 binary file

**Response (202 Accepted):**

{   "tap\_file\_id": "aa0j3955-j7eg-96i9-f261-99bbaa995555",   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "filename": "USAVZ1GBRTM1\_20250115.TAP",   "file\_size\_bytes": 524288,   "direction": "INBOUND",   "status": "PARSING",   "upload\_timestamp": "2025-01-15T15:00:00Z" }

### **4.1.2 TAP Processing Workflow**
1. File uploaded to /tap/upload endpoint
1. File stored in object storage (S3/MinIO)
1. Parsing job queued in RabbitMQ/Redis
1. TAP Parser Service picks up job
1. Parse TAP3.12 binary file using ASN.1 decoder
1. Extract CDRs and store in MongoDB (raw\_tap\_data field)
1. Create TAPRecord entries in PostgreSQL
1. Trigger rating job for each CDR
1. Update tap\_file status to PARSED
1. Send notification to partner portal


## **4.2 Rating Engine**
### **4.2.1 Rating Logic**
The rating engine applies partner-specific rates to CDRs to calculate charges.
#### **Rating Rules:**
- Identify applicable rate plan based on: partner, service type, direction, effective dates
- Voice: Calculate based on duration in seconds, apply rounding rule
- SMS: Flat rate per message
- Data: Calculate based on MB volume, apply minimum charge
- Apply currency conversion if needed
- Store charged\_amount and currency in TAPRecord
#### **Rating Calculation Example (Voice):**
Duration: 185 seconds Rate: $0.025 per minute Rounding: UP  Calculation: - Minutes = 185 / 60 = 3.083 minutes - Rounded = 4 minutes (UP) - Charge = 4 \* 0.025 = $0.10

### **POST /api/v1/rating/rate-cdr**
**Description:** Internal API to rate a single CDR

**Request Body:**

{   "tap\_record\_id": "bb1k4a66-k8fh-a7j0-g372-aaccbb006666",   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "service\_type": "VOICE",   "direction": "INBOUND",   "duration\_seconds": 185,   "call\_date\_time": "2025-01-15T12:30:45Z" }

**Response (200 OK):**

{   "tap\_record\_id": "bb1k4a66-k8fh-a7j0-g372-aaccbb006666",   "rate\_plan\_id": "880h1733-h5ce-74g7-d049-779988773333",   "charged\_amount": 0.10,   "currency": "USD",   "calculation\_details": {     "duration\_minutes": 4.0,     "rate\_per\_minute": 0.025,     "rounding\_applied": "UP"   },   "rated\_at": "2025-01-15T15:05:00Z" }


## **4.3 Reconciliation Service**
### **4.3.1 Reconciliation Process**
The reconciliation service compares inbound and outbound traffic to identify discrepancies.
#### **Reconciliation Logic:**
- Match inbound TAP records with outbound CDRs based on MSISDN, timestamp, duration
- Identify unmatched records (potential fraud or network issues)
- Compare charged amounts between partners
- Flag discrepancies exceeding threshold (e.g., 5%)
- Generate reconciliation report
### **POST /api/v1/reconciliation/run**
**Description:** Trigger reconciliation for a billing period

**Request Body:**

{   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "period\_start": "2025-01-01",   "period\_end": "2025-01-31" }

**Response (202 Accepted):**

{   "reconciliation\_id": "cc2l5b77-l9gi-b8k1-h483-bbddcc117777",   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "period\_start": "2025-01-01",   "period\_end": "2025-01-31",   "status": "IN\_PROGRESS",   "started\_at": "2025-02-01T10:00:00Z" }

## **4.4 RAEX IR.21 Automation**
### **4.4.1 RAEX Form Management**
Simulate RAEX IR.21 metadata exchange for partner technical information.
#### **RAEX Form Fields:**
- Network Name and TADIG Code
- Country and MCC/MNC codes
- Contact Information (Technical, Commercial)
- Supported Technologies (2G/3G/4G/5G)
- Network Capabilities (VoLTE, VoWiFi, RCS)
- Signaling Details (SCCP addresses, Diameter endpoints)
- TAP Specifications (versions supported, file exchange details)
### **POST /api/v1/raex/submit**
**Description:** Submit RAEX IR.21 form data

**Request Body:**

{   "agreement\_id": "660f9511-f3ac-52e5-b827-557766551111",   "network\_name": "Verizon Wireless",   "tadig\_code": "USAVZ1",   "mcc": "310",   "mnc": "012",   "supported\_technologies": ["4G", "5G"],   "volte\_capable": true,   "sccp\_address": "1234567890123",   "diameter\_endpoint": "diameter.verizon.com:3868",   "tap\_version": "3.12",   "file\_exchange\_protocol": "SFTP" }


# **5. Phase 3: Analytics & Assurance**
## **5.1 Partner Dashboard**
### **5.1.1 Dashboard Components**
The partner dashboard provides real-time visibility into traffic, revenue, and operational metrics.
#### **Dashboard Widgets:**
- Traffic Overview: Voice minutes, SMS count, Data MB (current period)
- Revenue Summary: Total charges, by service type, margin analysis
- Service Quality: Success rates, average call duration, network performance
- Billing Status: Current invoice, payment due, outstanding amount
- Dispute Tracker: Open disputes, resolution timeline
- SLA Compliance: Availability, latency, success rate metrics
### **GET /api/v1/analytics/dashboard/{partner\_id}**
**Description:** Get dashboard data for a partner

**Query Parameters:**

- period: day, week, month, quarter
- from\_date: ISO 8601 date
- to\_date: ISO 8601 date

**Response (200 OK):**

{   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "period": "month",   "from\_date": "2025-01-01",   "to\_date": "2025-01-31",   "traffic\_summary": {     "voice\_minutes": 125430,     "sms\_count": 45678,     "data\_mb": 567890   },   "revenue\_summary": {     "total\_charges": 12543.50,     "voice\_revenue": 8450.25,     "sms\_revenue": 1823.15,     "data\_revenue": 2270.10,     "margin\_percentage": 25.5   },   "sla\_compliance": {     "availability\_percentage": 99.97,     "average\_success\_rate": 98.5,     "average\_latency\_ms": 85   } }

## **5.2 Anomaly Detection**
### **5.2.1 Detection Rules**
The anomaly detection system identifies unusual patterns that may indicate fraud or network issues.
#### **Detection Patterns:**
- Unusual Traffic Volume: Spike >200% of daily average
- High-Cost Destination Abuse: Calls to premium rate numbers
- Velocity Anomalies: Same MSISDN in multiple countries within short timeframe
- Success Rate Drop: <90% success rate for extended period
- Unusual Call Duration: Average duration >3x normal
- Late Night Traffic: High volume during off-peak hours
### **GET /api/v1/fraud/anomalies**
**Description:** Get detected anomalies

**Query Parameters:**

- severity: LOW, MEDIUM, HIGH, CRITICAL
- status: OPEN, INVESTIGATING, RESOLVED, FALSE\_POSITIVE
- from\_date: ISO 8601 date

**Response (200 OK):**

{   "anomalies": [     {       "anomaly\_id": "dd3m6c88-m0hj-c9l2-i594-cceedd228888",       "partner\_id": "550e8400-e29b-41d4-a716-446655440000",       "detected\_at": "2025-01-15T14:30:00Z",       "anomaly\_type": "UNUSUAL\_TRAFFIC\_VOLUME",       "severity": "HIGH",       "description": "Traffic spike of 350% detected",       "affected\_services": ["VOICE"],       "metrics": {         "normal\_volume": 5000,         "detected\_volume": 17500,         "percentage\_increase": 250       },       "status": "OPEN",       "recommended\_action": "Review traffic patterns and contact partner"     }   ] }


## **5.3 Test Call Automation**
### **5.3.1 Test Call Simulation**
Automated test call generation to validate roaming connectivity and service quality.
#### **Test Scenarios:**
- Voice Call Test: MO and MT voice calls
- SMS Test: MO and MT SMS messages
- Data Session Test: HTTP/HTTPS data connectivity
- VoLTE Test: Voice over LTE connectivity
- Registration Test: Network attachment and authentication
### **POST /api/v1/testing/test-call**
**Description:** Schedule a test call

**Request Body:**

{   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "test\_type": "VOICE\_CALL",   "direction": "MO",   "source\_msisdn": "+447700900123",   "destination\_msisdn": "+14155551234",   "scheduled\_time": "2025-01-16T10:00:00Z" }

**Response (201 Created):**

{   "test\_id": "ee4n7d99-n1ik-d0m3-j605-ddffee339999",   "partner\_id": "550e8400-e29b-41d4-a716-446655440000",   "test\_type": "VOICE\_CALL",   "status": "SCHEDULED",   "scheduled\_time": "2025-01-16T10:00:00Z" }

### **GET /api/v1/testing/test-results/{test\_id}**
**Description:** Get test call results

**Response (200 OK):**

{   "test\_id": "ee4n7d99-n1ik-d0m3-j605-ddffee339999",   "status": "COMPLETED",   "result": "SUCCESS",   "executed\_at": "2025-01-16T10:00:15Z",   "duration\_seconds": 45,   "quality\_metrics": {     "mos\_score": 4.2,     "packet\_loss\_percentage": 0.5,     "jitter\_ms": 15,     "latency\_ms": 120   },   "details": {     "call\_setup\_time\_ms": 2500,     "ring\_time\_seconds": 3,     "conversation\_time\_seconds": 40   } }


# **6. Phase 4: UX/Frontend Layer**
## **6.1 Partner Portal**
### **6.1.1 Portal Features**
- Dashboard: Traffic, revenue, and performance metrics
- Agreement Management: View agreements, upload contracts
- Rate Plan Viewer: View current rates, rate history
- Invoice Center: View invoices, download PDFs, payment status
- TAP File Management: Upload TAP files, view processing status
- Dispute Management: Raise disputes, track resolution
- Reports: Generate custom reports, scheduled exports
### **6.1.2 UI Components**

|**Component**|**Description**|
| :-: | :-: |
|**Login Page**|Email/password authentication, MFA support, password reset|
|**Dashboard Cards**|Metric cards with sparklines, KPI indicators, trend arrows|
|**Traffic Charts**|Line charts for time series, bar charts for service comparison, pie charts for distribution|
|**Data Tables**|Sortable columns, pagination, search/filter, export to CSV/Excel|
|**File Upload**|Drag-and-drop interface, progress indicators, file validation|
|**Status Badges**|Color-coded status indicators (green=active, yellow=pending, red=error)|
|**Modal Dialogs**|For forms, confirmations, detail views|
|**Notifications**|Toast notifications for success/error messages, notification center for alerts|


## **6.2 Operator Admin Portal**
### **6.2.1 Admin Features**
- Partner Management: View all partners, approve onboarding, manage status
- Agreement Oversight: Review agreements, manage approval workflows
- Rate Plan Management: Create/edit rate plans, bulk operations
- Financial Overview: Revenue tracking, settlement monitoring
- System Monitoring: Platform health, performance metrics, alerts
- User Management: Manage operator and partner users, roles, permissions
- Audit Logs: Track all system activities, compliance reporting
### **6.2.2 Admin UI Screens**
1. Partners List: Searchable table with filters (status, type, country)
1. Partner Detail: Full partner information, agreements, traffic, disputes
1. Rate Card Editor: Visual interface for creating and editing rate plans
1. Financial Dashboard: Revenue by partner, payment status, forecasting
1. System Health: Real-time metrics, alert management, incident response

## **6.3 Customer Service Portal**
### **6.3.1 CS Features**
- Dispute Management: View disputes, update status, communicate with partners
- Partner SLA Metrics: Monitor SLA compliance, flag violations
- Settlement Approval: Review and approve settlement adjustments
- Communication Hub: Email templates, notification history
- Knowledge Base: Access documentation, troubleshooting guides


# **7. User Journey Specifications**
## **7.1 Journey A: Partner Onboarding**
### **7.1.1 Actors**
- Operator Admin: Internal staff managing partner relationships
- Partner Contact: Representative from partner organization
### **7.1.2 Pre-conditions**
- Operator has commercial agreement drafted with partner
- Partner has technical capability for roaming/interconnect
### **7.1.3 Detailed Steps**

|**Step**|**User Action**|**System Response**|
| :-: | :-: | :-: |
|1|Partner sends request via email/form to initiate interconnect|Operator Admin receives notification in portal|
|2|Operator Admin creates partner record: POST /api/v1/partners with partner details|System creates partner with status=PENDING, generates partner\_id|
|3|Operator Admin drafts digital offer and agreement: POST /api/v1/agreements, uploads contract PDF|System stores contract in S3, creates agreement with status=DRAFT|
|4|System sends email to Partner Contact with portal invitation link|Partner receives email with temporary password and login instructions|
|5|Partner logs into portal, views agreement and rate card details|System displays agreement details, rate plans, terms|
|6|Partner uploads RAEX IR.21 form via portal: POST /api/v1/raex/submit with technical details|System validates form, stores technical metadata, attaches to agreement|
|7|Partner clicks Accept Agreement button in portal|System updates agreement status=PENDING, sends notification to Operator Admin|
|8|Operator Admin reviews acceptance, performs technical validation|System displays pending approval in admin queue|
|9|Operator Admin approves: PATCH /api/v1/agreements/{id}/status with status=ACTIVE|System updates agreement, creates partner record in active partners, activates rate plans|
|10|System sends activation confirmation email to Partner|Partner receives welcome email with next steps for TAP testing|

### **7.1.4 Success Criteria**
- Partner record created with status=ACTIVE
- Agreement approved and stored
- Rate plans activated and ready for traffic
- Partner has portal access for TAP file exchange


## **7.2 Journey B: Usage Processing & Settlement**
### **7.2.1 Actors**
- Mediation/Finance Ops: Operator staff managing billing processes
- Partner: Partner organization submitting usage data
### **7.2.2 Pre-conditions**
- Partner agreement is ACTIVE
- Rate plans are configured for the billing period
- Partner has TAP3.12 file with usage data
### **7.2.3 Detailed Steps**

|**Step**|**User Action**|**System Response**|
| :-: | :-: | :-: |
|1|Partner logs into portal, navigates to TAP File Upload section|System displays upload interface with drag-and-drop zone|
|2|Partner uploads TAP3.12 file: POST /api/v1/tap/upload with file and metadata|System validates file format, stores in S3, creates tap\_file record, returns job\_id|
|3|Partner sees upload progress bar and confirmation: File uploaded successfully|TAP Parser Service picks up job from queue, begins parsing|
|4|Background: TAP Parser extracts 5,234 CDRs from file|System creates TAPRecord entries in PostgreSQL, stores raw TAP data in MongoDB|
|5|Background: Rating Engine processes each CDR|For each record: lookup rate plan, calculate charge, update tap\_record.charged\_amount|
|6|Partner refreshes portal, sees processing status updated to RATED|System displays: 5,234 records processed, Total charges: $12,543.50|
|7|Background: Settlement Service generates invoice at end of billing period|System aggregates charges, creates Invoice record, generates PDF, status=ISSUED|
|8|Partner receives email notification: Invoice #INV-202501-001 issued|Email contains invoice summary and download link|
|9|Partner logs in, navigates to Invoices section, views invoice details|System displays invoice with line-item breakdown by service type|
|10|Partner identifies discrepancy in data charges, clicks Raise Dispute button|System opens dispute form modal, pre-populates invoice details|

### **7.2.4 Success Criteria**
- TAP file parsed successfully with all CDRs extracted
- All CDRs rated with correct charges applied
- Invoice generated automatically at end of period
- Partner can view and download invoice


## **7.3 Journey C: Dispute Resolution**
### **7.3.1 Actors**
- Partner: Partner organization raising dispute
- Operator Finance: Operator staff managing financial disputes
- Compliance Officer: Review and approval authority
### **7.3.2 Detailed Steps**

|**Step**|**User Action**|**System Response**|
| :-: | :-: | :-: |
|1|Partner identifies overbilled data sessions in invoice line items|N/A - Partner analysis|
|2|Partner clicks Raise Dispute on invoice detail page|System opens dispute creation modal with form fields|
|3|Partner fills form: type=BILLING, description, disputed\_amount=$2,450, uploads supporting docs|Form validation occurs in real-time|
|4|Partner submits dispute: POST /api/v1/disputes|System creates dispute record, assigns dispute\_number, status=OPEN, sends notification|
|5|Partner sees confirmation: Dispute #DSP-2025-00042 created, expected resolution 5-7 business days|System updates invoice status to DISPUTED, holds payment|
|6|Operator Finance receives alert in CS Portal, reviews dispute details|System displays dispute with invoice link, supporting docs, partner comments|
|7|Finance analyst investigates: queries TAPRecords, checks rating engine logs, finds misconfigured rate|System provides drill-down queries, shows affected CDRs|
|8|Finance validates partner claim, updates dispute: PATCH /api/v1/disputes/{id} status=IN\_REVIEW|System updates status, logs activity, sends update notification to partner|
|9|Finance adds resolution: Approved adjustment of $2,450, corrected rate plan, will reprocess affected records|System stores resolution notes, status=RESOLVED|
|10|Background: Settlement Service generates credit note, adjusts invoice|System creates credit note document, updates invoice.total\_amount, releases payment hold|
|11|Partner receives resolution email with adjusted invoice and credit note|Email contains links to download updated documents|

### **7.3.3 Success Criteria**
- Dispute created and tracked through resolution
- Issue validated and adjustment approved
- Invoice corrected with credit note issued
- Partner satisfied with transparent resolution process


## **7.4 Journey E: Fraud & Security Monitoring**
### **7.4.1 Actors**
- Fraud Analyst: Operator security staff monitoring for fraudulent activity
### **7.4.2 Detailed Steps**

|**Step**|**User Action**|**System Response**|
| :-: | :-: | :-: |
|1|Background: Fraud Detection Service detects unusual pattern - 350% traffic spike to premium destinations|System creates anomaly record, severity=HIGH, type=HIGH\_COST\_DESTINATION\_ABUSE|
|2|Fraud Analyst receives real-time alert via email/SMS: HIGH severity fraud alert detected|Notification Service sends alert to configured recipients|
|3|Analyst logs into Fraud Portal, views anomaly details|System displays: partner, affected MSISDNs, destination numbers, call patterns, estimated loss|
|4|Analyst reviews details: 15 MSISDNs calling premium rate services in Nauru (+674)|System shows CDR details, duration patterns, estimated revenue impact $45,000|
|5|Analyst tags anomaly as IRSF (International Revenue Share Fraud)|System updates anomaly classification, triggers IRSF response workflow|
|6|Analyst clicks Block Route button for +674 destination prefix|System simulates: Creates routing rule to block outbound calls to +674, effective immediately|
|7|Analyst adds investigation notes: Blocked +674 prefix, notified partner security contact, requested subscriber verification|System stores notes in case timeline, updates status=INVESTIGATING|
|8|System sends automated notification to partner: Fraud alert - traffic pattern detected|Email sent to partner security contact with incident details and recommended actions|
|9|Background: Fraud Detection learns pattern, updates ML model with +674 IRSF indicators|System trains model on new fraud pattern for future detection|
|10|After investigation complete, analyst marks case as RESOLVED|System archives case, generates fraud report for compliance, stores for future reference|

### **7.4.3 Success Criteria**
- Fraud detected in near-real-time
- Analyst able to classify and respond to threat
- Route blocked to prevent further losses
- Partner notified for coordinated response
- System learns pattern for improved future detection


# **8. Appendix**
## **8.1 Success Metrics**
- Partner onboarding time: < 3 days from request to active
- TAP file processing time: < 30 minutes for files up to 1GB
- Rating accuracy: 99.9% match with partner expectations
- Invoice generation: Automated within 24 hours of period end
- Dispute resolution time: < 7 business days average
- Fraud detection: < 5 minute detection latency for critical patterns
## **8.2 Testing Approach**
1. Unit Testing: All API endpoints and business logic functions
1. Integration Testing: Service-to-service communication, database operations
1. End-to-End Testing: Complete user journeys using Cypress
1. Performance Testing: Load testing with simulated traffic volumes
1. Security Testing: Penetration testing, vulnerability scanning
1. User Acceptance Testing: Validate with sample partner data
## **8.3 Development Best Practices**
- Use environment variables for all configuration
- Implement comprehensive logging with structured formats (JSON)
- Add request tracing with correlation IDs
- Document all APIs with OpenAPI/Swagger
- Use database migrations for schema changes
- Implement graceful error handling with meaningful messages
- Follow RESTful API design principles
- Use git feature branches with PR reviews