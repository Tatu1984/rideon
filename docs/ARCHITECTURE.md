# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Admin      │   Rider      │   Rider      │    Driver          │
│   Web App    │   Web App    │   Mobile     │    Mobile          │
│  (Next.js)   │  (Next.js)   │ (React Native)│ (React Native)    │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────┬──────────┘
       │              │              │                 │
       │              └──────────────┼─────────────────┘
       │                             │
       │                    ┌────────▼────────┐
       │                    │   API Gateway    │
       │                    │  (Rate Limiting) │
       └────────────────────┤  (CORS/Auth)     │
                            └────────┬─────────┘
                                     │
                ┌────────────────────┼───────────────────────┐
                │                    │                       │
         ┌──────▼──────┐     ┌──────▼──────┐      ┌────────▼────────┐
         │   REST API  │     │  WebSocket  │      │  File Upload    │
         │  (Express)  │     │  (Socket.IO)│      │   Service       │
         └──────┬──────┘     └──────┬──────┘      └────────┬────────┘
                │                   │                      │
                └───────────────────┼──────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   BUSINESS LOGIC    │
                         ├─────────────────────┤
                         │ - Auth Service      │
                         │ - Ride Matching     │
                         │ - Pricing Engine    │
                         │ - Payment Service   │
                         │ - Notification Svc  │
                         │ - Geocoding Svc     │
                         └──────────┬──────────┘
                                    │
                ┌───────────────────┼──────────────────┐
                │                   │                  │
         ┌──────▼──────┐    ┌──────▼──────┐   ┌──────▼──────┐
         │  PostgreSQL │    │    Redis    │   │  S3/Storage │
         │  (PostGIS)  │    │   (Cache)   │   │  (Documents)│
         └─────────────┘    └─────────────┘   └─────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  EXTERNAL SERVICES  │
                         ├─────────────────────┤
                         │ - Payment Gateway   │
                         │ - SMS Provider      │
                         │ - Push Notifications│
                         │ - Geocoding API     │
                         │ - Email Service     │
                         └─────────────────────┘
```

## Application Architecture

### Backend (Node.js + Express)

```
apps/backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── app.js
│   ├── models/              # Sequelize models
│   │   ├── User.js
│   │   ├── Rider.js
│   │   ├── Driver.js
│   │   ├── Vehicle.js
│   │   ├── Trip.js
│   │   ├── Payment.js
│   │   └── index.js
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── riderController.js
│   │   ├── driverController.js
│   │   ├── tripController.js
│   │   ├── adminController.js
│   │   └── paymentController.js
│   ├── services/            # Business logic
│   │   ├── authService.js
│   │   ├── rideMatchingService.js
│   │   ├── pricingService.js
│   │   ├── paymentService.js
│   │   ├── notificationService.js
│   │   ├── geocodingService.js
│   │   └── socketService.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── rider.js
│   │   ├── driver.js
│   │   ├── trip.js
│   │   ├── admin.js
│   │   └── index.js
│   ├── utils/               # Utility functions
│   │   ├── haversine.js
│   │   ├── logger.js
│   │   └── validators.js
│   ├── socket/              # Socket.IO handlers
│   │   ├── riderSocket.js
│   │   ├── driverSocket.js
│   │   └── index.js
│   └── index.js             # Entry point
├── migrations/              # Database migrations
├── seeders/                 # Database seeders
└── package.json
```

### Frontend Web (Next.js - Admin & Rider)

```
apps/admin/ or apps/web/
├── public/
│   └── images/
├── src/
│   ├── pages/               # Next.js pages
│   │   ├── _app.js
│   │   ├── _document.js
│   │   ├── index.js
│   │   ├── login.js
│   │   ├── dashboard/
│   │   ├── trips/
│   │   ├── drivers/
│   │   └── users/
│   ├── components/          # React components
│   │   ├── Layout/
│   │   ├── Map/
│   │   │   ├── LeafletMap.js
│   │   │   ├── RideTracker.js
│   │   │   └── LocationPicker.js
│   │   ├── RideBooking/
│   │   ├── TripHistory/
│   │   └── common/
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── useGeolocation.js
│   │   └── useRide.js
│   ├── services/            # API client services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── rideService.js
│   │   └── socketService.js
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.js
│   │   ├── RideContext.js
│   │   └── SocketContext.js
│   ├── utils/               # Utility functions
│   │   ├── formatters.js
│   │   └── validators.js
│   └── styles/              # CSS/styling
│       └── globals.css
└── package.json
```

### Mobile Apps (React Native)

```
apps/rider-app/ or apps/driver-app/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/
│   ├── navigation/          # React Navigation
│   │   ├── RootNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/             # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── SignupScreen.js
│   │   ├── Home/
│   │   │   └── HomeScreen.js
│   │   ├── Ride/
│   │   │   ├── RideRequestScreen.js
│   │   │   ├── ActiveRideScreen.js
│   │   │   └── RideHistoryScreen.js
│   │   └── Profile/
│   ├── components/          # Reusable components
│   │   ├── Map/
│   │   │   ├── MapView.js
│   │   │   └── LocationMarker.js
│   │   ├── RideCard/
│   │   └── common/
│   ├── services/            # API and business logic
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── rideService.js
│   │   ├── locationService.js
│   │   └── socketService.js
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useLocation.js
│   │   └── useSocket.js
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.js
│   │   └── RideContext.js
│   ├── utils/               # Utilities
│   │   ├── formatters.js
│   │   └── permissions.js
│   └── assets/              # Images, fonts, etc.
├── App.js                   # Root component
└── package.json
```

## Data Flow Patterns

### 1. Ride Request Flow

```
Rider Mobile/Web
  │
  ├─> Enter pickup & drop locations
  │   (Geocoding API converts addresses to coordinates)
  │
  ├─> Request fare estimate
  │   POST /api/trips/estimate
  │   └─> Pricing Service calculates fare
  │
  ├─> Confirm ride request
  │   POST /api/trips
  │   └─> Trip created with status: REQUESTED
  │
  └─> Ride Matching Service
      │
      ├─> Find nearby drivers (PostGIS query)
      │   SELECT * FROM drivers WHERE
      │   ST_DWithin(location, pickup_point, 5000)
      │   AND status = 'AVAILABLE'
      │
      ├─> Send notifications to drivers (Socket.IO)
      │   emit('ride_request', tripData)
      │
      └─> Wait for driver acceptance
          │
          ├─> Driver accepts
          │   POST /api/trips/:id/accept
          │   └─> Update trip status: ACCEPTED
          │       └─> Notify rider (Socket.IO)
          │
          └─> Driver declines / timeout
              └─> Retry with next driver
```

### 2. Real-time Tracking Flow

```
Driver App
  │
  ├─> Background location service
  │   └─> Every 3-5 seconds
  │       POST /api/drivers/location
  │       {lat, lng, heading, speed}
  │
  └─> Socket.IO broadcast
      │
      └─> emit('driver_location_update', {
            tripId,
            location: {lat, lng},
            heading,
            eta
          })

Rider App
  │
  └─> Socket.IO listener
      on('driver_location_update', (data) => {
        updateMapMarker(data.location)
        updateETA(data.eta)
      })
```

### 3. Payment Flow

```
Trip Completion
  │
  ├─> Driver ends trip
  │   POST /api/trips/:id/complete
  │   └─> Calculate final fare
  │       (distance × perKm + duration × perMin + base + surge)
  │
  ├─> Create payment record
  │   INSERT INTO payments (trip_id, amount, method, status)
  │
  ├─> Process payment
  │   └─> If CARD:
  │       └─> Payment Gateway API
  │           └─> Stripe/PayPal charge
  │   └─> If CASH:
  │       └─> Mark as PENDING_COLLECTION
  │
  └─> Send receipt (Email + Push notification)
```

## Security Architecture

### Authentication Flow

```
1. User Login
   POST /api/auth/login
   { email, password }
   │
   ├─> Validate credentials (bcrypt.compare)
   ├─> Generate JWT access token (expires: 24h)
   ├─> Generate refresh token (expires: 30d)
   └─> Return { accessToken, refreshToken, user }

2. Protected Request
   GET /api/trips
   Headers: { Authorization: Bearer <token> }
   │
   ├─> Middleware: auth.js
   │   ├─> Verify JWT signature
   │   ├─> Check expiration
   │   └─> Decode user info
   │
   ├─> Middleware: roleCheck.js
   │   └─> Verify user has required role
   │
   └─> Process request

3. Token Refresh
   POST /api/auth/refresh
   { refreshToken }
   │
   ├─> Validate refresh token in DB
   ├─> Generate new access token
   └─> Return { accessToken }
```

### Role-Based Access Control

```javascript
// Middleware chain
router.get('/admin/dashboard',
  auth,                    // Verify JWT
  roleCheck(['admin']),    // Check role
  adminController.getDashboard
);

router.post('/trips/:id/accept',
  auth,
  roleCheck(['driver']),
  tripController.acceptTrip
);
```

## Real-time Communication Architecture

### Socket.IO Events

```
Namespaces:
  /rider  - For rider clients
  /driver - For driver clients
  /admin  - For admin monitoring

Rider Events:
  - ride_requested
  - driver_assigned
  - driver_location_update
  - driver_arrived
  - trip_started
  - trip_completed
  - trip_cancelled

Driver Events:
  - ride_request (with countdown timer)
  - ride_cancelled_by_rider
  - rider_location
  - payment_received

Admin Events:
  - new_trip
  - trip_completed
  - driver_online
  - driver_offline
  - system_alert
```

### Socket.IO Authentication

```javascript
// Server
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Client
const socket = io('http://localhost:3001/rider', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});
```

## Database Architecture

### Connection Management

- **Connection Pool**: Max 20 connections for API server
- **Read Replicas**: For reporting and analytics queries
- **Indexing Strategy**: Indexes on frequently queried fields
- **PostGIS Extension**: For geospatial queries

### Query Optimization

```sql
-- Spatial index for driver location queries
CREATE INDEX idx_drivers_location ON drivers USING GIST(location);

-- Composite index for trip queries
CREATE INDEX idx_trips_status_created ON trips(status, created_at DESC);

-- Index for user lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
```

## Caching Strategy

### Redis Cache Layers

```
1. User Session Cache
   Key: session:{userId}
   TTL: 24 hours
   Data: User profile, preferences

2. Driver Location Cache
   Key: driver:location:{driverId}
   TTL: 30 seconds
   Data: { lat, lng, timestamp, heading }

3. Active Trips Cache
   Key: trip:active:{tripId}
   TTL: 4 hours
   Data: Trip details, driver info, rider info

4. Pricing Rules Cache
   Key: pricing:{zoneId}
   TTL: 1 hour
   Data: Base fare, per km/min rates, surge multiplier

5. Geofence Cache
   Key: zone:{zoneId}
   TTL: 6 hours
   Data: Zone boundaries, pricing rules
```

## Scalability Considerations

### Horizontal Scaling

- **API Servers**: Stateless design allows multiple instances behind load balancer
- **Socket.IO**: Use Redis adapter for multi-server Socket.IO
- **Database**: Read replicas for scaling reads
- **Queue System**: Bull (Redis-based) for background jobs

### Background Jobs

```
Job Types:
  - Payment processing
  - Receipt generation
  - Driver payout calculation
  - Analytics aggregation
  - Notification delivery
  - Document processing
  - Data cleanup
```

## Monitoring & Observability

### Logging Strategy

```
Log Levels:
  - ERROR: System errors, exceptions
  - WARN: Business logic warnings (e.g., no drivers available)
  - INFO: Important events (trip created, payment processed)
  - DEBUG: Detailed debugging info (development only)

Log Format: JSON
{
  timestamp: ISO8601,
  level: "INFO",
  service: "api",
  userId: "123",
  tripId: "456",
  message: "Trip completed",
  duration: 1850,
  fare: 25.50
}
```

### Metrics to Track

- API response times (P50, P95, P99)
- Active trips count
- Driver availability rate
- Ride matching success rate
- Payment success rate
- Socket.IO connection count
- Database query performance
- Cache hit/miss ratio

## Deployment Architecture

```
Production Environment:
  ├── Load Balancer (NGINX/ALB)
  │   └─> API Servers (3+ instances)
  │       └─> Health check: GET /health
  │
  ├── Database Cluster
  │   ├─> Primary (writes)
  │   └─> Replica (reads)
  │
  ├── Redis Cluster
  │   └─> Master + Replica
  │
  ├── File Storage (S3)
  │   └─> Document uploads
  │
  └── CDN
      └─> Static assets
```

## Technology Decisions Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Web Frontend | Next.js | SSR, great DX, API routes |
| Mobile | React Native | Cross-platform, shared logic with web |
| Backend | Express | Simple, flexible, great ecosystem |
| Database | PostgreSQL | ACID, PostGIS, mature |
| Cache | Redis | Fast, pub/sub, session storage |
| Real-time | Socket.IO | Easy WebSocket with fallbacks |
| Maps (Web) | LeafletJS | Open-source, lightweight, customizable |
| Maps (Mobile) | React Native Maps | Native performance |
| Auth | JWT | Stateless, scalable |
| ORM | Sequelize | Feature-rich, migrations support |
| File Storage | S3-compatible | Scalable, CDN integration |
| Payments | Stripe | Developer-friendly, reliable |
