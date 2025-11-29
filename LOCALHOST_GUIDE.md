# 🎉 RideOn is Running on Localhost!

## ✅ What's Currently Running

**Server URL:** http://localhost:3001

**Status:** 🟢 ONLINE

**Mode:** Demo (no database required)

---

## 🌐 Access the API

### Browser
Open this URL in your browser:
**[http://localhost:3001](http://localhost:3001)**

You'll see a beautiful welcome page with:
- Server status
- All available endpoints
- Example requests
- Testing instructions

### API Endpoints Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/rider/trips/estimate` | Estimate trip fare |
| POST | `/api/rider/trips` | Create a trip |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/trips` | List all trips |

---

## 🧪 Quick Test

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

**Result:**
```json
{
  "status": "ok",
  "message": "RideOn Demo API is running!",
  "timestamp": "2025-11-28T...",
  "uptime": 123.45
}
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","firstName":"John","lastName":"Doe","role":"rider"}'
```

**Result:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "rider"
    },
    "accessToken": "demo_token_1_..."
  },
  "message": "✅ User registered successfully!"
}
```

### Test 3: Estimate Fare (New York to Times Square)
```bash
curl -X POST http://localhost:3001/api/rider/trips/estimate \
  -H "Content-Type: application/json" \
  -d '{"pickupLocation":{"lat":40.7128,"lng":-74.0060},"dropoffLocation":{"lat":40.7580,"lng":-73.9855}}'
```

**Result:**
```json
{
  "success": true,
  "data": {
    "estimatedFare": 18.50,
    "breakdown": {
      "baseFare": 2.50,
      "bookingFee": 1.00,
      "distanceFare": 10.50,
      "timeFare": 4.50
    },
    "distance": 7.0,
    "estimatedDuration": 14,
    "surgeMultiplier": 1.0,
    "currency": "USD"
  }
}
```

---

## 📱 Test with Browser Console

1. Open http://localhost:3001
2. Press `F12` (or `Cmd+Option+I` on Mac)
3. Go to Console tab
4. Paste this code:

```javascript
// Test the fare estimation
fetch('http://localhost:3001/api/rider/trips/estimate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pickupLocation: { lat: 40.7128, lng: -74.0060 },
    dropoffLocation: { lat: 40.7580, lng: -73.9855 }
  })
})
.then(res => res.json())
.then(data => {
  console.log('Fare Estimate:', data);
  console.log('Total Fare: $' + data.data.estimatedFare);
  console.log('Distance: ' + data.data.distance + ' km');
});
```

---

## 🎯 What You Can Do

### 1. Test the API
- Register users (riders, drivers, admins)
- Login users
- Estimate trip fares
- Create trips
- View all users and trips

### 2. Understand the System
- See how fare calculation works
- Test different pickup/dropoff locations
- Try registering multiple users
- Check the JSON responses

### 3. Use as Reference
- Study the code in `apps/backend/src/index-demo.js`
- See how Express routes work
- Understand the data structure
- Learn the API patterns

---

## 🔧 Server Commands

### Check if Server is Running
```bash
curl http://localhost:3001/health
```

### View Server Logs
The server is running in the background. To see logs, check the terminal where you started it.

### Stop the Server
```bash
lsof -ti:3001 | xargs kill -9
```

### Restart the Server
```bash
cd ~/Desktop/projects/rideon/apps/backend
npm run demo
```

---

## 📊 Demo Mode Features

### ✅ What Works
- All API endpoints
- User registration and login
- Fare calculation (using Haversine formula)
- Trip creation
- Data storage (in memory)
- JSON responses
- Error handling

### ⚠️ Limitations
- No database (data lost on restart)
- No real authentication (tokens are fake)
- No driver matching
- No real-time Socket.IO
- No payment processing
- Data stored in memory only

---

## 🚀 Next Steps

### Level 1: Explore the Demo
✅ You are here! The demo is running.
- Test all endpoints
- Try different scenarios
- Read the responses

### Level 2: Install Full Database
📚 Follow [docs/SETUP.md](docs/SETUP.md)
- Install PostgreSQL + PostGIS
- Install Redis
- Run migrations
- Use full backend with `npm run dev`

### Level 3: Add Features
📖 Follow [docs/ROADMAP.md](docs/ROADMAP.md)
- Implement real authentication
- Add Socket.IO for real-time
- Build the web frontend
- Create mobile apps

---

## 📚 Documentation Quick Links

| Document | What's Inside |
|----------|---------------|
| [TEST_API.md](TEST_API.md) | API testing guide |
| [QUICK_START.md](QUICK_START.md) | 10-minute setup |
| [docs/API.md](docs/API.md) | Complete API reference |
| [docs/SETUP.md](docs/SETUP.md) | Full setup instructions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) | Code examples |
| [FEATURES.md](FEATURES.md) | 200+ features |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete overview |

---

## 💡 Try These Examples

### Example 1: Register 3 Different Users
```bash
# Register a rider
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"rider@test.com","password":"pass","firstName":"Jane","lastName":"Rider","role":"rider"}'

# Register a driver
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@test.com","password":"pass","firstName":"Mike","lastName":"Driver","role":"driver"}'

# Register an admin
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass","firstName":"Admin","lastName":"User","role":"admin"}'

# List all users
curl http://localhost:3001/api/admin/users
```

### Example 2: Calculate Different Trip Fares
```bash
# Short trip (1 km)
curl -X POST http://localhost:3001/api/rider/trips/estimate \
  -H "Content-Type: application/json" \
  -d '{"pickupLocation":{"lat":40.7128,"lng":-74.0060},"dropoffLocation":{"lat":40.7200,"lng":-74.0070}}'

# Long trip (50 km)
curl -X POST http://localhost:3001/api/rider/trips/estimate \
  -H "Content-Type: application/json" \
  -d '{"pickupLocation":{"lat":40.7128,"lng":-74.0060},"dropoffLocation":{"lat":41.0000,"lng":-74.5000}}'
```

---

## 🎨 Visual Guide

```
┌─────────────────────────────────────────┐
│   🌐 Browser: localhost:3001            │
│   ┌───────────────────────────────┐     │
│   │  🚗 RideOn Demo API           │     │
│   │  ✅ Running                   │     │
│   │                               │     │
│   │  Available Endpoints:         │     │
│   │  • GET  /health               │     │
│   │  • POST /api/auth/register    │     │
│   │  • POST /api/auth/login       │     │
│   │  • POST /api/rider/trips/*    │     │
│   │  • GET  /api/admin/*          │     │
│   └───────────────────────────────┘     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   📡 API Testing                         │
│   ┌───────────────────────────────┐     │
│   │  curl localhost:3001/health   │     │
│   │  → {"status": "ok"}           │     │
│   │                               │     │
│   │  POST /api/auth/register      │     │
│   │  → User created with token    │     │
│   │                               │     │
│   │  POST /api/rider/trips/est..  │     │
│   │  → Fare: $18.50               │     │
│   └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

---

## 🎉 Success!

Your RideOn API is successfully running on localhost!

**What you have:**
- ✅ Working API server
- ✅ 7+ endpoints ready to test
- ✅ Complete documentation
- ✅ Example code
- ✅ Full project structure

**What's next:**
1. Test the endpoints (use the browser or curl)
2. Read the documentation
3. Install PostgreSQL for full features
4. Build the frontend
5. Create something amazing!

---

## 🆘 Need Help?

- **Can't access the server?** Make sure it's running: `curl http://localhost:3001/health`
- **Port already in use?** Kill the process: `lsof -ti:3001 | xargs kill -9`
- **Want full setup?** Read [docs/SETUP.md](docs/SETUP.md)
- **Have questions?** Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

**Happy coding! 🚀**
