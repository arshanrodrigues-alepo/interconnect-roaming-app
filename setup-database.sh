#!/bin/bash
# Database Setup Script for WSL with Peer Authentication

echo "Setting up PostgreSQL with peer authentication..."
echo ""

# Create database
echo "Creating database..."
sudo -u postgres createdb interconnect_roaming

# Create a PostgreSQL user matching your WSL username
echo "Creating PostgreSQL user 'arshan'..."
sudo -u postgres psql -c "CREATE USER arshan SUPERUSER;"

# Grant privileges
echo "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE interconnect_roaming TO arshan;"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Testing connection..."
psql -d interconnect_roaming -c "SELECT version();"

echo ""
echo "If the test was successful, your database is ready!"
echo ""
echo "Next steps:"
echo "  1. The .env file has been updated to use peer authentication"
echo "  2. Run: npm run db:push"
echo "  3. Run: npm run db:seed"
echo "  4. Run: npm run db:studio"
