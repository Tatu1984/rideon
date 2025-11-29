# API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user (rider or driver).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "role": "rider" // or "driver"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "rider"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "role": "rider"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "accessToken": "..."
  }
}
```

### POST /auth/logout
Logout user and revoke refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Rider Endpoints

### GET /rider/profile
Get rider profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "email": "rider@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "homeAddress": "123 Main St, City",
    "workAddress": "456 Work Ave, City",
    "rating": 4.85,
    "totalTrips": 42,
    "preferredPaymentMethod": "card"
  }
}
```

### PUT /rider/profile
Update rider profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "homeAddress": "123 Main St",
  "homeLocation": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "preferredPaymentMethod": "card"
}
```

**Response:** (200 OK)

### POST /rider/trips/estimate
Get fare estimate for a trip.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "pickupLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main St, New York, NY"
  },
  "dropoffLocation": {
    "lat": 40.7580,
    "lng": -73.9855,
    "address": "Times Square, New York, NY"
  }
}
```

**Response:** (200 OK)
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
    "estimatedDuration": 15,
    "surgeMultiplier": 1.0,
    "currency": "USD"
  }
}
```

### POST /rider/trips
Request a new trip.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "pickupLocation": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "123 Main St, New York, NY"
  },
  "dropoffLocation": {
    "lat": 40.7580,
    "lng": -73.9855,
    "address": "Times Square, New York, NY"
  },
  "paymentMethod": "card",
  "promoCode": "FIRST10"
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "tripId": 123,
    "status": "requested",
    "estimatedFare": 18.50,
    "pickupLocation": {...},
    "dropoffLocation": {...},
    "requestedAt": "2025-01-15T10:30:00Z"
  }
}
```

### GET /rider/trips/:id
Get trip details.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 123,
    "status": "in_progress",
    "rider": {...},
    "driver": {
      "id": 45,
      "firstName": "Mike",
      "rating": 4.9,
      "vehicle": {
        "make": "Toyota",
        "model": "Camry",
        "color": "Silver",
        "plateNumber": "ABC123"
      }
    },
    "pickupLocation": {...},
    "dropoffLocation": {...},
    "currentLocation": {
      "lat": 40.7300,
      "lng": -74.0000
    },
    "estimatedArrival": "5 mins",
    "estimatedFare": 18.50,
    "requestedAt": "2025-01-15T10:30:00Z",
    "acceptedAt": "2025-01-15T10:31:00Z",
    "startedAt": "2025-01-15T10:35:00Z"
  }
}
```

### POST /rider/trips/:id/cancel
Cancel a trip.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Change of plans"
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "tripId": 123,
    "status": "cancelled",
    "cancellationFee": 3.00
  }
}
```

### GET /rider/trips
Get trip history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional: completed, cancelled)

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": 123,
        "status": "completed",
        "driver": {...},
        "pickupAddress": "123 Main St",
        "dropoffAddress": "Times Square",
        "finalFare": 18.50,
        "distance": 7.0,
        "duration": 18,
        "completedAt": "2025-01-15T11:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

### POST /rider/trips/:id/rating
Rate a completed trip.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "rating": 5,
  "review": "Great driver, smooth ride!",
  "tags": ["clean car", "polite", "safe driving"]
}
```

**Response:** (201 Created)
```json
{
  "success": true,
  "message": "Rating submitted successfully"
}
```

---

## Driver Endpoints

### GET /driver/profile
Get driver profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 45,
    "userId": 100,
    "email": "driver@example.com",
    "firstName": "Mike",
    "lastName": "Smith",
    "phoneNumber": "+1234567890",
    "licenseNumber": "D1234567",
    "status": "approved",
    "isVerified": true,
    "isOnline": false,
    "rating": 4.9,
    "totalTrips": 523,
    "acceptanceRate": 92.5,
    "cancellationRate": 2.1,
    "totalEarnings": 15840.50,
    "vehicle": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "Silver",
      "plateNumber": "ABC123"
    }
  }
}
```

### PUT /driver/profile
Update driver profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Mike",
  "lastName": "Smith",
  "bankAccountNumber": "1234567890",
  "bankRoutingNumber": "021000021"
}
```

**Response:** (200 OK)

### POST /driver/documents
Upload driver documents.

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `documentType`: license | registration | insurance | photo
- `file`: File
- `expiryDate`: YYYY-MM-DD (optional)

**Response:** (201 Created)
```json
{
  "success": true,
  "data": {
    "documentId": 10,
    "documentType": "license",
    "fileUrl": "https://s3.amazonaws.com/...",
    "status": "pending"
  }
}
```

### GET /driver/documents
Get all driver documents.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "documentType": "license",
      "fileUrl": "https://...",
      "status": "approved",
      "verifiedAt": "2025-01-10T10:00:00Z"
    }
  ]
}
```

### POST /driver/vehicle
Add/update vehicle information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Silver",
  "plateNumber": "ABC123",
  "vehicleType": "standard",
  "seats": 4,
  "insurancePolicyNumber": "INS123",
  "insuranceExpiry": "2026-12-31"
}
```

**Response:** (201 Created)

### PUT /driver/status
Toggle driver online/offline status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isOnline": true
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "isOnline": true
  }
}
```

### POST /driver/location
Update driver's current location.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "heading": 45,
  "speed": 30,
  "accuracy": 10
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Location updated"
}
```

### POST /driver/trips/:id/accept
Accept a trip request.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "tripId": 123,
    "status": "accepted",
    "rider": {
      "firstName": "John",
      "rating": 4.85,
      "phoneNumber": "+1***7890"
    },
    "pickupLocation": {...}
  }
}
```

### POST /driver/trips/:id/decline
Decline a trip request.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Too far"
}
```

**Response:** (200 OK)

### POST /driver/trips/:id/arrived
Mark driver as arrived at pickup location.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)

### POST /driver/trips/:id/start
Start a trip.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "tripId": 123,
    "status": "in_progress",
    "startedAt": "2025-01-15T10:35:00Z"
  }
}
```

### POST /driver/trips/:id/complete
Complete a trip.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "endLocation": {
    "lat": 40.7580,
    "lng": -73.9855
  },
  "actualDistance": 7.2,
  "actualDuration": 18
}
```

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "tripId": 123,
    "status": "completed",
    "finalFare": 19.20,
    "driverEarnings": 15.36,
    "completedAt": "2025-01-15T10:53:00Z"
  }
}
```

### GET /driver/earnings
Get earnings summary.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: daily | weekly | monthly
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "totalEarnings": 845.50,
    "platformCommission": 169.10,
    "netEarnings": 676.40,
    "totalTrips": 32,
    "averagePerTrip": 26.42,
    "breakdown": [
      {
        "date": "2025-01-15",
        "trips": 8,
        "earnings": 212.50
      }
    ]
  }
}
```

---

## Trip Endpoints (Common)

### GET /trips/:id
Get trip details (accessible by rider, driver, and admin).

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)

### GET /trips/:id/receipt
Get trip receipt.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "tripId": 123,
    "date": "2025-01-15",
    "rider": "John D.",
    "driver": "Mike S.",
    "pickupAddress": "123 Main St",
    "dropoffAddress": "Times Square",
    "distance": 7.2,
    "duration": 18,
    "fareBreakdown": {
      "baseFare": 2.50,
      "bookingFee": 1.00,
      "distanceFare": 10.80,
      "timeFare": 5.40,
      "subtotal": 19.70,
      "promoDiscount": -5.00,
      "total": 14.70
    },
    "paymentMethod": "Visa ****1234",
    "receiptUrl": "https://..."
  }
}
```

---

## Admin Endpoints

### GET /admin/dashboard
Get dashboard statistics.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "activeTrips": 45,
    "activeDrivers": 120,
    "activeRiders": 89,
    "todayTrips": 523,
    "todayRevenue": 15840.50,
    "weeklyStats": {
      "trips": 3215,
      "revenue": 98450.25,
      "newDrivers": 23,
      "newRiders": 145
    },
    "recentAlerts": [
      {
        "type": "driver_pending_verification",
        "count": 5
      }
    ]
  }
}
```

### GET /admin/users
Get all users with filters.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `role`: admin | rider | driver
- `status`: active | inactive | banned
- `page`: 1
- `limit`: 20
- `search`: email or name

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "rider",
        "isActive": true,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

### PUT /admin/users/:id/status
Update user status (block/unblock).

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "isActive": false,
  "reason": "Violation of terms"
}
```

**Response:** (200 OK)

### GET /admin/drivers
Get all drivers with filters.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `status`: pending | approved | rejected | suspended
- `isVerified`: true | false
- `page`: 1
- `limit`: 20

**Response:** (200 OK)

### GET /admin/drivers/:id
Get detailed driver information.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "driver": {...},
    "documents": [...],
    "vehicle": {...},
    "recentTrips": [...],
    "statistics": {
      "totalTrips": 523,
      "totalEarnings": 15840.50,
      "averageRating": 4.9,
      "acceptanceRate": 92.5
    }
  }
}
```

### PUT /admin/drivers/:id/verify
Approve or reject driver verification.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "status": "approved", // or "rejected"
  "notes": "All documents verified"
}
```

**Response:** (200 OK)

### PUT /admin/drivers/:id/documents/:docId
Approve or reject a specific document.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Document verified"
}
```

**Response:** (200 OK)

### GET /admin/trips
Get all trips with filters.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `status`: requested | in_progress | completed | cancelled
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `riderId`: number
- `driverId`: number
- `page`: 1
- `limit`: 20

**Response:** (200 OK)

### GET /admin/pricing-rules
Get all pricing rules.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** (200 OK)

### POST /admin/pricing-rules
Create new pricing rule.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "zoneId": 1,
  "vehicleType": "standard",
  "baseFare": 2.50,
  "bookingFee": 1.00,
  "perKmRate": 1.50,
  "perMinuteRate": 0.30,
  "minimumFare": 5.00,
  "effectiveFrom": "2025-02-01T00:00:00Z"
}
```

**Response:** (201 Created)

### PUT /admin/pricing-rules/:id
Update pricing rule.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** (200 OK)

### GET /admin/zones
Get all zones.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** (200 OK)

### POST /admin/zones
Create new zone.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "name": "Downtown",
  "city": "New York",
  "country": "USA",
  "boundary": {
    "type": "Polygon",
    "coordinates": [[
      [-74.0060, 40.7128],
      [-74.0100, 40.7200],
      [-73.9950, 40.7180],
      [-74.0060, 40.7128]
    ]]
  },
  "surgeMultiplier": 1.5
}
```

**Response:** (201 Created)

### GET /admin/promo-codes
Get all promo codes.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Response:** (200 OK)

### POST /admin/promo-codes
Create new promo code.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "code": "NEWYEAR2025",
  "description": "New Year discount",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 10.00,
  "minTripAmount": 15.00,
  "usageLimit": 1000,
  "perUserLimit": 1,
  "validFrom": "2025-01-01T00:00:00Z",
  "validTo": "2025-01-31T23:59:59Z"
}
```

**Response:** (201 Created)

### GET /admin/support-tickets
Get all support tickets.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Query Parameters:**
- `status`: open | in_progress | resolved | closed
- `category`: payment_issue | driver_behavior | lost_item | other
- `page`: 1
- `limit`: 20

**Response:** (200 OK)

### PUT /admin/support-tickets/:id
Update support ticket.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "status": "resolved",
  "resolutionNotes": "Issue resolved, refund processed"
}
```

**Response:** (200 OK)

---

## Payment Endpoints

### POST /payments/add-card
Add payment method.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "cardToken": "tok_visa_1234", // From payment gateway
  "isDefault": true
}
```

**Response:** (201 Created)

### GET /payments/methods
Get all payment methods.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "card",
      "last4": "1234",
      "brand": "Visa",
      "expiryMonth": 12,
      "expiryYear": 2026,
      "isDefault": true
    }
  ]
}
```

### DELETE /payments/methods/:id
Remove payment method.

**Headers:** `Authorization: Bearer <token>`

**Response:** (200 OK)

---

## Geocoding Endpoints

### GET /geocoding/search
Search for addresses.

**Query Parameters:**
- `query`: "Times Square, New York"

**Response:** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "address": "Times Square, Manhattan, NY 10036, USA",
      "location": {
        "lat": 40.7580,
        "lng": -73.9855
      },
      "placeId": "ChIJ..."
    }
  ]
}
```

### GET /geocoding/reverse
Reverse geocode coordinates to address.

**Query Parameters:**
- `lat`: 40.7580
- `lng`: -73.9855

**Response:** (200 OK)
```json
{
  "success": true,
  "data": {
    "address": "Times Square, Manhattan, NY 10036, USA",
    "location": {
      "lat": 40.7580,
      "lng": -73.9855
    }
  }
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001/rider', {
  auth: { token: 'your_jwt_token' }
});
```

### Rider Events (Namespace: /rider)

#### Listen Events:
- `ride_accepted` - Driver accepted your ride request
- `driver_location_update` - Driver's real-time location
- `driver_arrived` - Driver arrived at pickup
- `trip_started` - Trip has started
- `trip_completed` - Trip completed
- `trip_cancelled` - Trip cancelled by driver

#### Emit Events:
- `cancel_trip` - Cancel ride request

### Driver Events (Namespace: /driver)

#### Listen Events:
- `ride_request` - New ride request
- `ride_cancelled` - Rider cancelled the request
- `trip_updated` - Trip status updated

#### Emit Events:
- `accept_ride` - Accept ride request
- `decline_ride` - Decline ride request
- `update_location` - Send location updates
- `arrived_at_pickup` - Notify arrival
- `start_trip` - Start the trip
- `complete_trip` - Complete the trip

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Authentication required |
| INVALID_TOKEN | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Request validation failed |
| DUPLICATE_EMAIL | 400 | Email already registered |
| INVALID_CREDENTIALS | 401 | Invalid email or password |
| DRIVER_NOT_AVAILABLE | 404 | No drivers available |
| TRIP_NOT_FOUND | 404 | Trip not found |
| TRIP_ALREADY_ACCEPTED | 400 | Trip already accepted by another driver |
| INVALID_TRIP_STATUS | 400 | Invalid operation for current trip status |
| PAYMENT_FAILED | 402 | Payment processing failed |
| PROMO_INVALID | 400 | Invalid or expired promo code |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **Location updates**: 20 requests per minute per driver

## Pagination

All list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination info:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```
