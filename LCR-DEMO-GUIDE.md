# LCR (Least Cost Routing) - Demo Guide

## Overview
The LCR feature helps you find the most cost-effective carrier route for any destination code, considering both pricing and quality metrics.

## What's Implemented

### ✅ Features
- **Route Calculator**: Find the best carrier route by entering a destination code
- **Pricelist Management**: View all active carrier pricelists
- **CSV Import**: Upload carrier pricing data via CSV files
- **Quality Scoring**: Algorithm considers ASR (Answer Seizure Ratio) and carrier status
- **Alternative Routes**: Shows up to 5 alternative routes ranked by cost and quality

### ✅ API Endpoints
- `GET /api/lcr/pricelists` - List all pricelists
- `POST /api/lcr/pricelists/import` - Import pricelist from CSV
- `PATCH /api/lcr/pricelists` - Update pricelist status
- `POST /api/lcr/routing/calculate` - Calculate best route

## Demo Data

### Sample Carriers Created
1. **Global Carrier A** (CARRA) - Best pricing for US destinations
2. **TelecomHub Carrier B** (CARRB) - Best pricing for European destinations
3. **Asia-Pacific Carrier C** (CARRC) - Best pricing for Asian destinations

### Sample Routes (33 total)
- **North America**: USA, Canada (various city codes)
- **Europe**: UK, France, Germany, Spain, Italy
- **Middle East**: UAE, Saudi Arabia
- **Asia**: India, China, Singapore, Malaysia, Japan, South Korea
- **Other**: Australia, South Africa, Brazil, Mexico

## How to Demo

### 1. View Active Pricelists
- Navigate to `/lcr`
- You'll see 3 active pricelists with carrier information
- Each pricelist shows effective dates, expiry dates, and rate counts

### 2. Test Route Calculation

Try these destination codes to see different carriers recommended:

#### Best for US (Carrier A wins):
```
Destination: 1
Expected: Global Carrier A at $0.0089/min
```

#### Best for UK (Carrier B wins):
```
Destination: 44
Expected: TelecomHub Carrier B at $0.0095/min
```

#### Best for Singapore (Carrier C wins):
```
Destination: 65
Expected: Asia-Pacific Carrier C at $0.0195/min
```

#### Best for India (Carrier C wins):
```
Destination: 91
Expected: Asia-Pacific Carrier C at $0.0180/min
```

#### Best for UAE (Carrier C wins):
```
Destination: 971
Expected: Asia-Pacific Carrier C at $0.0240/min
```

### 3. Import New Pricelist

1. Navigate to `/lcr/import`
2. Select a carrier from the dropdown
3. Set effective date (e.g., today's date)
4. Upload the sample CSV: `/sample-data/sample-lcr-pricelist.csv`
5. Review the parsed data preview
6. Click "Import Pricelist"

### 4. Understanding the Algorithm

The LCR algorithm:
1. **Finds matching routes** by destination code prefix
2. **Filters** by active pricelists and effective dates
3. **Calculates quality score** based on:
   - ASR percentage (higher is better)
   - Carrier status (active carriers get bonus)
4. **Sorts routes** by:
   - Lowest cost first
   - Highest quality second (for same cost)
5. **Returns** recommended route + 4 alternatives

## Files Structure

```
app/lcr/
  ├── page.tsx              # Main LCR page
  └── import/
      └── page.tsx          # Import pricelist page

app/api/lcr/
  ├── pricelists/
  │   ├── route.ts          # GET/PATCH pricelists
  │   └── import/
  │       └── route.ts      # POST import
  └── routing/
      └── calculate/
          └── route.ts      # POST calculate route

sample-data/
  └── sample-lcr-pricelist.csv  # Sample CSV template

create-sample-lcr-data.ts       # Seed script
```

## CSV Format

Required columns:
- `destination_code` - E.g., "1", "44", "971"
- `destination_name` - E.g., "USA & Canada"
- `rate_per_minute` - Decimal rate (e.g., 0.0089)

Optional columns:
- `billing_increment` - "PER_SECOND" or "PER_MINUTE"
- `asr_percentage` - Answer Seizure Ratio (0-100)
- `acd_seconds` - Average Call Duration in seconds

## Demo Script

### Quick 2-Minute Demo:
1. Open `/lcr`
2. Show 3 carrier pricelists
3. Type "1" in route calculator → Shows Carrier A as cheapest
4. Type "44" → Shows Carrier B as cheapest
5. Type "65" → Shows Carrier C as cheapest
6. Explain: "The algorithm automatically picks the lowest cost carrier for each destination"

### Full 5-Minute Demo:
1. Show main LCR page with active pricelists
2. Demonstrate route calculator with multiple destinations
3. Point out quality metrics (ASR %, ACD)
4. Show alternative routes for same destination
5. Navigate to import page
6. Upload sample CSV and show preview
7. Import new pricelist
8. Return to main page to verify import

## Next Steps for Production

To make this production-ready:
1. Add pricelist activation workflow
2. Add rate validation rules
3. Add historical route analysis
4. Add cost vs quality trade-off controls
5. Add rate change notifications
6. Add bulk pricelist comparison
7. Add route simulation for call volume

## Technical Notes

- Uses Prisma ORM with PostgreSQL
- Supports longest prefix matching for route selection
- Handles time-based pricelist activation
- Supports multiple billing increments (per-second, per-minute)
- Quality score algorithm can be customized
