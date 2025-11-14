# Database Setup for WSL/Windows

You're running in WSL (Windows Subsystem for Linux). Here are your options:

## Option 1: Use Docker Desktop (Recommended)

### 1. Install Docker Desktop for Windows
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. In Docker Desktop settings, enable "Use WSL 2 based engine"
4. Enable your WSL distribution in Docker Desktop settings

### 2. Verify Docker is Running
```bash
docker --version
docker ps
```

### 3. Start Database
```bash
cd /home/arshan/interconnect-roaming_app
docker-compose up -d
```

---

## Option 2: Use Existing PostgreSQL (Local Install)

If you have PostgreSQL installed on Windows or WSL:

### 1. Check PostgreSQL Service
```bash
# On Windows, PostgreSQL runs as a Windows service
# Access it from WSL using localhost:5432
```

### 2. Update .env File
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/interconnect_roaming?schema=public"
```

### 3. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE interconnect_roaming;
\q
```

### 4. Run Migrations
```bash
npm run db:push
npm run db:seed
```

---

## Option 3: Use Cloud PostgreSQL (Quick Testing)

For quick testing without local setup:

### Free Hosted Options:
1. **Neon.tech** (free tier)
   - https://neon.tech
   - Serverless PostgreSQL
   - Free tier: 3GB storage

2. **Supabase** (free tier)
   - https://supabase.com
   - PostgreSQL + additional features
   - Free tier: 500MB database

3. **ElephantSQL** (free tier)
   - https://www.elephantsql.com
   - Managed PostgreSQL
   - Free tier: 20MB

### Steps:
1. Create free account
2. Create new database
3. Copy connection string
4. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```
5. Run migrations:
```bash
npm run db:push
npm run db:seed
```

---

## Option 4: Install PostgreSQL in WSL

### 1. Install PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Start PostgreSQL
```bash
sudo service postgresql start
```

### 3. Set Password for postgres User
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'password';
CREATE DATABASE interconnect_roaming;
\q
```

### 4. Update .env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/interconnect_roaming?schema=public"
```

### 5. Run Migrations
```bash
npm run db:push
npm run db:seed
```

---

## Troubleshooting WSL + Docker

### Issue: "Cannot connect to Docker daemon"

**Solution 1: Start Docker Desktop**
- Open Docker Desktop on Windows
- Wait for it to fully start (whale icon in system tray)
- Retry `docker-compose up -d`

**Solution 2: Check WSL Integration**
- Open Docker Desktop
- Settings → Resources → WSL Integration
- Enable your WSL distribution (Ubuntu, etc.)
- Click "Apply & Restart"

### Issue: Port 5432 Already in Use

**Check what's using the port:**
```bash
# On Windows PowerShell
netstat -ano | findstr :5432

# On WSL
ss -tulpn | grep 5432
```

**Solutions:**
- Stop existing PostgreSQL service
- Change port in docker-compose.yml
- Use existing PostgreSQL instead of Docker

---

## Recommended Approach for WSL

**For Development:**
1. Use Docker Desktop with WSL integration (easiest)
2. OR install PostgreSQL directly in WSL

**For Quick Testing:**
- Use Neon.tech or Supabase free tier

**For Production:**
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)

---

## Next Steps After Database is Running

Once PostgreSQL is accessible:

```bash
# 1. Verify connection
npm run db:push

# 2. Seed data
npm run db:seed

# 3. Open database GUI
npm run db:studio

# 4. Start your app
npm run dev
```

---

## Quick Test Without Database

If you want to test the application without setting up database yet:

1. The app still has mock data in `lib/mock-data/`
2. Just run: `npm run dev`
3. Application will work with in-memory mock data
4. Set up database when ready for production features

---

## Need Help?

Check current setup:
```bash
# Check Docker
docker --version
docker ps

# Check PostgreSQL
psql --version
psql -U postgres -h localhost -c "SELECT version();"

# Check if port is available
nc -zv localhost 5432
```

Choose the option that works best for your setup!
