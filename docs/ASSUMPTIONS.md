# Project Assumptions

## General Assumptions

1. **Geographic Scope**: The platform will initially operate in a single country with standard distance units (km/miles configurable).

2. **Language**: English is the primary language. Internationalization can be added later.

3. **Currency**: USD as base currency, with configurable currency support in the database.

4. **Real-time Requirements**:
   - Driver location updates every 3-5 seconds during active trips
   - Ride matching happens within 30 seconds
   - WebSocket connections for real-time updates

## Authentication & Security

1. **Authentication Method**:
   - Email + password for web
   - Phone number + OTP for mobile (simplified to password for MVP)
   - JWT tokens with 24-hour expiry
   - Refresh tokens stored in database

2. **Password Security**: Bcrypt hashing with salt rounds of 10

3. **API Security**:
   - CORS enabled for known origins only
   - Rate limiting on all public endpoints
   - Input validation on all endpoints

## Mapping & Geolocation

1. **Map Provider**:
   - LeafletJS with OpenStreetMap tiles for web
   - React Native Maps (falls back to platform defaults) for mobile
   - Geocoding via Nominatim API (open-source) or configurable to Google/Mapbox

2. **Location Accuracy**: Minimum GPS accuracy of 50 meters

3. **Distance Calculation**: Haversine formula for quick calculations, with option to use routing API for accurate road distance

4. **Driver Search Radius**: 5km default radius for finding nearby drivers

## Ride Matching & Pricing

1. **Fare Calculation**:
   - Base fare: $2.50
   - Per km: $1.50
   - Per minute: $0.30
   - Booking fee: $1.00
   - Surge pricing: 1.0x to 3.0x multiplier based on demand
   - Minimum fare: $5.00

2. **Driver Matching**:
   - Maximum 5 drivers notified simultaneously
   - 30-second timeout for driver response
   - First-accept-first-serve model
   - Drivers must be within 5km of pickup

3. **Cancellation Policy**:
   - Free cancellation within 2 minutes of booking
   - $3 fee for rider cancellation after 2 minutes
   - Driver cancellation more than 3 times/day triggers review
   - No charge if driver cancels

## Payment

1. **Payment Methods**:
   - Cash
   - Credit/Debit card (via Stripe/PayPal abstraction)
   - Digital wallet (future)

2. **Payment Processing**:
   - Card payments processed immediately after trip
   - Cash marked as collected by driver
   - Refunds processed within 5-7 business days

3. **Driver Payouts**: Weekly automated payouts (platform takes 20% commission)

## Driver Verification

1. **Required Documents**:
   - Driver's license
   - Vehicle registration
   - Insurance certificate
   - Background check (assumed external service)
   - Profile photo

2. **Verification Process**: Manual review by admin within 24-48 hours

3. **Vehicle Requirements**:
   - Maximum 10 years old
   - Minimum 4 doors
   - Valid inspection sticker

## Trip Management

1. **Trip States**: Requested → Accepted → Driver En Route → Arrived → In Progress → Completed/Cancelled

2. **Wait Time**: Driver can wait up to 5 minutes at pickup without charge, then $0.50/minute

3. **Trip Duration**: Maximum 4 hours per trip

4. **Rating System**:
   - 1-5 star rating
   - Riders and drivers rate each other after each trip
   - Ratings visible after both parties have rated

## Notifications

1. **Push Notifications**:
   - Ride status updates
   - Driver arrival
   - Payment receipts
   - Promotional messages (opt-in)

2. **SMS Notifications**:
   - OTP for authentication
   - Critical trip updates (optional backup)

3. **Email Notifications**:
   - Trip receipts
   - Weekly summaries
   - Account updates

## Data & Privacy

1. **Data Retention**:
   - Trip data: 7 years (for legal/tax purposes)
   - User data: Until account deletion requested
   - Location history: 90 days

2. **Privacy**:
   - Phone numbers masked between rider and driver
   - Exact addresses not shared until trip accepted
   - GDPR/CCPA compliance ready

## Performance & Scalability

1. **Expected Load** (Phase 1):
   - 10,000 active users
   - 1,000 active drivers
   - 5,000 trips per day
   - 500 concurrent active trips

2. **Response Times**:
   - API responses < 200ms (P95)
   - Map load < 2 seconds
   - Ride matching < 30 seconds

3. **Database**:
   - PostgreSQL with connection pooling
   - Read replicas for reporting
   - PostGIS for geospatial queries

## Admin Panel

1. **Admin Roles**:
   - Super Admin (full access)
   - Support Agent (limited access, no pricing changes)
   - Finance (view-only for financial data)

2. **Monitoring**:
   - Real-time trip monitoring
   - Driver/rider activity tracking
   - Revenue dashboards

## Mobile App Assumptions

1. **Platform Support**:
   - iOS 12.0+
   - Android 8.0+

2. **Permissions Required**:
   - Location (always for drivers, when-in-use for riders)
   - Camera (for document upload)
   - Notifications

3. **Offline Support**:
   - Basic app navigation works offline
   - Trips cannot be initiated offline
   - Queue updates when connection restored

## Development Assumptions

1. **Code Style**: JavaScript ES6+, no TypeScript

2. **Testing**:
   - Unit tests for business logic
   - Integration tests for API endpoints
   - E2E tests for critical flows

3. **Environment**:
   - Development, Staging, Production environments
   - Environment variables for all secrets and configs

4. **Version Control**: Git with feature branch workflow

5. **CI/CD**: Automated testing and deployment pipelines

## External Services (Abstracted)

1. **Geocoding API**: Nominatim (can swap to Google Maps/Mapbox)
2. **Payment Gateway**: Stripe (abstracted interface)
3. **SMS Provider**: Twilio (abstracted interface)
4. **Push Notifications**: Firebase Cloud Messaging
5. **File Storage**: AWS S3 or compatible (for document uploads)
6. **Email Service**: SendGrid or similar

## Business Logic Assumptions

1. **Commission**: Platform takes 20% commission from each trip

2. **Surge Pricing**: Automatic based on demand/supply ratio in each zone

3. **Promotions**:
   - Promo codes for riders (percentage or fixed discount)
   - Referral system ($5 credit for both parties)

4. **Support**:
   - In-app chat support (future)
   - Email support (initial)
   - Phone support for critical issues

5. **Service Types** (MVP): Single car type (Standard). Future: Premium, XL, etc.
