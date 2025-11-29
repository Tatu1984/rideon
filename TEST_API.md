# Test RideOn API - Quick Guide

## ✅ Server is Running!

Your RideOn Demo API is now live at: **http://localhost:3001**

## 🌐 Open in Browser

Click this link: [http://localhost:3001](http://localhost:3001)

You'll see a nice welcome page with all available endpoints!

---

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "RideOn Demo API is running!",
  "timestamp": "2025-11-28T...",
  "uptime": 123.45
}
```

---

### 2. Register a Rider
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

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "rider@test.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "rider"
    },
    "accessToken": "demo_token_1_1234567890"
  },
  "message": "✅ User registered successfully! (Demo mode - no real auth)"
}
```

---

### 3. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@test.com",
    "password": "password123"
  }'
```

---

### 4. Estimate Fare
```bash
curl -X POST http://localhost:3001/api/rider/trips/estimate \
  -H "Content-Type: application/json" \
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

**Expected Response:**
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
  },
  "message": "✅ Fare estimated! (Demo calculation)"
}
```

---

### 5. Create a Trip
```bash
curl -X POST http://localhost:3001/api/rider/trips \
  -H "Content-Type: application/json" \
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

### 6. List All Users (Admin)
```bash
curl http://localhost:3001/api/admin/users
```

---

### 7. List All Trips (Admin)
```bash
curl http://localhost:3001/api/admin/trips
```

---

## 🎨 Test in Browser

### Option 1: Use the Welcome Page
1. Open [http://localhost:3001](http://localhost:3001)
2. You'll see a nice interface with all endpoints listed

### Option 2: Test with Browser Console
1. Open [http://localhost:3001](http://localhost:3001)
2. Press F12 to open Developer Console
3. Run these JavaScript commands:

```javascript
// Register a user
fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'pass123',
    firstName: 'Test',
    lastName: 'User',
    role: 'rider'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Estimate fare
fetch('http://localhost:3001/api/rider/trips/estimate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pickupLocation: { lat: 40.7128, lng: -74.0060 },
    dropoffLocation: { lat: 40.7580, lng: -73.9855 }
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📝 Important Notes

### ⚠️ Demo Mode
- Running WITHOUT database (data in memory only)
- All data will be lost when you restart the server
- No real authentication (tokens are fake)
- No real driver matching
- Perfect for testing and understanding the API

### 🔧 For Full Setup
To run with PostgreSQL and all features:
1. Install PostgreSQL and Redis
2. Follow [docs/SETUP.md](docs/SETUP.md)
3. Run migrations
4. Use `npm run dev` instead of `npm run demo`

---

## 🛑 Stop the Server

```bash
lsof -ti:3001 | xargs kill -9
```

---

## 🚀 What's Next?

### 1. Explore the API
- Try all the endpoints listed above
- Check responses in your browser
- Use Postman for better testing

### 2. Read Documentation
- [API.md](docs/API.md) - Complete API reference
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [DATABASE.md](docs/DATABASE.md) - Database schema

### 3. Set Up Full Version
- Install PostgreSQL
- Install Redis
- Follow [SETUP.md](docs/SETUP.md)
- Run with real database

### 4. Build Features
- Follow [ROADMAP.md](docs/ROADMAP.md)
- Implement step by step
- Use [IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)

---

## 🎉 You're All Set!

The RideOn Demo API is running and ready to test. Enjoy exploring! 🚗
