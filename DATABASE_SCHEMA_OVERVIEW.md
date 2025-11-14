# Database Schema Overview

## Architecture

The Interconnect & Roaming Management Platform uses **PostgreSQL** as the primary relational database with **Prisma ORM** for type-safe database access.

## Database Design Principles

- ✅ **Strong Typing**: All entities are fully typed with TypeScript
- ✅ **Referential Integrity**: Foreign key constraints enforce data consistency
- ✅ **Cascading Deletes**: Proper cascade rules prevent orphaned records
- ✅ **Indexed Fields**: Strategic indexes on frequently queried columns
- ✅ **Audit Trails**: Created/updated timestamps on all entities
- ✅ **Flexible JSON**: JSON fields for dynamic/semi-structured data

---

## Entity Relationship Diagram

```
┌─────────────┐
│   USERS     │
└─────────────┘
       │
       ├───────────────────┐
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│  PARTNERS   │◄───│  DISPUTES   │
└─────────────┘    └─────────────┘
       │                   ▲
       ├───────────────────┤
       │                   │
       ▼                   │
┌─────────────┐    ┌─────────────┐
│ AGREEMENTS  │    │  INVOICES   │
└─────────────┘    └─────────────┘
       │                   ▲
       ▼                   │
┌─────────────┐            │
│ RATE PLANS  │            │
└─────────────┘            │
       │                   │
       ▼                   │
┌─────────────┐    ┌─────────────┐
│ RATE SHEETS │    │  TAP FILES  │
└─────────────┘    └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│    RATES    │    │ TAP RECORDS │
└─────────────┘    └─────────────┘
```

---

## Core Tables

### 1. Users & Authentication

**`users`** - User accounts and authentication
- Primary Key: `id` (UUID)
- Role-based access: ADMIN, PARTNER, FINANCE, SUPPORT
- Linked to partners for partner users
- Tracks login activity

Fields:
- `email` (unique)
- `password` (bcrypt hashed)
- `role` (enum)
- `partner_id` (nullable FK)
- `created_at`, `updated_at`, `last_login`

---

### 2. Partner Management

**`partners`** - Telecom partner organizations
- Primary Key: `id` (UUID)
- Unique: `partner_code` (TADIG code)
- Types: VENDOR, CUSTOMER, RECIPROCAL
- Status workflow: PENDING → ACTIVE → SUSPENDED/INACTIVE

Indexes:
- `partner_code` (unique)
- `status`
- `country_code`

Relations:
- Has many: agreements, rate_sheets, tap_files, invoices, disputes, anomalies

---

### 3. Agreements & Contracts

**`agreements`** - Commercial roaming/interconnect agreements
- Primary Key: `id` (UUID)
- Types: INTERCONNECT, ROAMING, BOTH
- Status: DRAFT → PENDING → ACTIVE → EXPIRED/TERMINATED
- Supports contract file uploads and RAEX forms

Fields:
- `agreement_type` (enum)
- `start_date`, `end_date`
- `currency` (ISO 4217)
- `billing_cycle` (MONTHLY, QUARTERLY, CUSTOM)
- `document_template` (TEXT)

Relations:
- Belongs to: partner
- Has many: rate_plans, raex_forms

---

### 4. Rate Management

**`rate_sheets`** - Rate card versions
- Primary Key: `id` (UUID)
- Date-based activation with effective/expiry dates
- Active/inactive status per partner

**`rates`** - Individual pricing entries
- Prefix-based routing (called_number_prefix)
- Service type: VOICE, SMS, DATA, MMS
- Direction: INBOUND, OUTBOUND
- Rounding rules: UP, DOWN, NEAREST, NONE
- Decimal precision: (10,6) for 6 decimal places

**`rate_plans`** - Agreement-level rate plans
- Links agreements to service rates
- Date-based effective periods
- Used for legacy compatibility

---

### 5. TAP File Processing

**`tap_files`** - Uploaded TAP3.12 files
- Primary Key: `id` (UUID)
- Status: UPLOADED → PARSING → PARSED → RATED → ERROR
- Tracks file size, record count, total charges
- Direction: INBOUND/OUTBOUND

**`tap_records`** - Individual CDR records
- Extracted from TAP files
- Service-specific fields:
  - VOICE: `duration_seconds`
  - SMS: `message_count`
  - DATA: `data_volume_mb`
- Stores `raw_tap_data` as JSON
- Processing status: PENDING → RATED → SETTLED/DISPUTED

Indexes:
- `tap_file_id`
- `partner_id`
- `processing_status`
- `call_date_time`
- `msisdn`

---

### 6. Invoicing & Billing

**`invoices`** - Generated invoices
- Primary Key: `id` (UUID)
- Unique: `invoice_number`
- Status: DRAFT → ISSUED → PAID/DISPUTED/CANCELLED/OVERDUE
- Supports subtotal, tax, total amounts
- Line items stored as JSON
- Payment tracking with due_date and paid_date

Fields:
- `billing_period_start`, `billing_period_end`
- `subtotal`, `tax_amount`, `total_amount` (DECIMAL 15,2)
- `currency` (ISO 4217)
- `line_items` (JSON)
- `pdf_url` for generated PDFs

---

### 7. Dispute Management

**`disputes`** - Billing and technical disputes
- Primary Key: `id` (UUID)
- Unique: `dispute_number`
- Types: BILLING, TECHNICAL, QUALITY, OTHER
- Status: OPEN → IN_REVIEW → RESOLVED/REJECTED/ESCALATED
- Priority: LOW, MEDIUM, HIGH, CRITICAL
- Assignment to users for workflow

Relations:
- Belongs to: partner, invoice (optional)
- Assigned to: user (support/finance)
- Created by: user

---

### 8. Fraud Detection

**`anomalies`** - Fraud and security alerts
- Primary Key: `id` (UUID)
- Types:
  - UNUSUAL_TRAFFIC_VOLUME
  - HIGH_COST_DESTINATION
  - IRSF_SUSPECTED (International Revenue Share Fraud)
  - SIM_BOX_FRAUD
  - WANGIRI_FRAUD
  - And more...
- Severity: LOW → MEDIUM → HIGH → CRITICAL
- Investigation workflow with notes

Fields:
- `anomaly_type` (enum)
- `severity` (enum)
- `affected_services` (ServiceType[])
- `metrics` (JSON) - dynamic fraud metrics
- `recommended_action` (TEXT)

---

### 9. RAEX & Technical Config

**`raex_forms`** - RAEX IR.21 technical forms
- Network technical information exchange
- TADIG codes, MCC/MNC codes
- Technology support: 2G, 3G, 4G, 5G
- VoLTE, VoWiFi, RCS capabilities
- Signaling endpoints (SCCP, Diameter)
- TAP specifications

---

### 10. Test Automation

**`test_calls`** - Automated test execution
- Test types: VOICE_CALL, SMS, DATA_SESSION, VOLTE, REGISTRATION
- Direction: MO (Mobile Originated), MT (Mobile Terminated)
- Quality metrics: MOS score, packet loss, jitter, latency
- Execution status and results

---

### 11. Policy Documents

**`policy_documents`** - Policy templates
- Types: AGREEMENT_TEMPLATE, SMS_REVENUE_COMMITMENT, TAX_POLICY
- Version control
- Status workflow

---

## Data Types

### Enums

```typescript
UserRole: ADMIN | PARTNER | FINANCE | SUPPORT
PartnerType: VENDOR | CUSTOMER | RECIPROCAL
PartnerStatus: PENDING | ACTIVE | SUSPENDED | INACTIVE
AgreementType: INTERCONNECT | ROAMING | BOTH
ServiceType: VOICE | SMS | DATA | MMS
Direction: INBOUND | OUTBOUND
RoundingRule: UP | DOWN | NEAREST | NONE
InvoiceStatus: DRAFT | ISSUED | PAID | DISPUTED | CANCELLED | OVERDUE
DisputeType: BILLING | TECHNICAL | QUALITY | OTHER
AnomalyType: UNUSUAL_TRAFFIC_VOLUME | HIGH_COST_DESTINATION | ...
```

### Decimal Precision

- **Rates**: DECIMAL(10,6) - 6 decimal places for precise pricing
- **Charges**: DECIMAL(10,6) - matches rate precision
- **Invoice Amounts**: DECIMAL(15,2) - 2 decimal places for currency
- **Disputed Amounts**: DECIMAL(15,2)

### JSON Fields

- `tap_records.raw_tap_data` - Original TAP record
- `invoices.line_items` - Invoice line item breakdown
- `anomalies.metrics` - Fraud detection metrics
- `test_calls.quality_metrics` - Call quality measurements
- `test_calls.details` - Test execution details

---

## Indexes

Strategic indexes for query performance:

### Partner Lookups
- `partners.partner_code` (unique)
- `partners.status`
- `partners.country_code`

### TAP Processing
- `tap_files.status`
- `tap_records.processing_status`
- `tap_records.call_date_time`
- `tap_records.msisdn`

### Billing
- `invoices.status`
- `invoices.invoice_date`
- `invoices.due_date`

### Fraud Detection
- `anomalies.severity`
- `anomalies.status`
- `anomalies.detected_at`

### Rate Lookup
- `rates.service_type, direction` (composite)
- `rates.called_number_prefix`
- `rate_sheets.effective_date`

---

## Cascade Rules

### On Delete Cascade
- Partner deleted → cascades to agreements, rate sheets, TAP files
- Agreement deleted → cascades to rate plans, RAEX forms
- Rate sheet deleted → cascades to rates
- TAP file deleted → cascades to TAP records

### On Delete Set Null
- User deleted → disputes remain but creator/assignee set to null
- Invoice deleted → disputes remain but invoice link removed

---

## Migration Strategy

### Development
```bash
npm run db:push  # Fast schema sync
```

### Production
```bash
npm run db:migrate  # Versioned migrations
npx prisma migrate deploy  # Apply in production
```

### Seeding
```bash
npm run db:seed  # Populate sample data
```

---

## Security Considerations

1. **Password Hashing**: bcrypt with salt rounds = 10
2. **No Exposed Credentials**: Use environment variables
3. **Prepared Statements**: Prisma prevents SQL injection
4. **Role-Based Access**: Enforced at application layer
5. **Audit Trails**: created_at, updated_at on all tables

---

## Performance Optimization

1. **Connection Pooling**: Singleton Prisma Client
2. **Strategic Indexes**: On frequently queried fields
3. **Lazy Loading**: Relations loaded on demand
4. **JSON for Flexibility**: Semi-structured data in JSON
5. **Decimal Precision**: Appropriate precision for financial data

---

## Future Enhancements

- [ ] Add full-text search on partners, disputes
- [ ] Implement soft deletes with deleted_at
- [ ] Add audit log table for compliance
- [ ] Partition TAP records table by date
- [ ] Add database-level triggers for fraud detection
- [ ] Implement read replicas for reporting
- [ ] Add materialized views for analytics

---

## Schema Statistics

- **Total Tables**: 15
- **Total Enums**: 15
- **Total Indexes**: 25+
- **Foreign Key Relations**: 30+
- **Lines of Prisma Schema**: 632

---

## Tools & Technologies

- **Database**: PostgreSQL 16
- **ORM**: Prisma 6.19
- **Schema Language**: Prisma Schema Language
- **Type Generation**: Prisma Client Generator
- **GUI**: Prisma Studio
- **Migration**: Prisma Migrate
- **Seeding**: TypeScript with tsx

---

For implementation details, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)
