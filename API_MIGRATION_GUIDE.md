# API Migration Guide: Mock Data → Prisma

This guide shows you how to migrate your API routes from mock data to Prisma database operations.

## ✅ Already Migrated

- ✅ **Partners API** (`/api/partners`)
  - GET /api/partners - List with filtering & pagination
  - POST /api/partners - Create new partner
  - GET /api/partners/[id] - Get partner with agreement
  - PATCH /api/partners/[id] - Update partner
  - DELETE /api/partners/[id] - Delete partner
  - PATCH /api/partners/[id]/status - Update status

- ✅ **Fraud/Anomalies API** (`/api/fraud/anomalies`)
  - GET /api/fraud/anomalies - List with filtering

- ✅ **Agreements API** (`/api/agreements`)
  - GET /api/agreements - List with filtering
  - POST /api/agreements - Create new agreement

- ✅ **Rate Sheets API** (`/api/partners/[id]/rate-sheets`)
  - GET /api/partners/[id]/rate-sheets - List rate sheets with rates
  - POST /api/partners/[id]/rate-sheets - Create rate sheet with nested rates

- ✅ **TAP Files API** (`/api/tap`)
  - GET /api/tap - List TAP files with filtering
  - POST /api/tap/upload - Upload and process TAP file
  - GET /api/tap/[id] - Get TAP file details
  - GET /api/tap/[id]/records - Get TAP records for file

- ✅ **Invoices API** (`/api/invoices`)
  - GET /api/invoices - List invoices with filtering
  - POST /api/invoices/generate - Generate invoice from CDRs

- ✅ **Disputes API** (`/api/disputes`)
  - GET /api/disputes - List disputes with filtering
  - POST /api/disputes - Create new dispute

- ✅ **Analytics/Dashboard API** (`/api/analytics`)
  - GET /api/analytics/dashboard/[partnerId] - Dashboard with aggregations

- ✅ **Rating Engine API** (`/api/rating-engine`)
  - POST /api/rating-engine/rate - Rate single/multiple CDRs
  - POST /api/rating-engine/batch - Batch process CDRs

## 📋 Migration Pattern

### Step 1: Import Prisma Client

**Before:**
```typescript
import { mockPartners } from '@/lib/mock-data';
```

**After:**
```typescript
import prisma from '@/lib/db/prisma';
```

---

### Step 2: Replace Array Operations with Prisma Queries

#### GET (List with Filtering)

**Before:**
```typescript
let filteredPartners = [...mockPartners];

if (status) {
  filteredPartners = filteredPartners.filter((p) => p.status === status);
}
```

**After:**
```typescript
const where: any = {};
if (status) where.status = status;

const partners = await prisma.partner.findMany({
  where,
  orderBy: { createdAt: 'desc' },
});
```

#### GET with Pagination

**Before:**
```typescript
const startIndex = (page - 1) * limit;
const paginatedPartners = filteredPartners.slice(startIndex, limit);
```

**After:**
```typescript
const totalRecords = await prisma.partner.count({ where });

const partners = await prisma.partner.findMany({
  where,
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

#### GET by ID with Relations

**Before:**
```typescript
const partner = mockPartners.find((p) => p.partner_id === id);
const agreement = mockAgreements.find((a) => a.partner_id === id);
```

**After:**
```typescript
const partner = await prisma.partner.findUnique({
  where: { id },
  include: {
    agreements: {
      take: 1,
      orderBy: { createdAt: 'desc' },
    },
  },
});
```

#### POST (Create)

**Before:**
```typescript
const newPartner = {
  partner_id: generateId(),
  partner_code: body.partner_code,
  ...body,
  created_at: new Date().toISOString(),
};
mockPartners.push(newPartner);
```

**After:**
```typescript
const newPartner = await prisma.partner.create({
  data: {
    partnerCode: body.partner_code,
    partnerName: body.partner_name,
    partnerType: body.partner_type,
    // ... other fields
  },
});
```

#### PATCH (Update)

**Before:**
```typescript
const partnerIndex = mockPartners.findIndex((p) => p.partner_id === id);
mockPartners[partnerIndex] = {
  ...mockPartners[partnerIndex],
  ...body,
  updated_at: new Date().toISOString(),
};
```

**After:**
```typescript
const updateData: any = {};
if (body.partner_name) updateData.partnerName = body.partner_name;
// ... build update object

const updatedPartner = await prisma.partner.update({
  where: { id },
  data: updateData,
});
```

#### DELETE

**Before:**
```typescript
const partnerIndex = mockPartners.findIndex((p) => p.partner_id === id);
mockPartners.splice(partnerIndex, 1);
```

**After:**
```typescript
await prisma.partner.delete({ where: { id } });
```

---

### Step 3: Transform Database Fields to API Format

Prisma uses camelCase (partnerCode), but your API uses snake_case (partner_code).

**Transformation Pattern:**
```typescript
const formattedPartners = partners.map((p) => ({
  partner_id: p.id,
  partner_code: p.partnerCode,
  partner_name: p.partnerName,
  partner_type: p.partnerType,
  country_code: p.countryCode,
  status: p.status,
  contact_email: p.contactEmail,
  contact_phone: p.contactPhone,
  created_at: p.createdAt.toISOString(),
  updated_at: p.updatedAt.toISOString(),
}));
```

---

### Step 4: Add Error Handling

**Before:**
```typescript
catch (error) {
  return NextResponse.json(
    { error: 'Failed to fetch partners' },
    { status: 500 }
  );
}
```

**After:**
```typescript
catch (error: any) {
  console.error('Error fetching partners:', error);

  // Handle specific Prisma errors
  if (error.code === 'P2002') {
    return NextResponse.json(
      { error: 'Unique constraint violation' },
      { status: 409 }
    );
  }

  if (error.code === 'P2025') {
    return NextResponse.json(
      { error: 'Record not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 🔗 Common Prisma Operations

### Include Related Data

```typescript
const partner = await prisma.partner.findUnique({
  where: { id },
  include: {
    agreements: true,
    rateSheets: {
      where: { isActive: true },
    },
    invoices: {
      orderBy: { invoiceDate: 'desc' },
      take: 10,
    },
  },
});
```

### Nested Writes (Create with Relations)

```typescript
const agreement = await prisma.agreement.create({
  data: {
    agreementName: 'My Agreement',
    partner: {
      connect: { id: partnerId },
    },
    ratePlans: {
      create: [
        {
          serviceType: 'VOICE',
          direction: 'INBOUND',
          ratePerUnit: 0.025,
          currency: 'USD',
        },
      ],
    },
  },
});
```

### Transactions

```typescript
const result = await prisma.$transaction(async (tx) => {
  // Update partner status
  const partner = await tx.partner.update({
    where: { id: partnerId },
    data: { status: 'ACTIVE' },
  });

  // Activate related agreements
  await tx.agreement.updateMany({
    where: { partnerId },
    data: { status: 'ACTIVE' },
  });

  return partner;
});
```

### Aggregations

```typescript
const stats = await prisma.invoice.aggregate({
  where: { partnerId },
  _sum: { totalAmount: true },
  _count: true,
  _avg: { totalAmount: true },
});
```

### Group By

```typescript
const revenueByPartner = await prisma.invoice.groupBy({
  by: ['partnerId'],
  _sum: { totalAmount: true },
  _count: true,
  where: {
    status: 'PAID',
    invoiceDate: {
      gte: startDate,
      lte: endDate,
    },
  },
});
```

---

## 🎉 All Routes Migrated!

All API routes have been successfully migrated from mock data to Prisma. The application now uses a PostgreSQL database with proper data persistence, relations, and type safety.

### Key Achievements

- **15 API route files** migrated to Prisma
- **Type-safe database queries** with auto-generated types
- **Proper error handling** with Prisma error codes
- **Complex relations** using `include` for nested data
- **Aggregations** for analytics and dashboard
- **Nested writes** for creating related records
- **Field transformations** between camelCase (DB) and snake_case (API)

---

## 🎯 Common Prisma Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| P2002 | Unique constraint violation | 409 Conflict |
| P2003 | Foreign key constraint violation | 400 Bad Request |
| P2025 | Record not found | 404 Not Found |
| P2014 | Relation violation | 400 Bad Request |
| P2015 | Related record not found | 400 Bad Request |

---

## 🚀 Testing Migrations

After migrating each route, test with:

```bash
# Test GET endpoint
curl http://localhost:3000/api/partners

# Test GET with filters
curl "http://localhost:3000/api/partners?status=ACTIVE&page=1&limit=10"

# Test POST endpoint
curl -X POST http://localhost:3000/api/partners \
  -H "Content-Type: application/json" \
  -d '{
    "partner_code": "TEST01",
    "partner_name": "Test Partner",
    "partner_type": "RECIPROCAL",
    "country_code": "USA",
    "contact_email": "test@example.com"
  }'

# Test PATCH endpoint
curl -X PATCH http://localhost:3000/api/partners/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'

# Test DELETE endpoint
curl -X DELETE http://localhost:3000/api/partners/{id}
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- Database Schema: `prisma/schema.prisma`
- Prisma Studio: `npm run db:studio` (http://localhost:5555)

---

## ✅ Migration Checklist

For each API route file:

- [ ] Replace mock data imports with Prisma client
- [ ] Convert filter logic to Prisma `where` clauses
- [ ] Add pagination with `skip` and `take`
- [ ] Use `include` for relations instead of manual joins
- [ ] Transform database field names (camelCase → snake_case)
- [ ] Add proper error handling with Prisma error codes
- [ ] Add validation for required fields
- [ ] Test all endpoints (GET, POST, PATCH, DELETE)
- [ ] Update TypeScript types if needed
- [ ] Remove unused mock data imports

---

## 🎉 Benefits of Prisma

✅ **Type Safety** - Auto-generated types prevent errors
✅ **Auto-complete** - IDE suggestions for all queries
✅ **Data Validation** - Schema-level constraints
✅ **Relations** - Easy joins with `include`
✅ **Transactions** - ACID guarantees
✅ **Migrations** - Version-controlled schema changes
✅ **Performance** - Optimized queries
✅ **No SQL Injection** - Parameterized queries

---

Happy migrating! 🚀
