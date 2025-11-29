# Setup Guide

Complete step-by-step guide to set up the RideOn platform on your local machine.

---

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14 or higher with PostGIS extension
- **Redis**: v6 or higher
- **Git**: Latest version

### For Mobile Development
- **React Native CLI**: `npm install -g react-native-cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Watchman** (recommended): `brew install watchman`

### Optional but Recommended
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **DBeaver** for database management
- **Redis Commander** for Redis management
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - JavaScript (ES6) code snippets
  - React Native Tools

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repo-url> rideon
cd rideon

# Or if you're starting from the project we created:
cd ~/Desktop/projects/rideon
```

---

## Step 2: Install PostgreSQL and PostGIS

### macOS (using Homebrew)
```bash
brew install postgresql@14
brew install postgis

# Start PostgreSQL
brew services start postgresql@14
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and follow the wizard
3. Install PostGIS via Application Stack Builder (included in PostgreSQL installer)

---

## Step 3: Set Up Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rideon_db;

# Connect to the database
\c rideon_db

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

# Create user (optional, for better security)
CREATE USER rideon_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rideon_db TO rideon_user;

# Exit psql
\q
```

---

## Step 4: Install Redis

### macOS (using Homebrew)
```bash
brew install redis

# Start Redis
brew services start redis

# Test Redis
redis-cli ping
# Should return: PONG
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test
redis-cli ping
```

### Windows
1. Download Redis from [redis.io](https://redis.io/download)
2. Extract and run redis-server.exe
3. Or use Windows Subsystem for Linux (WSL)

---

## Step 5: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd apps/backend
npm install
cd ../..

# Install admin app dependencies
cd apps/admin
npm install
cd ../..

# Install rider web app dependencies
cd apps/web
npm install
cd ../..

# Install shared packages
cd packages/shared
npm install
cd ../..
```

---

## Step 6: Configure Environment Variables

### Backend Environment Variables

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` and update the following:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rideon_db
DB_USER=postgres  # or rideon_user if you created one
DB_PASSWORD=your_password

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_minimum_32_characters

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# For local development, you can use placeholder values for:
# - AWS credentials
# - Stripe keys (use test keys from stripe.com)
# - Twilio credentials
# - SMTP settings
```

### Web Apps Environment Variables

```bash
# Admin app
cd apps/admin
cp .env.local.example .env.local

# Edit and set:
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Rider web app
cd ../web
cp .env.local.example .env.local

# Edit and set:
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## Step 7: Run Database Migrations

```bash
cd apps/backend

# Install Sequelize CLI globally (if not already installed)
npm install -g sequelize-cli

# Run migrations
npx sequelize-cli db:migrate

# Run seeders (optional, adds sample data)
npx sequelize-cli db:seed:all
```

---

## Step 8: Start Development Servers

### Option 1: Start All Services Together

```bash
# From root directory
npm run dev
```

This will start:
- Backend API (port 3001)
- Admin web app (port 3002)
- Rider web app (port 3000)

### Option 2: Start Services Individually

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Admin App
cd apps/admin
npm run dev

# Terminal 3: Rider Web App
cd apps/web
npm run dev
```

---

## Step 9: Verify Installation

### Backend API
```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Web Apps
- Admin: [http://localhost:3002](http://localhost:3002)
- Rider Web: [http://localhost:3000](http://localhost:3000)

### Create Admin User (if not seeded)

```bash
# Connect to database
psql -U postgres -d rideon_db

# Insert admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES (
  'admin@rideon.com',
  '$2b$10$YmF2ZjJiJDEwJGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo',
  'Admin',
  'User',
  'admin',
  true,
  true
);
```

Or use the API:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rideon.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

---

## Step 10: Set Up Mobile Apps (Optional)

### Rider App

```bash
cd apps/rider-app

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios
pod install
cd ..

# Run on iOS
npm run ios

# Run on Android (make sure Android emulator is running)
npm run android
```

### Driver App

```bash
cd apps/driver-app

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios
pod install
cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Configure API URL in Mobile Apps

Edit the API base URL in mobile app config:

```javascript
// apps/rider-app/src/services/api.js
// For iOS simulator
const API_BASE_URL = 'http://localhost:3001/api';

// For Android emulator
const API_BASE_URL = 'http://10.0.2.2:3001/api';

// For physical device (use your computer's IP)
const API_BASE_URL = 'http://192.168.1.x:3001/api';
```

---

## Step 11: Test the Complete Flow

### 1. Register as Rider
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "rider"
  }'
```

### 2. Register as Driver
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123",
    "firstName": "Mike",
    "lastName": "Smith",
    "role": "driver",
    "phoneNumber": "+1234567890"
  }'
```

### 3. Login and Get Tokens
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@example.com",
    "password": "password123"
  }'
```

### 4. Test Fare Estimation
```bash
curl -X POST http://localhost:3001/api/rider/trips/estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "pickupLocation": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "New York, NY"
    },
    "dropoffLocation": {
      "lat": 40.7580,
      "lng": -73.9855,
      "address": "Times Square, NY"
    }
  }'
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
ps aux | grep postgres  # macOS/Linux
# or
sudo systemctl status postgresql  # Linux

# Check PostgreSQL logs
tail -f /usr/local/var/log/postgres.log  # macOS
tail -f /var/log/postgresql/postgresql-14-main.log  # Linux
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# If not running, start it
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Port Already in Use

```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9  # macOS/Linux

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### PostGIS Extension Issues

```bash
# If PostGIS not installed
psql -U postgres -d rideon_db
CREATE EXTENSION IF NOT EXISTS postgis;

# Verify
SELECT PostGIS_version();
```

### Node Module Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache if issues persist
npm cache clean --force
```

### Mobile App Build Issues

#### iOS
```bash
# Clear build cache
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

#### Android
```bash
# Clear build cache
cd android
./gradlew clean
cd ..

# If still issues, delete build folder
rm -rf android/build
rm -rf android/app/build
```

---

## Development Workflow

### Backend Development

1. Make changes to code
2. Server auto-restarts (nodemon)
3. Test with Postman/curl
4. Check logs in terminal

### Web App Development

1. Make changes to code
2. Browser auto-refreshes
3. Check browser console for errors
4. Use React DevTools for debugging

### Mobile App Development

1. Make changes to code
2. Fast refresh updates (most changes)
3. For native changes, rebuild app
4. Use React Native Debugger

---

## Useful Commands

```bash
# View database tables
psql -U postgres -d rideon_db -c "\dt"

# View all users
psql -U postgres -d rideon_db -c "SELECT * FROM users;"

# Clear Redis cache
redis-cli FLUSHALL

# View API logs
cd apps/backend
tail -f logs/combined.log

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## Next Steps

After successful setup:

1. ✅ Read the [API Documentation](API.md)
2. ✅ Review the [Architecture](ARCHITECTURE.md)
3. ✅ Check the [Implementation Guide](IMPLEMENTATION_GUIDE.md)
4. ✅ Follow the [Roadmap](ROADMAP.md)
5. ✅ Start building features!

---

## Getting Help

- Check the documentation in the `docs/` folder
- Review example code in `IMPLEMENTATION_GUIDE.md`
- Check GitHub issues for similar problems
- Consult Stack Overflow for common errors

---

## Production Deployment

For production deployment instructions, see:
- [docs/DEPLOYMENT.md](DEPLOYMENT.md) (to be created)

Key considerations:
- Use environment-specific configs
- Enable SSL/TLS
- Set up proper logging
- Configure monitoring
- Set up backups
- Use secrets management
- Enable CORS properly
- Set up CDN
- Configure auto-scaling
- Implement health checks

---

Happy coding! 🚀
