# Quick Start Guide

Fast-track guide to get RideOn running in 10 minutes.

---

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check npm version (need 9+)
npm --version

# Check if PostgreSQL is installed
psql --version

# Check if Redis is installed
redis-cli --version
```

**Don't have them?** See [SETUP.md](docs/SETUP.md) for installation instructions.

---

## 1. Database Setup (2 minutes)

```bash
# Start PostgreSQL (macOS)
brew services start postgresql@14

# Start Redis (macOS)
brew services start redis

# Create database
psql -U postgres -c "CREATE DATABASE rideon_db;"
psql -U postgres -d rideon_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Linux users: use sudo systemctl start postgresql redis-server
```

---

## 2. Install Dependencies (3 minutes)

```bash
# Navigate to project
cd ~/Desktop/projects/rideon

# Install root dependencies
npm install

# Install backend dependencies
cd apps/backend && npm install && cd ../..

# Install web app dependencies (optional for now)
cd apps/web && npm install && cd ../..

# Install admin dependencies (optional for now)
cd apps/admin && npm install && cd ../..
```

---

## 3. Configure Backend (1 minute)

```bash
cd apps/backend

# Copy environment file
cp .env.example .env

# Edit .env with minimal config:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=rideon_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=change_this_to_a_random_32_character_string
# REFRESH_TOKEN_SECRET=change_this_to_another_random_string
```

**Quick way to generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Run Migrations (1 minute)

```bash
# Still in apps/backend
npx sequelize-cli db:migrate

# Seed initial data (optional)
npx sequelize-cli db:seed:all
```

---

## 5. Start Backend (30 seconds)

```bash
# In apps/backend
npm run dev

# You should see:
# Server is running on port 3001
# Database connection established successfully
```

**Test it:**
```bash
# In a new terminal
curl http://localhost:3001/health

# Should return: {"status":"ok","timestamp":"..."}
```

---

## 6. Test API (2 minutes)

### Create a Rider Account:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "rider"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@test.com",
    "password": "password123"
  }'
```

**Save the `accessToken` from the response!**

### Test Fare Estimation:
```bash
curl -X POST http://localhost:3001/api/rider/trips/estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "pickupLocation": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "dropoffLocation": {
      "lat": 40.7580,
      "lng": -73.9855
    }
  }'
```

---

## 7. Start Web App (Optional - 1 minute)

```bash
# In a new terminal
cd apps/web

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Start dev server
npm run dev

# Visit http://localhost:3000
```

---

## 🎉 You're Done!

### What's Running:
- ✅ Backend API: http://localhost:3001
- ✅ PostgreSQL database with PostGIS
- ✅ Redis cache
- ✅ Socket.IO for real-time updates
- ✅ (Optional) Web app: http://localhost:3000

---

## Common Issues & Fixes

### Database Connection Failed
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Start it if not running
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
```

### Port 3001 Already in Use
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9  # macOS/Linux

# Or change port in .env
PORT=3002
```

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping

# Start it if not running
brew services start redis          # macOS
sudo systemctl start redis-server  # Linux
```

### PostGIS Extension Not Found
```bash
# Install PostGIS
brew install postgis  # macOS
sudo apt install postgis  # Ubuntu/Debian

# Enable in database
psql -U postgres -d rideon_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

---

## Next Steps

### 1. Create More Test Data

**Create a Driver:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "password123",
    "firstName": "Mike",
    "lastName": "Smith",
    "role": "driver",
    "phoneNumber": "+1234567890"
  }'
```

**Create an Admin:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### 2. Explore the API

Use Postman or Insomnia to test all endpoints. Import this collection structure:

```
RideOn API
├── Auth
│   ├── Register
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── Rider
│   ├── Get Profile
│   ├── Estimate Fare
│   ├── Request Trip
│   └── Get Trip History
├── Driver
│   ├── Get Profile
│   ├── Update Location
│   ├── Accept Trip
│   └── Complete Trip
└── Admin
    ├── Dashboard
    ├── List Users
    └── List Trips
```

### 3. Read the Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md)
- [Database Schema](docs/DATABASE.md)

### 4. Start Building

Follow the [Roadmap](docs/ROADMAP.md) to implement features systematically.

---

## Development Commands

```bash
# Start all services
npm run dev  # from root

# Start individual services
cd apps/backend && npm run dev
cd apps/admin && npm run dev
cd apps/web && npm run dev

# Database commands
cd apps/backend
npx sequelize-cli db:migrate        # Run migrations
npx sequelize-cli db:migrate:undo   # Undo last migration
npx sequelize-cli db:seed:all       # Seed data

# View logs
tail -f apps/backend/logs/combined.log

# Access database
psql -U postgres -d rideon_db

# Clear Redis cache
redis-cli FLUSHALL

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

---

## Quick Database Queries

```bash
# Access PostgreSQL
psql -U postgres -d rideon_db

# Useful queries
SELECT * FROM users;
SELECT * FROM trips;
SELECT * FROM drivers WHERE is_online = true;

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM trips WHERE status = 'completed';

# View recent trips
SELECT * FROM trips ORDER BY created_at DESC LIMIT 10;

# Exit psql
\q
```

---

## Need Help?

1. **Check the docs**: All documentation is in the `docs/` folder
2. **Review examples**: See `IMPLEMENTATION_GUIDE.md` for code examples
3. **Common errors**: Check `SETUP.md` troubleshooting section
4. **API reference**: See `API.md` for all endpoints

---

## Project Structure Quick Reference

```
rideon/
├── apps/
│   ├── backend/         # Express API (start here)
│   ├── admin/           # Admin dashboard
│   ├── web/             # Rider web app
│   ├── rider-app/       # Rider mobile app
│   └── driver-app/      # Driver mobile app
├── docs/                # All documentation
├── packages/            # Shared code
└── scripts/             # Utility scripts
```

---

## Tips for Development

1. **Start with backend**: Get the API working first
2. **Use Postman**: Test endpoints before building UI
3. **Check logs**: Backend logs are very helpful
4. **Read examples**: Implementation guide has full code
5. **Follow roadmap**: Build features in phases
6. **Test frequently**: Don't build too much without testing
7. **Git commits**: Commit often with clear messages

---

## Production Checklist (For Later)

Before deploying to production:

- [ ] Change all default secrets and passwords
- [ ] Set up SSL/TLS certificates
- [ ] Configure production database
- [ ] Set up Redis cluster
- [ ] Configure file storage (S3)
- [ ] Set up payment gateway (Stripe)
- [ ] Configure email service
- [ ] Set up SMS provider (Twilio)
- [ ] Enable monitoring and logging
- [ ] Set up backups
- [ ] Configure CI/CD pipeline
- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization

---

## Useful Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **PostGIS Docs**: https://postgis.net/docs/
- **Sequelize Docs**: https://sequelize.org/docs/v6/
- **Express Docs**: https://expressjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **React Native Docs**: https://reactnative.dev/docs
- **Socket.IO Docs**: https://socket.io/docs/v4/
- **LeafletJS Docs**: https://leafletjs.com/reference.html

---

**Happy Coding! 🚀**

For detailed instructions, see [SETUP.md](docs/SETUP.md)

For architecture details, see [ARCHITECTURE.md](docs/ARCHITECTURE.md)

For implementation examples, see [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)
