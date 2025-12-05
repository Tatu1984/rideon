# RideOn API Documentation

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "rider" // or "driver"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt-token"
  }
}
```

### POST /auth/login
Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## Rider Endpoints

### GET /rider/profile
Get rider profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "averageRating": 4.5,
    "totalTrips": 25,
    "user": {...}
  }
}
```

### PUT /rider/profile
Update rider profile

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "profilePicture": "url"
}
```

### GET /rider/trips
Get rider trip history

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional): requested, completed, cancelled_by_rider, etc.

**Response:**
```json
{
  "success": true,
  "data": {
    "trips": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

### GET /rider/trips/:tripId
Get specific trip details

### GET /rider/statistics
Get rider statistics

### POST /rider/favorite-locations
Add favorite location

**Request Body:**
```json
{
  "type": "home", // or "work", "other"
  "address": "123 Main St",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "label": "Home"
}
```

### DELETE /rider/favorite-locations/:locationId
Remove favorite location

---

## Driver Endpoints

### GET /driver/profile
Get driver profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "licenseNumber": "DL123456",
    "status": "online",
    "isVerified": true,
    "totalTrips": 150,
    "totalEarnings": 5000.00,
    "averageRating": 4.8,
    "user": {...},
    "vehicles": [...],
    "documents": [...]
  }
}
```

### PUT /driver/profile
Update driver profile

### PUT /driver/status
Update driver status (online/offline/busy)

**Request Body:**
```json
{
  "status": "online" // or "offline", "busy"
}
```

### PUT /driver/location
Update driver location

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "heading": 90,
  "speed": 30
}
```

### GET /driver/trips
Get driver trip history

### GET /driver/earnings
Get driver earnings

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 5000.00,
    "tripCount": 150,
    "availableBalance": 500.00,
    "recentPayouts": [...]
  }
}
```

### GET /driver/statistics
Get driver statistics

### POST /driver/payouts
Request payout

**Request Body:**
```json
{
  "amount": 500.00
}
```

---

## Trip Endpoints

### POST /trips
Request a new trip (Rider only)

**Request Body:**
```json
{
  "pickupAddress": "123 Main St",
  "pickupLatitude": 40.7128,
  "pickupLongitude": -74.0060,
  "dropoffAddress": "456 Park Ave",
  "dropoffLatitude": 40.7580,
  "dropoffLongitude": -73.9855,
  "vehicleType": "economy",
  "paymentMethod": "card",
  "promoCode": "SAVE20",
  "riderNotes": "Please wait at entrance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "requested",
    "estimatedDistance": 5.2,
    "estimatedDuration": 15,
    "estimatedFare": 25.00,
    "totalFare": 20.00,
    "discount": 5.00
  }
}
```

### GET /trips/:tripId
Get trip details

### POST /trips/:tripId/accept
Accept trip (Driver only)

**Request Body:**
```json
{
  "vehicleId": "uuid"
}
```

### PUT /trips/:tripId/status
Update trip status (Driver only)

**Request Body:**
```json
{
  "status": "driver_arrived" // or "in_progress", "completed"
}
```

### POST /trips/:tripId/cancel
Cancel trip (Rider or Driver)

**Request Body:**
```json
{
  "reason": "Cancellation reason"
}
```

### POST /trips/:tripId/rate
Rate trip (Rider or Driver)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great ride!"
}
```

---

## Payment Endpoints

### POST /payments/intent
Create payment intent (Rider only)

**Request Body:**
```json
{
  "tripId": "uuid",
  "amount": 25.00,
  "paymentMethod": "card"
}
```

### POST /payments/confirm
Confirm payment (Rider only)

**Request Body:**
```json
{
  "tripId": "uuid",
  "paymentIntentId": "pi_123",
  "paymentMethod": "card"
}
```

### GET /payments/history
Get payment history (Rider only)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

### POST /payments/refund
Request refund (Rider only)

**Request Body:**
```json
{
  "paymentId": "uuid",
  "reason": "Trip was cancelled"
}
```

---

## Admin Endpoints

All admin endpoints require admin role.

### GET /admin/dashboard
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "riders": 800,
      "drivers": 200,
      "activeDrivers": 50
    },
    "trips": {
      "total": 5000,
      "active": 25,
      "completed": 4800
    },
    "revenue": {
      "total": 50000.00
    },
    "pending": {
      "verifications": 10,
      "tickets": 5
    }
  }
}
```

### GET /admin/users
Get all users with pagination

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (optional): admin, rider, driver
- `search` (optional): search term

### PUT /admin/users/:userId/toggle-status
Toggle user active status

### GET /admin/drivers/pending
Get pending driver verifications

### PUT /admin/drivers/:driverId/verify
Verify or reject driver

**Request Body:**
```json
{
  "action": "approve", // or "reject"
  "notes": "Verification notes"
}
```

### GET /admin/trips
Get all trips with filters

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional)
- `startDate` (optional)
- `endDate` (optional)

### POST /admin/promo-codes
Create promo code

**Request Body:**
```json
{
  "code": "SAVE20",
  "description": "20% off your ride",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscountAmount": 10.00,
  "minTripAmount": 15.00,
  "maxUsagePerUser": 3,
  "totalUsageLimit": 1000,
  "validFrom": "2024-01-01T00:00:00Z",
  "validTo": "2024-12-31T23:59:59Z"
}
```

### GET /admin/support-tickets
Get support tickets

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional): open, in_progress, resolved, closed

### PUT /admin/support-tickets/:ticketId
Update support ticket

**Request Body:**
```json
{
  "status": "resolved",
  "adminNotes": "Issue resolved"
}
```

---

## Geocoding Endpoints

### GET /geocoding/geocode
Geocode address to coordinates

**Query Parameters:**
- `address`: Address to geocode

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "address": "123 Main St, City, State",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "type": "building"
    }
  ]
}
```

### GET /geocoding/reverse
Reverse geocode coordinates to address

**Query Parameters:**
- `latitude`: Latitude
- `longitude`: Longitude

### GET /geocoding/route
Calculate route between two points

**Query Parameters:**
- `startLat`: Start latitude
- `startLng`: Start longitude
- `endLat`: End latitude
- `endLng`: End longitude

**Response:**
```json
{
  "success": true,
  "data": {
    "distance": 5200,
    "duration": 900,
    "geometry": {...},
    "legs": [...]
  }
}
```

### GET /geocoding/autocomplete
Get place autocomplete suggestions

**Query Parameters:**
- `query`: Search query
- `latitude` (optional): User's latitude
- `longitude` (optional): User's longitude

---

## WebSocket Events

Connect to WebSocket with authentication:
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client → Server

- `driver:location-update` - Driver sends location update
- `trip:join` - Join trip room for real-time updates
- `trip:leave` - Leave trip room
- `trip:accept` - Driver accepts trip
- `trip:status-update` - Update trip status
- `trip:message` - Send chat message
- `driver:status-change` - Driver changes status
- `trip:emergency` - Trigger emergency alert

#### Server → Client

- `driver:online` - Driver comes online
- `driver:offline` - Driver goes offline
- `driver:location-updated` - Driver location updated
- `trip:accepted` - Trip accepted by driver
- `trip:status-updated` - Trip status updated
- `trip:driver-location` - Driver's live location during trip
- `trip:message-received` - Chat message received
- `driver:status-changed` - Driver status changed
- `trip:emergency-alert` - Emergency alert triggered

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

### Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Invalid or expired token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

API endpoints are rate limited to:
- 100 requests per 15 minutes per IP for unauthenticated requests
- 1000 requests per 15 minutes per user for authenticated requests

---

## Environment Variables

Required environment variables:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=rideon_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```
