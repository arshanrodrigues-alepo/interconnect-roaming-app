# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Interconnect & Roaming Management Platform.

## Prerequisites

- Docker and Docker Compose installed (recommended), OR
- PostgreSQL 14+ installed locally

## Quick Start with Docker (Recommended)

### 1. Start PostgreSQL Database

```bash
# Start PostgreSQL and pgAdmin containers
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f postgres
```

The database will be available at:
- **PostgreSQL**: `localhost:5432`
- **pgAdmin** (Database UI): `http://localhost:5050`
  - Email: `admin@interconnect.local`
  - Password: `admin`

### 2. Run Database Migrations

```bash
# Generate Prisma Client (if not done already)
npx prisma generate

# Create and run initial migration
npx prisma migrate dev --name init

# Alternatively, push schema without migration (for development)
npx prisma db push
```

### 3. Seed Database with Sample Data

```bash
# Run the seed script
npx prisma db seed
```

### 4. Verify Database

```bash
# Open Prisma Studio to view data
npx prisma studio
```

## Manual PostgreSQL Setup

If you prefer to use an existing PostgreSQL installation:

### 1. Create Database

```sql
CREATE DATABASE interconnect_roaming;
```

### 2. Update Environment Variables

Edit `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/interconnect_roaming?schema=public"
```

### 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

## Database Schema Overview

The database includes the following main entities:

### Core Tables
- **users** - User accounts and authentication
- **partners** - Telecom partner organizations
- **agreements** - Commercial agreements between partners
- **rate_sheets** - Pricing structures
- **rates** - Individual rate entries

### TAP Processing
- **tap_files** - Uploaded TAP files
- **tap_records** - Individual CDR records from TAP files

### Billing
- **invoices** - Generated invoices
- **disputes** - Billing disputes

### Operations
- **anomalies** - Fraud detection alerts
- **test_calls** - Test automation results
- **raex_forms** - RAEX IR.21 technical forms
- **policy_documents** - Policy templates

## Useful Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# View database schema
npx prisma db pull
```

## Connecting to pgAdmin

1. Open http://localhost:5050
2. Login with credentials from docker-compose.yml
3. Add New Server:
   - **General Tab**:
     - Name: `Interconnect DB`
   - **Connection Tab**:
     - Host: `postgres` (container name)
     - Port: `5432`
     - Database: `interconnect_roaming`
     - Username: `postgres`
     - Password: `password`

## Troubleshooting

### Connection Refused

If you get connection errors:
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart containers
docker-compose restart

# Check logs
docker-compose logs postgres
```

### Port Already in Use

If port 5432 is already in use:
1. Stop existing PostgreSQL: `sudo service postgresql stop`
2. Or change port in docker-compose.yml

### Migration Errors

```bash
# Reset and recreate database
npx prisma migrate reset

# Push schema without migrations (dev only)
npx prisma db push
```

## Production Deployment

For production deployment:

1. **Use a managed PostgreSQL service** (AWS RDS, Google Cloud SQL, etc.)
2. **Update DATABASE_URL** in production environment
3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```
4. **DO NOT use `migrate dev` in production**

## Backup and Restore

### Backup Database

```bash
# Using Docker
docker exec interconnect_roaming_postgres pg_dump -U postgres interconnect_roaming > backup.sql

# Using local PostgreSQL
pg_dump -U postgres interconnect_roaming > backup.sql
```

### Restore Database

```bash
# Using Docker
docker exec -i interconnect_roaming_postgres psql -U postgres interconnect_roaming < backup.sql

# Using local PostgreSQL
psql -U postgres interconnect_roaming < backup.sql
```

## Environment Variables

Required environment variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/interconnect_roaming?schema=public"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Connection pooling (for production)
# DATABASE_URL_POOLED="postgresql://user:password@host:port/db?pgbouncer=true"
```

## Next Steps

After setting up the database:
1. Start the development server: `npm run dev`
2. Access the application: `http://localhost:3000`
3. Login with seeded credentials (see LOGIN_CREDENTIALS.md)
4. Explore Prisma Studio: `npx prisma studio`
