# RIDEON
## Complete Architecture & Developer Documentation
### Uber-like Ride-Hailing Platform

**Version 1.0** | Last Updated: December 2024

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Backend Architecture](#5-backend-architecture)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Authentication & Security](#8-authentication--security)
9. [Real-Time Communication](#9-real-time-communication-socketio)
10. [Mobile Apps Architecture](#10-mobile-apps-architecture)
11. [Admin Panel](#11-admin-panel)
12. [Payment Integration](#12-payment-integration)
13. [Environment Setup](#13-environment-setup)
14. [Development Guidelines](#14-development-guidelines)
15. [Deployment](#15-deployment)

---

## 1. Project Overview

RideOn is a comprehensive, full-stack ride-hailing platform similar to Uber. It provides a complete ecosystem for connecting riders with drivers, managing trips, processing payments, and administering the platform.

### Key Features

- Real-time ride booking and tracking
- Driver and rider mobile applications (React Native/Expo)
- Administrative dashboard with live monitoring
- Payment processing with Stripe integration
- Dynamic pricing and surge pricing by zone
- Promotional codes and discounts
- Driver verification and document management
- Rating and review system (both parties)
- Support ticket system
- Real-time location tracking via WebSockets
- Split fare functionality
- Scheduled rides
- Driver referral program

---

## 2. Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js (>=18.0.0) | Runtime environment |
| Express.js | REST API framework |
| PostgreSQL | Primary database (Neon DB compatible) |
| Sequelize | ORM for database operations |
| Socket.io | Real-time bidirectional communication |
| JWT | Authentication tokens |
| bcrypt | Password hashing (10 rounds) |
| Stripe SDK | Payment processing |
| Winston | Logging |
| Bull | Job queue (Redis-based) |

### Frontend (Web/Admin)
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| React 18 | UI library |
| Tailwind CSS | Utility-first styling |
| Leaflet / React-Leaflet | Interactive maps |
| Recharts | Analytics charts |
| Axios | HTTP client |

### Mobile Applications
| Technology | Purpose |
|------------|---------|
| React Native 0.81 | Cross-platform mobile framework |
| Expo SDK 54 | Development and build tooling |
| React Navigation | Screen navigation |
| React Native Paper | Material Design components |
| Socket.io-client | Real-time updates |
| Stripe React Native | Mobile payments |
| expo-location | GPS tracking |
| expo-secure-store | Secure credential storage |

---

## 3. System Architecture

RideOn follows a monorepo architecture with clearly separated concerns.

### Architecture Diagram

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Rider App      │     │   Driver App     │     │   Admin Panel    │
│ (React Native)   │     │ (React Native)   │     │   (Next.js)      │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │ REST API + WebSocket
                    ┌─────────────┴─────────────┐
                    │      Backend API          │
                    │     (Express.js)          │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
┌────────┴────────┐    ┌──────────┴─────────┐    ┌─────────┴────────┐
│   PostgreSQL    │    │     Socket.io      │    │      Stripe      │
│   (Neon DB)     │    │   (Real-time)      │    │    (Payments)    │
└─────────────────┘    └────────────────────┘    └──────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| Backend API | Business logic, data validation, authentication, database operations |
| Socket.io Server | Real-time driver location updates, trip status notifications |
| PostgreSQL | Persistent data storage for all entities |
| Stripe | Payment processing, driver payouts via Stripe Connect |
| Mobile Apps | Native user interfaces for riders and drivers |
| Admin Panel | Platform management, monitoring, and analytics |

---

## 4. Folder Structure

```
rideon/
├── apps/
│   ├── backend/              # Node.js Express API Server
│   │   └── src/
│   │       ├── config/       # Database configuration
│   │       ├── controllers/  # Request handlers (10 files)
│   │       ├── routes/       # API route definitions (11 files)
│   │       ├── models/       # Sequelize models (22 files)
│   │       ├── middleware/   # Auth, validation, security
│   │       ├── services/     # Business logic services
│   │       ├── socket/       # WebSocket handlers
│   │       ├── utils/        # Helper utilities
│   │       ├── tests/        # Test files
│   │       └── index.js      # Application entry point
│   │
│   ├── admin/                # Next.js Admin Dashboard (Port 3002)
│   │   ├── app/              # App router pages (24 sections)
│   │   ├── components/       # Reusable components
│   │   └── services/         # API service layer
│   │
│   └── web/                  # Next.js Public Web App (Port 3000)
│       ├── app/              # App router pages
│       └── components/       # UI components
│
├── rider-app/                # React Native Rider App
│   └── src/
│       ├── screens/          # Screen components (32 screens)
│       ├── services/         # API, Socket, Storage services
│       ├── contexts/         # React Context providers
│       ├── navigation/       # Navigation configuration
│       ├── components/       # Reusable components
│       └── utils/            # Helper functions
│
├── driver-app/               # React Native Driver App
│   └── src/
│       ├── screens/          # Screen components (24 screens)
│       ├── services/         # API, Socket, GPS services
│       ├── contexts/         # React Context providers
│       ├── navigation/       # Navigation configuration
│       └── utils/            # Helper functions
│
├── packages/                 # Shared Packages
│   ├── shared/               # Common utilities
│   ├── validation/           # Input validation schemas
│   └── ui-components/        # Shared UI components
│
├── docs/                     # Documentation
└── package.json              # Root monorepo config
```

---

## 5. Backend Architecture

### Entry Point
**Location:** `apps/backend/src/index.js`

Initializes Express, middleware stack, routes, and Socket.io server.

### Controllers (10 files)

| Controller | Responsibility |
|------------|----------------|
| `authController.js` | User registration, login, token refresh, logout |
| `adminController.js` | Admin dashboard, user management, analytics |
| `driverController.js` | Driver profile, status, location, documents |
| `riderController.js` | Rider profile, wallet, trip history |
| `tripController.js` | Trip creation, status updates, cancellation |
| `paymentController.js` | Payment processing, refunds, payouts |
| `geocodingController.js` | Location services |
| `scheduledRidesController.js` | Future ride scheduling |
| `splitFareController.js` | Fare splitting between riders |
| `settingsController.js` | System configuration |

### Routes (11 files)

| Route | Endpoint Prefix |
|-------|-----------------|
| Auth | `/api/v1/auth` |
| Rider | `/api/v1/rider` |
| Driver | `/api/v1/driver` |
| Trips | `/api/v1/trips` |
| Payments | `/api/v1/payments` |
| Admin | `/api/v1/admin` |
| Geocoding | `/api/v1/geocoding` |
| Scheduled Rides | `/api/v1/scheduled-rides` |
| Split Fare | `/api/v1/split-fare` |
| Settings | `/api/v1/settings` |

### Middleware

| Middleware | Purpose |
|------------|---------|
| `auth.js` | JWT token verification, user attachment to request |
| `authorize.js` | Role-based access control (admin/rider/driver) |
| `validators/` | Input validation using express-validator |
| `rateLimiter.js` | Rate limiting for API protection |
| `errorHandler.js` | Centralized error handling |

### Services

| Service | Purpose |
|---------|---------|
| `driverMatchingService.js` | Algorithm for matching riders with nearby drivers |
| `emailService.js` | Email notifications (Nodemailer/SendGrid) |
| `smsService.js` | SMS notifications (Twilio) |
| `notificationService.js` | Push notifications |

---

## 6. Database Schema

The application uses PostgreSQL with Sequelize ORM. There are **22 models**.

### User Model (Core Authentication)

```javascript
{
  id: UUID (Primary Key),
  email: String (Unique, Required),
  password: String (Bcrypt hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: Enum ['admin', 'rider', 'driver'],
  isVerified: Boolean,
  isActive: Boolean,
  profilePicture: String (URL),
  deviceToken: String (Push notifications),
  lastLoginAt: DateTime
}
```

### Rider Model

```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key → User),
  homeAddress: String,
  homeLatitude: Decimal,
  homeLongitude: Decimal,
  workAddress: String,
  workLatitude: Decimal,
  workLongitude: Decimal,
  totalTrips: Integer,
  totalSpent: Decimal,
  averageRating: Decimal (1-5),
  paymentMethods: JSON Array
}
```

### Driver Model

```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key → User),
  licenseNumber: String,
  licenseExpiry: Date,
  status: Enum ['pending', 'approved', 'rejected', 'suspended', 'online', 'offline', 'busy'],
  currentLatitude: Decimal,
  currentLongitude: Decimal,
  currentAddress: String,
  lastLocationUpdate: DateTime,
  totalTrips: Integer,
  totalEarnings: Decimal,
  availableBalance: Decimal,
  averageRating: Decimal (1-5),
  acceptanceRate: Decimal (%),
  completionRate: Decimal (%),
  stripeAccountId: String,
  bankAccountNumber: String,
  bankName: String
}
```

### Trip Model

```javascript
{
  id: UUID (Primary Key),
  riderId: UUID (Foreign Key → Rider),
  driverId: UUID (Foreign Key → Driver),
  vehicleId: UUID (Foreign Key → Vehicle),
  promoCodeId: UUID (Foreign Key → PromoCode),

  // Locations
  pickupAddress: String,
  pickupLatitude: Decimal,
  pickupLongitude: Decimal,
  dropoffAddress: String,
  dropoffLatitude: Decimal,
  dropoffLongitude: Decimal,

  // Status
  status: Enum ['requested', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled'],

  // Timestamps
  requestedAt: DateTime,
  acceptedAt: DateTime,
  arrivedAt: DateTime,
  startedAt: DateTime,
  completedAt: DateTime,
  cancelledAt: DateTime,

  // Pricing
  estimatedDistance: Decimal (km),
  estimatedDuration: Integer (minutes),
  estimatedFare: Decimal,
  baseFare: Decimal,
  distanceFare: Decimal,
  timeFare: Decimal,
  surgeFare: Decimal,
  discount: Decimal,
  totalFare: Decimal,
  platformFee: Decimal,
  driverEarnings: Decimal,

  // Payment
  paymentMethod: Enum ['cash', 'card', 'wallet', 'upi'],
  paymentStatus: Enum ['pending', 'completed', 'failed'],

  // Additional
  riderNotes: String,
  cancellationReason: String,
  cancellationFee: Decimal,
  route: JSON (Encoded polyline)
}
```

### Other Models Summary

| Model | Purpose |
|-------|---------|
| `TripStatusHistory` | Audit trail for trip status changes |
| `DriverLocation` | Historical location tracking |
| `Vehicle` | Driver vehicle info (make, model, plate, type, capacity) |
| `DriverDocument` | Document verification (license, insurance, ID, etc.) |
| `Rating` | Trip ratings from both parties (1-5 scale + comments) |
| `Payment` | Payment transaction records |
| `DriverPayout` | Driver earnings payouts |
| `PromoCode` | Promotional discounts (percentage/fixed) |
| `PromoCodeUsage` | Promo usage tracking |
| `PricingRule` | Zone-based dynamic pricing |
| `Zone` | Geographic zones for operations |
| `SupportTicket` | Support requests |
| `SupportMessage` | Ticket messages |
| `Notification` | Push/in-app notifications |
| `DriverReferral` | Driver referral program |
| `RefreshToken` | JWT token management |
| `SystemSettings` | Application configuration |

---

## 7. API Endpoints

All API endpoints are prefixed with `/api/v1`

### Authentication (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (rider/driver) |
| POST | `/auth/login` | User login, returns tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/profile` | Get current user profile |

### Rider (`/rider`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rider/profile` | Get rider profile |
| PATCH | `/rider/profile` | Update rider profile |
| GET | `/rider/trips` | Get trip history |
| GET | `/rider/active-trip` | Get ongoing trip |
| GET | `/rider/wallet` | Get wallet balance |
| POST | `/rider/wallet/add` | Add money to wallet |
| GET | `/rider/wallet/transactions` | Transaction history |

### Driver (`/driver`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/driver/profile` | Get driver profile |
| PUT | `/driver/profile` | Update driver info |
| PUT | `/driver/status` | Change status (online/offline/busy) |
| PUT | `/driver/location` | Update current location |
| GET | `/driver/trips` | Get trip history |
| GET | `/driver/earnings` | Get earnings summary |
| POST | `/driver/payouts` | Request payout |
| GET | `/driver/payouts` | Get payout history |
| GET | `/driver/statistics` | Performance stats |
| GET | `/driver/documents` | Get uploaded documents |
| POST | `/driver/documents` | Upload document |
| DELETE | `/driver/documents/:id` | Delete document |

### Trips (`/trips`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trips` | Request new trip |
| GET | `/trips/:tripId` | Get trip details |
| POST | `/trips/:tripId/accept` | Driver accepts trip |
| PUT | `/trips/:tripId/status` | Update trip status |
| POST | `/trips/:tripId/cancel` | Cancel trip |
| POST | `/trips/:tripId/rate` | Rate trip (1-5 stars) |

### Payments (`/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/intent` | Create Stripe payment intent |
| POST | `/payments/confirm` | Confirm payment |
| GET | `/payments/history` | Get payment history |
| POST | `/payments/refund` | Request refund |
| POST | `/payments/webhook` | Stripe webhook handler |
| POST | `/payments/connect-account` | Setup Stripe Connect |

### Admin (`/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard statistics |
| GET | `/admin/users` | List all users |
| POST | `/admin/users` | Create user |
| PUT | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user |
| PUT | `/admin/users/:id/toggle-status` | Toggle user active status |
| GET | `/admin/drivers` | List drivers |
| GET | `/admin/drivers/pending` | Pending verifications |
| GET | `/admin/drivers/:id` | Get driver details |
| PUT | `/admin/drivers/:id/verify` | Verify driver |
| PUT | `/admin/drivers/:id/status` | Update driver status |
| GET | `/admin/riders` | List riders |
| GET | `/admin/trips` | All trips |
| PUT | `/admin/trips/:id` | Update trip |
| GET | `/admin/pricing` | Pricing rules |
| POST | `/admin/pricing` | Create pricing rule |
| PUT | `/admin/pricing/:id` | Update pricing rule |
| GET | `/admin/promo-codes` | Promo codes |
| POST | `/admin/promo-codes` | Create promo code |
| GET | `/admin/support-tickets` | Support tickets |
| PUT | `/admin/support-tickets/:id` | Update ticket |
| GET | `/admin/analytics/revenue` | Revenue analytics |
| GET | `/admin/analytics/trips` | Trip analytics |

---

## 8. Authentication & Security

### Authentication Flow

#### Registration
1. User sends POST `/auth/register` with email, password, name, role
2. Password is hashed with bcrypt (10 rounds)
3. User record created with role-specific profile (Rider/Driver)
4. JWT access token (24h expiry) + refresh token (30d expiry) generated
5. Tokens returned to client

#### Login
1. User sends POST `/auth/login` with email, password
2. Email lookup and password verification with bcrypt
3. JWT access token + refresh token generated
4. Refresh token stored in database with expiry
5. Tokens returned with user data

#### Token Verification (Middleware)
1. Extract Bearer token from `Authorization` header
2. Verify JWT signature with `JWT_SECRET`
3. Validate token expiry
4. Look up user in database, check if active
5. Attach user object to request (`id`, `email`, `role`)

#### Token Refresh
1. Client sends POST `/auth/refresh` with refresh token
2. Lookup refresh token in DB (must not be revoked, not expired)
3. Generate new access token with same claims
4. Return new access token

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Rate Limiting | 10 auth attempts per 15 minutes (brute force protection) |
| Password Hashing | bcrypt with 10 salt rounds |
| JWT | Signed tokens with secret key, includes user ID, email, role |
| CORS | Configured whitelist of allowed origins |
| Helmet | Security headers enabled |
| Input Validation | express-validator on all inputs |
| SQL Injection | Protected via Sequelize ORM parameterized queries |
| Password Reset | 3 attempts per hour limit |

### Role-Based Access Control (RBAC)

| Role | Access |
|------|--------|
| `admin` | Full access to admin routes, user management, analytics |
| `driver` | Driver-specific endpoints, trip acceptance, earnings |
| `rider` | Rider-specific endpoints, trip booking, payments |

The `authorize` middleware validates the user's role against route requirements.

---

## 9. Real-Time Communication (Socket.io)

Socket.io is used for real-time features.

**Server Setup:** `apps/backend/src/socket/index.js`

### Connection Flow

1. Client connects with JWT token in handshake
2. Server validates token and extracts user info
3. User joins personal room: `user:{userId}`
4. Role-based room assignment:
   - Driver joins: `driver:{driverId}`
   - Rider joins: `rider:{riderId}`
   - Admin joins: `admin`

### Socket Events

#### Driver Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `driver:online` | Server → All | Driver comes online (includes location) |
| `driver:offline` | Server → All | Driver goes offline/disconnects |
| `driver:status-change` | Client → Server | Driver status update (online/offline/busy) |
| `driver:location-update` | Client → Server → Trip Room | Real-time location with heading, speed |

#### Trip Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `trip:join` | Client → Server | User joins trip room for updates |
| `trip:leave` | Client → Server | User leaves trip room |
| `trip:request` | Server → Nearby Drivers | New trip request notification |
| `trip:accept` | Server → Rider | Driver accepted trip |
| `trip:status-update` | Server → Trip Room | Trip status changes |
| `trip:driver-location` | Server → Rider | Driver location during active trip |
| `trip:message` | Bidirectional | Chat between driver and rider |
| `trip:emergency` | Client → Server → Admin | SOS alert |

#### Admin Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `admin:join` | Client → Server | Admin joins broadcast room |
| All driver events | Server → Admin | Receives all driver online/offline |
| All trip events | Server → Admin | Receives all trip status updates |
| Emergency alerts | Server → Admin | Receives SOS alerts |

### Client Implementation

Mobile apps use `socket.service.js` to manage connections:
- Auto-reconnection with exponential backoff
- Token refresh on connection failure
- Event listeners for trip and location updates
- Graceful disconnect handling

---

## 10. Mobile Apps Architecture

### Rider App

**Location:** `/rider-app/src`

#### Screens (32 total)

| Category | Screens |
|----------|---------|
| Auth | `LoginScreen`, `RegisterScreen` |
| Main | `HomeScreen`, `TripsScreen`, `ProfileScreen`, `WalletScreen`, `OffersScreen` |
| Booking | `BookingScreen`, `VehicleSelectionScreen`, `FareBreakdownScreen`, `ScheduleRideScreen` |
| Trip | `TripTrackingScreen`, `TripDetailsScreen`, `RateTripScreen`, `LostItemScreen` |
| Payment | `PaymentMethodsScreen`, `AddCardScreen`, `TransactionHistoryScreen`, `SplitFareScreen` |
| Account | `EditProfileScreen`, `PreferencesScreen`, `KYCScreen`, `EmergencyContactsScreen`, `FavoriteDriversScreen` |
| Rewards | `RewardsScreen`, `MembershipScreen`, `ReferralScreen` |
| Safety | `SafetyToolkitScreen`, `RideCheckScreen`, `ShareTripScreen`, `ReportSafetyScreen` |
| Settings | `SettingsScreen`, `NotificationSettingsScreen`, `PrivacyScreen`, `AccessibilityScreen` |
| Support | `SupportScreen`, `ChatSupportScreen`, `TicketsScreen`, `FAQScreen` |

#### Services

| Service | Purpose |
|---------|---------|
| `api.service.js` | HTTP client with token interceptors |
| `socket.service.js` | Real-time connection management |
| `payment.service.js` | Stripe payment handling |
| `notification.service.js` | Push notifications |
| `secureStorage.service.js` | Secure credential storage |

#### Contexts

| Context | Purpose |
|---------|---------|
| `AuthContext` | Authentication state management |
| `TripContext` | Active trip state and updates |
| `LocationContext` | GPS tracking |

---

### Driver App

**Location:** `/driver-app/src`

#### Screens (24 total)

| Category | Screens |
|----------|---------|
| Auth | `LoginScreen`, `RegisterScreen`, `OnboardingScreen` |
| Main | `HomeScreen`, `TripsScreen`, `EarningsScreen`, `RatingsScreen`, `ProfileScreen`, `ReferralScreen` |
| Earnings | `WalletScreen`, `PayoutHistoryScreen`, `IncentivesScreen` |
| Trip | `ActiveTripScreen`, `TripDetailsScreen`, `NavigationScreen` |
| Profile | `SettingsScreen`, `DocumentsScreen`, `VehicleScreen`, `PerformanceScreen`, `BankDetailsScreen` |
| Support | `SupportScreen`, `FAQScreen`, `IncidentReportScreen`, `SafetyToolkitScreen` |

#### Key Features

- Background GPS tracking for location updates
- Accept/reject incoming trip requests
- Real-time navigation to pickup/dropoff
- Earnings tracking and payout requests
- Document upload for verification
- Performance metrics dashboard
- Referral program management

---

## 11. Admin Panel

**Location:** `/apps/admin`
**Framework:** Next.js 14 App Router
**Port:** 3002

### Dashboard Sections (24 pages)

| Section | Purpose |
|---------|---------|
| Dashboard | Live tracking map, active trips, key statistics |
| Analytics | Revenue trends, trip analytics, charts |
| Drivers | Driver list, verification, KYC management |
| Riders | Rider management and details |
| Trips | All trips with filtering and live tracking |
| Users | User management (create, update, deactivate) |
| Vehicles | Fleet management |
| Pricing | Dynamic pricing rules by zone |
| Zones | Geographic zone management |
| Promotions | Promo code management |
| Wallet | Driver payouts and transactions |
| Support | Support ticket management |
| Emergency | SOS alert handling |
| Notifications | Send notifications |
| Settings | System configuration |
| Team | Admin team management |
| Referrals | Referral program |
| Scheduled | Scheduled rides |
| Approvals | Pending verifications |

### Key Components

| Component | Purpose |
|-----------|---------|
| `LiveTrackingMap` | Real-time map showing active drivers and trips |
| `ActiveRidesList` | List of ongoing trips with status |
| `Sidebar` | Navigation menu with all sections |
| `LayoutWrapper` | Main application shell |

### API Integration

- Centralized API service in `/services/api.js`
- Axios instance with auth headers
- Dashboard data polling every 10 seconds
- Real-time updates via Socket.io for live tracking

---

## 12. Payment Integration

Stripe is used for payment processing and driver payouts.

### Payment Methods

| Method | Description |
|--------|-------------|
| Cash | Collected at end of trip |
| Card | Processed via Stripe |
| Wallet | In-app balance |
| UPI | For India deployments |

### Payment Flow

1. Trip completed, rider sees fare
2. Rider confirms payment method
3. For card: Backend creates Stripe `PaymentIntent`
4. Client confirms payment with Stripe SDK
5. Stripe webhook notifies backend of success/failure
6. Payment record created with status
7. Driver earnings calculated (fare - platform fee)
8. Receipt sent to rider

### Driver Payouts

- Stripe Connect accounts for drivers
- Automatic weekly/monthly payouts
- Platform commission deducted
- Bank transfer, UPI, or wallet credit
- Admin can process manual payouts

### Fare Calculation

```
Total Fare = Base Fare
           + (Distance × Per-KM Rate)
           + (Duration × Per-Minute Rate)
           + (Surge Multiplier × Surge Fare)
           - Discount (Promo Code)

Platform Fee = Total Fare × Commission Rate %
Driver Earnings = Total Fare - Platform Fee
```

### Stripe Webhook Events

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Mark payment complete, update trip |
| `payment_intent.payment_failed` | Mark payment failed, notify user |
| `charge.refunded` | Update payment status to refunded |
| `account.updated` | Update driver Stripe account status |

---

## 13. Environment Setup

### Backend Environment Variables (`.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
# OR individual values:
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=rideon
DB_PORT=5432

# Authentication
JWT_SECRET=your-secure-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Communications (Optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
SENDGRID_API_KEY=SG...

# Server
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3002

# Redis (Optional - for Bull queue)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables

**Admin Panel (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Mobile Apps (`app.json` extra)**
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP:3001/api/v1",
      "socketUrl": "http://YOUR_IP:3001"
    }
  }
}
```

### Local Development Setup

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd rideon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   - Create a new database named `rideon`
   - Or use Neon DB for serverless PostgreSQL

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

5. **Run database migrations**
   ```bash
   cd apps/backend
   npm run migrate
   ```

6. **Seed demo data (optional)**
   ```bash
   npm run seed
   ```

7. **Start backend**
   ```bash
   npm run dev:backend
   ```

8. **Start admin panel**
   ```bash
   npm run dev:admin
   ```

9. **Start mobile app**
   ```bash
   cd rider-app
   npx expo start
   ```

---

## 14. Development Guidelines

### Code Organization

- Keep controllers thin - move business logic to services
- Use middleware for cross-cutting concerns
- Validate all inputs with express-validator
- Use Sequelize transactions for multi-step operations
- Log errors with Winston, not `console.log`

### API Response Format

**Success Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Paginated Response**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Handling

- Use try-catch in async controller functions
- Pass errors to `next()` for centralized handling
- Use custom error classes for specific errors
- Never expose stack traces in production

```javascript
// Example controller
const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    res.json({ success: true, data: trip });
  } catch (error) {
    next(error);
  }
};
```

### Database Best Practices

- Always use parameterized queries (Sequelize handles this)
- Use transactions for related updates
- Include appropriate indexes on frequently queried columns
- Use eager loading to avoid N+1 queries

```javascript
// Example with eager loading
const trips = await Trip.findAll({
  include: [
    { model: Rider, as: 'rider' },
    { model: Driver, as: 'driver' }
  ]
});
```

### Git Workflow

1. Create feature branches from `main`
2. Use descriptive commit messages
3. Create pull requests for code review
4. Squash commits before merging

```bash
git checkout -b feature/add-split-fare
# Make changes
git add .
git commit -m "Add split fare functionality"
git push origin feature/add-split-fare
# Create PR on GitHub
```

---

## 15. Deployment

### Backend Deployment

**Options:** Vercel, Railway, Render, AWS, Google Cloud

**Steps:**
1. Set all environment variables
2. Run database migrations before deployment
3. Configure health check endpoint (`/health`)
4. Set up SSL/TLS certificates
5. Configure CORS for production domains

**Health Check Endpoint:**
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Admin/Web Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure custom domain
4. Enable automatic deployments

**vercel.json**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Mobile App Deployment (EAS Build)

1. Install EAS CLI: `npm install -g eas-cli`
2. Configure `eas.json` for build profiles
3. Build: `eas build --platform ios` or `--platform android`
4. Submit to App Store / Play Store
5. Use OTA updates for quick fixes

**eas.json**
```json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": { "resourceClass": "m-medium" },
      "android": { "buildType": "apk" }
    }
  }
}
```

### Database (Neon DB)

1. Create production database at neon.tech
2. Configure connection pooling
3. Set up automated backups
4. Use read replicas for scaling

### Default Ports

| Service | Port |
|---------|------|
| Backend API | 3001 |
| Admin Panel | 3002 |
| Web App | 3000 |
| Expo Dev Server | 8081 |

### Common Commands

```bash
# Development
npm run dev:backend      # Start backend server
npm run dev:admin        # Start admin panel
npm run dev:web          # Start web app

# Mobile Apps
cd rider-app && npx expo start
cd driver-app && npx expo start

# Database
npm run migrate          # Run migrations
npm run migrate:undo     # Rollback migration
npm run seed             # Run seeders

# Build
npm run build:admin      # Build admin for production
npm run build:web        # Build web for production

# Testing
npm test                 # Run tests
```

---

## Quick Reference

### Important File Locations

| File | Location |
|------|----------|
| Backend Entry | `apps/backend/src/index.js` |
| Socket Handler | `apps/backend/src/socket/index.js` |
| Auth Middleware | `apps/backend/src/middleware/auth.js` |
| Database Models | `apps/backend/src/models/` |
| API Routes | `apps/backend/src/routes/` |
| Admin Dashboard | `apps/admin/app/page.js` |
| Rider App Entry | `rider-app/App.js` |
| Driver App Entry | `driver-app/App.js` |

### Model Relationships

```
User (1) ──────── (1) Rider
User (1) ──────── (1) Driver
Driver (1) ────── (N) Vehicle
Driver (1) ────── (N) DriverDocument
Driver (1) ────── (N) Trip
Rider (1) ─────── (N) Trip
Trip (1) ──────── (1) Payment
Trip (1) ──────── (N) Rating
Trip (1) ──────── (N) TripStatusHistory
Zone (1) ─────── (N) PricingRule
PromoCode (1) ── (N) PromoCodeUsage
User (1) ──────── (N) SupportTicket
SupportTicket (1) ─ (N) SupportMessage
```

---

**End of Documentation**
