# Database Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start PostgreSQL

```bash
# Start the database using Docker
docker-compose up -d

# Verify it's running
docker-compose ps
```

### Step 2: Create Database Schema

```bash
# Push schema to database (development)
npm run db:push

# OR create a migration (recommended for production)
npm run db:migrate
```

### Step 3: Seed Sample Data

```bash
# Populate database with sample data
npm run db:seed
```

## ✅ Verify Installation

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio
```

Visit http://localhost:5555 to view your data!

## 🔑 Login Credentials

All accounts use password: `password123`

**Admin Users:**
- `admin@interconnect.local` - Full system access
- `finance@interconnect.local` - Finance & billing
- `support@interconnect.local` - Support & disputes

**Partner Users:**
- `contact@verizon.com` - Verizon partner
- `contact@tmobile.uk` - T-Mobile partner
- `contact@docomo.jp` - Docomo partner

## 📊 What's Seeded?

- ✅ 5 Partner organizations
- ✅ 6 User accounts
- ✅ 3 Commercial agreements
- ✅ 3 Rate sheets with pricing
- ✅ 2 Sample TAP files
- ✅ 2 Sample invoices
- ✅ 1 Dispute case
- ✅ 2 Fraud anomalies
- ✅ Technical configurations

## 🛠️ Useful Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open database GUI
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset
```

## 📖 Full Documentation

For detailed setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## ❓ Troubleshooting

### Connection Refused

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Port Already in Use

```bash
# Stop existing PostgreSQL
sudo service postgresql stop

# Or change port in docker-compose.yml
```

### Schema Out of Sync

```bash
# Reset and recreate
npm run db:reset

# Or force push
npm run db:push --force-reset
```

## 🎯 Next Steps

1. Start the application: `npm run dev`
2. Visit http://localhost:3000
3. Login with any of the credentials above
4. Explore the platform!

For more information, see the [FEATURES.md](./FEATURES.md) documentation.
