# Interconnect & Roaming Solution - Product Prototype

A comprehensive web-based platform for managing telecom interconnect and roaming operations, built according to the PRD specifications.

## Overview

This prototype demonstrates all four phases outlined in the PRD:
- **Phase 1**: Foundation - Core entities, partner onboarding, API gateway
- **Phase 2**: Interconnect/Roaming Core - TAP parsing, rating, reconciliation
- **Phase 3**: Analytics & Assurance - Dashboards, anomaly detection, test automation
- **Phase 4**: UX/Frontend - Partner portal, operator admin, customer service UI

## Technology Stack

- **Frontend**: Next.js 16 with React 19.2, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes (REST APIs)
- **Data**: Mock data simulating PostgreSQL + MongoDB
- **State Management**: React Hooks

## Project Structure

```
interconnect-roaming_app/
├── app/
│   ├── api/                    # API Routes
│   │   ├── partners/          # Partner management APIs
│   │   ├── agreements/        # Agreement management APIs
│   │   ├── rate-plans/        # Rate plan APIs
│   │   ├── tap/               # TAP file upload & processing
│   │   ├── rating/            # Rating engine APIs
│   │   ├── invoices/          # Invoice management APIs
│   │   ├── disputes/          # Dispute management APIs
│   │   ├── fraud/             # Fraud detection APIs
│   │   └── analytics/         # Dashboard analytics APIs
│   ├── partners/              # Partner management pages
│   ├── dashboard/             # Analytics dashboard
│   ├── invoices/              # Invoice management pages
│   ├── disputes/              # Dispute management pages
│   ├── fraud/                 # Fraud monitoring pages
│   ├── admin/                 # Admin portal
│   ├── layout.tsx             # Root layout with navigation
│   └── page.tsx               # Home page
├── components/
│   ├── layout/                # Layout components
│   │   └── Navigation.tsx     # Main navigation
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # All entity types
│   ├── mock-data/             # Mock database
│   │   └── index.ts           # Sample data for all entities
│   └── utils/                 # Utility functions
│       └── helpers.ts         # Helper functions
└── public/                    # Static assets
```

## Core Features

### 1. Partner Management
- Create, read, update, delete partners
- Filter by status (ACTIVE, PENDING, SUSPENDED, INACTIVE)
- Filter by partner type (MNO, MVNO, HUB, CARRIER)
- Update partner status with workflow
- View partner details and analytics

### 2. Agreement Management
- Create and manage roaming/interconnect agreements
- Configure rate plans for services (VOICE, SMS, DATA, MMS)
- Support for multiple currencies
- Billing cycle configuration (MONTHLY, QUARTERLY, CUSTOM)
- RAEX IR.21 form management

### 3. TAP File Processing & Rating
- Upload TAP3.12 files
- Automated parsing and CDR extraction
- Real-time rating engine
- Apply partner-specific rates
- Support for different service types
- Rounding rules (UP, DOWN, NEAREST)
- Minimum charge enforcement

### 4. Analytics Dashboard
- Traffic summary (voice minutes, SMS count, data MB)
- Revenue breakdown by service type
- SLA compliance monitoring
- Network availability metrics
- Success rate tracking
- Latency monitoring

### 5. Invoice Management
- Automated invoice generation
- Detailed line items by service type
- Multiple currency support
- Invoice status tracking
- Download functionality
- Billing period management

### 6. Dispute Management
- Create and track disputes
- Dispute types (BILLING, TECHNICAL, QUALITY, OTHER)
- Status workflow (OPEN → IN_REVIEW → RESOLVED/REJECTED)
- Resolution tracking with notes
- Assignment to team members
- Audit trail

### 7. Fraud Detection & Security
- Real-time anomaly detection
- Multiple detection patterns:
  - Unusual traffic volume
  - High-cost destination abuse
  - Velocity anomalies
  - Success rate drops
  - Unusual call durations
  - Late night traffic analysis
- Severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- Investigation workflow
- Recommended actions

### 8. Admin Portal
- Platform overview
- Partner status distribution
- Agreement type analytics
- Revenue tracking
- System health monitoring
- Recent activity feed
- Quick actions

## API Endpoints

### Partner Management
- `GET /api/partners` - List all partners (with filters)
- `POST /api/partners` - Create new partner
- `GET /api/partners/:id` - Get partner details
- `PATCH /api/partners/:id` - Update partner
- `DELETE /api/partners/:id` - Delete partner
- `PATCH /api/partners/:id/status` - Update partner status

### Agreement Management
- `GET /api/agreements` - List agreements
- `POST /api/agreements` - Create agreement

### Rate Plans
- `GET /api/rate-plans` - List rate plans
- `POST /api/rate-plans` - Create rate plan

### TAP Processing
- `POST /api/tap/upload` - Upload TAP file

### Analytics
- `GET /api/analytics/dashboard/:partnerId` - Get dashboard data

### Invoices
- `GET /api/invoices` - List invoices

### Disputes
- `GET /api/disputes` - List disputes
- `POST /api/disputes` - Create dispute

### Fraud Detection
- `GET /api/fraud/anomalies` - List anomalies

## Data Models

All data models are defined according to PRD specifications:

### Core Entities
1. **Partner** - Partner information and contact details
2. **Agreement** - Interconnect/roaming agreements
3. **Service** - Service types and configurations
4. **RatePlan** - Pricing for services
5. **TAPRecord** - CDR records from TAP files
6. **TAPFile** - TAP file metadata
7. **Invoice** - Billing documents
8. **Dispute** - Dispute records
9. **Anomaly** - Fraud detection alerts
10. **RAEXForm** - Technical coordination data
11. **TestCall** - Test automation records

## Key Implementation Details

### Rating Engine Logic
The rating engine applies partner-specific rates based on:
- Service type (VOICE, SMS, DATA, MMS)
- Direction (INBOUND, OUTBOUND)
- Effective date ranges
- Rounding rules
- Minimum charges

### Fraud Detection Patterns
Six active detection patterns:
1. Traffic volume monitoring (>200% spike)
2. Premium rate destination detection
3. Velocity checking (multiple countries)
4. Success rate monitoring (<90%)
5. Call duration analysis (>3x normal)
6. Off-peak traffic analysis

### Mock Data
The application includes realistic mock data:
- 5 partners with different statuses
- 3 active agreements
- 6 rate plans
- 3 TAP files
- 3 invoices with line items
- 3 disputes in various states
- 3 anomalies with different severities

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Navigation

The application includes a top navigation bar with links to:
- **Home** - Platform overview and key metrics
- **Partners** - Partner management interface
- **Dashboard** - Analytics and traffic insights
- **Invoices** - Invoice management
- **Disputes** - Dispute tracking and resolution
- **Fraud Monitor** - Security and anomaly detection
- **Admin Portal** - Operator admin interface

## User Journeys Implemented

### Journey A: Partner Onboarding
1. View partners list with filters
2. Create new partner (status: PENDING)
3. Update partner status to ACTIVE
4. View partner dashboard

### Journey B: Usage Processing & Settlement
1. Upload TAP file (simulated)
2. Automatic parsing and rating
3. Generate invoice
4. View invoice details with line items

### Journey C: Dispute Resolution
1. View disputes list
2. Review dispute details
3. Update dispute status
4. Add resolution notes

### Journey E: Fraud & Security Monitoring
1. View anomalies dashboard
2. Filter by severity
3. Review detection metrics
4. Take action on alerts

## Features Highlighted

### Phase 1: Foundation ✓
- All 7 core entities implemented
- Partner CRUD operations
- Agreement management
- Rate plan configuration

### Phase 2: Interconnect/Roaming Core ✓
- TAP file upload interface
- Rating engine with multiple service types
- Reconciliation logic (from original implementation)

### Phase 3: Analytics & Assurance ✓
- Partner dashboard with traffic/revenue metrics
- Fraud detection with 6 active patterns
- SLA compliance tracking

### Phase 4: UX/Frontend ✓
- Partner portal view
- Operator admin portal
- Comprehensive navigation
- Responsive design with Tailwind CSS
- Modern UI with status badges and color coding

## Testing

The application includes comprehensive mock data for testing all features without a database:
- Test partner creation and status updates
- Test invoice generation workflow
- Test dispute creation and tracking
- Test fraud alert monitoring
- Test dashboard analytics

## Production Considerations

For production deployment, the following should be implemented:
1. **Database**: Replace mock data with PostgreSQL + MongoDB
2. **Authentication**: Implement JWT/OAuth 2.0
3. **File Storage**: Integrate S3/MinIO for TAP files
4. **Message Queue**: Add RabbitMQ/Redis for async processing
5. **TAP Parser**: Implement actual TAP3.12 ASN.1 decoder
6. **API Gateway**: Add Kong or Express Gateway
7. **Testing**: Add Jest/Mocha unit tests and Cypress E2E tests
8. **Security**: Add input validation, rate limiting, CORS
9. **Monitoring**: Add logging, metrics, and alerting
10. **Documentation**: Generate OpenAPI/Swagger docs

## Performance Metrics

Target metrics as per PRD:
- Partner onboarding: < 3 days
- TAP file processing: < 30 minutes (for files up to 1GB)
- Rating accuracy: 99.9%
- Invoice generation: < 24 hours after period end
- Dispute resolution: < 7 business days
- Fraud detection latency: < 5 minutes

## Support

For questions or issues, refer to:
- PRD_Part1_Foundation.md - Complete requirements
- PRD_Part2_API_Journeys.md - Additional specifications
- This README - Implementation guide

---

**Built with** ❤️ **according to PRD specifications**
