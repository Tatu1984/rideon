# RideOn - Complete Admin Panel Specification
## Full Uber-Style Feature Implementation Guide

This document provides complete specifications for building a production-grade Uber-style admin panel with ALL features.

---

## DATABASE SCHEMA

### 1. Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('admin', 'rider', 'driver') NOT NULL,
  status ENUM('active', 'suspended', 'banned', 'pending') DEFAULT 'active',
  is_vip BOOLEAN DEFAULT FALSE,
  profile_photo_url TEXT,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

### 2. Drivers Table
```sql
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) UNIQUE,
  license_expiry DATE,
  background_check_status ENUM('pending', 'approved', 'rejected', 'expired'),
  background_check_date DATE,
  onboarding_status ENUM('pending', 'documents_uploaded', 'under_review', 'approved', 'rejected'),
  onboarding_step INTEGER DEFAULT 1,
  approval_date TIMESTAMP,
  approved_by INTEGER REFERENCES users(id),
  rejection_reason TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  current_location GEOMETRY(Point, 4326),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_trips INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  bank_account_number VARCHAR(50),
  bank_name VARCHAR(100),
  bank_routing_number VARCHAR(20),
  payout_method ENUM('bank_transfer', 'cash', 'wallet'),
  fleet_owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Vehicles Table (Individual Fleet)
```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_type_id INTEGER REFERENCES vehicle_types(id),
  driver_id INTEGER REFERENCES drivers(id),
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(30),
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  vin VARCHAR(50) UNIQUE,
  registration_number VARCHAR(50),
  registration_expiry DATE,
  insurance_number VARCHAR(50),
  insurance_expiry DATE,
  inspection_expiry DATE,
  status ENUM('active', 'maintenance', 'deactivated', 'pending_approval') DEFAULT 'pending_approval',
  photos JSONB, -- {front, back, left, right, interior, dashboard}
  last_service_date DATE,
  next_service_due DATE,
  odometer_reading INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Documents Table
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  driver_id INTEGER REFERENCES drivers(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  document_type ENUM('drivers_license', 'vehicle_registration', 'insurance', 'inspection', 'background_check', 'profile_photo', 'vehicle_photo', 'other'),
  document_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  expiry_date DATE,
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Trips Table
```sql
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  rider_id INTEGER REFERENCES users(id),
  driver_id INTEGER REFERENCES drivers(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  vehicle_type_id INTEGER REFERENCES vehicle_types(id),
  pickup_location GEOMETRY(Point, 4326) NOT NULL,
  pickup_address TEXT,
  dropoff_location GEOMETRY(Point, 4326),
  dropoff_address TEXT,
  stops JSONB, -- Multiple stops
  status ENUM('requested', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'requested',
  scheduled_for TIMESTAMP,
  accepted_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by ENUM('rider', 'driver', 'admin', 'system'),
  cancellation_reason TEXT,
  distance_km DECIMAL(10,2),
  duration_minutes INTEGER,
  estimated_fare DECIMAL(10,2),
  actual_fare DECIMAL(10,2),
  base_fare DECIMAL(10,2),
  distance_fare DECIMAL(10,2),
  time_fare DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
  surge_amount DECIMAL(10,2) DEFAULT 0.00,
  booking_fee DECIMAL(10,2),
  tolls DECIMAL(10,2) DEFAULT 0.00,
  tips DECIMAL(10,2) DEFAULT 0.00,
  promo_code VARCHAR(50),
  promo_discount DECIMAL(10,2) DEFAULT 0.00,
  wallet_deduction DECIMAL(10,2) DEFAULT 0.00,
  payment_method ENUM('cash', 'card', 'wallet', 'upi'),
  payment_status ENUM('pending', 'completed', 'failed', 'refunded'),
  driver_rating INTEGER CHECK (driver_rating BETWEEN 1 AND 5),
  rider_rating INTEGER CHECK (rider_rating BETWEEN 1 AND 5),
  driver_feedback TEXT,
  rider_feedback TEXT,
  route_polyline TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Support Tickets Table
```sql
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  trip_id INTEGER REFERENCES trips(id),
  category ENUM('payment', 'safety', 'lost_item', 'complaint', 'technical', 'other') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INTEGER REFERENCES users(id),
  resolution TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Ticket Messages Table
```sql
CREATE TABLE ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  attachments JSONB,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. Promotions Table
```sql
CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('flat', 'percentage') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_trip_amount DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  usage_limit INTEGER,
  usage_per_user INTEGER DEFAULT 1,
  total_used INTEGER DEFAULT 0,
  cities JSONB, -- Array of city IDs
  user_segment ENUM('all', 'new_users', 'existing_users', 'vip'),
  vehicle_types JSONB, -- Array of vehicle type IDs
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Promo Usage Table
```sql
CREATE TABLE promo_usage (
  id SERIAL PRIMARY KEY,
  promo_id INTEGER REFERENCES promotions(id),
  user_id INTEGER REFERENCES users(id),
  trip_id INTEGER REFERENCES trips(id),
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Wallet Transactions Table
```sql
CREATE TABLE wallet_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  transaction_type ENUM('credit', 'debit') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_type ENUM('trip', 'refund', 'topup', 'payout', 'adjustment', 'referral'),
  reference_id INTEGER,
  payment_method VARCHAR(50),
  payment_gateway_ref VARCHAR(100),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 11. Payouts Table
```sql
CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  period_start DATE,
  period_end DATE,
  total_trips INTEGER,
  total_earnings DECIMAL(10,2),
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  payout_method ENUM('bank_transfer', 'cash', 'wallet'),
  bank_reference VARCHAR(100),
  processed_by INTEGER REFERENCES users(id),
  processed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 12. Referrals Table
```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES users(id) NOT NULL,
  referee_id INTEGER REFERENCES users(id) NOT NULL,
  referral_code VARCHAR(20) NOT NULL,
  referee_type ENUM('rider', 'driver'),
  status ENUM('pending', 'completed', 'expired') DEFAULT 'pending',
  referrer_reward DECIMAL(10,2),
  referee_reward DECIMAL(10,2),
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. Scheduled Rides Table
```sql
CREATE TABLE scheduled_rides (
  id SERIAL PRIMARY KEY,
  rider_id INTEGER REFERENCES users(id) NOT NULL,
  vehicle_type_id INTEGER REFERENCES vehicle_types(id),
  pickup_location GEOMETRY(Point, 4326) NOT NULL,
  pickup_address TEXT,
  dropoff_location GEOMETRY(Point, 4326),
  dropoff_address TEXT,
  scheduled_time TIMESTAMP NOT NULL,
  estimated_fare DECIMAL(10,2),
  status ENUM('scheduled', 'assigned', 'cancelled', 'completed') DEFAULT 'scheduled',
  assigned_driver_id INTEGER REFERENCES drivers(id),
  trip_id INTEGER REFERENCES trips(id),
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 14. Emergency Alerts Table
```sql
CREATE TABLE emergency_alerts (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id),
  user_id INTEGER REFERENCES users(id) NOT NULL,
  user_type ENUM('rider', 'driver'),
  alert_type ENUM('sos', 'route_deviation', 'speeding', 'unsafe_behavior'),
  location GEOMETRY(Point, 4326),
  description TEXT,
  status ENUM('active', 'resolved', 'false_alarm') DEFAULT 'active',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'critical',
  assigned_to INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 15. Cities Table
```sql
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  state VARCHAR(100),
  timezone VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  operational_hours JSONB, -- {start: "06:00", end: "23:00"}
  base_fare DECIMAL(10,2),
  per_km_rate DECIMAL(10,2),
  per_minute_rate DECIMAL(10,2),
  minimum_fare DECIMAL(10,2),
  cancellation_fee DECIMAL(10,2),
  bounds GEOMETRY(Polygon, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API ENDPOINTS

### Fleet Management
```
GET    /api/admin/fleet
POST   /api/admin/fleet
GET    /api/admin/fleet/:id
PUT    /api/admin/fleet/:id
DELETE /api/admin/fleet/:id
POST   /api/admin/fleet/:id/assign-driver
POST   /api/admin/fleet/:id/upload-photo
PUT    /api/admin/fleet/:id/status
```

### Driver KYC & Documents
```
GET    /api/admin/drivers/:id/documents
POST   /api/admin/drivers/:id/documents/upload
PUT    /api/admin/documents/:id/verify
DELETE /api/admin/documents/:id
GET    /api/admin/drivers/pending-approval
POST   /api/admin/drivers/:id/approve
POST   /api/admin/drivers/:id/reject
PUT    /api/admin/drivers/:id/suspend
PUT    /api/admin/drivers/:id/reactivate
```

### Support Tickets
```
GET    /api/admin/tickets
POST   /api/admin/tickets
GET    /api/admin/tickets/:id
PUT    /api/admin/tickets/:id
POST   /api/admin/tickets/:id/messages
PUT    /api/admin/tickets/:id/assign
PUT    /api/admin/tickets/:id/resolve
```

### Promotions
```
GET    /api/admin/promotions
POST   /api/admin/promotions
GET    /api/admin/promotions/:id
PUT    /api/admin/promotions/:id
DELETE /api/admin/promotions/:id
GET    /api/admin/promotions/:id/usage
```

### Wallet & Payouts
```
GET    /api/admin/wallet/rider/:id
POST   /api/admin/wallet/rider/:id/credit
POST   /api/admin/wallet/rider/:id/debit
GET    /api/admin/wallet/driver/:id
GET    /api/admin/wallet/transactions
POST   /api/admin/payouts
GET    /api/admin/payouts
GET    /api/admin/payouts/:id
PUT    /api/admin/payouts/:id/process
```

### Live Monitoring
```
GET    /api/admin/live-trips
GET    /api/admin/live-drivers
GET    /api/admin/heat-map
POST   /api/admin/trips/:id/intervene
```

### Analytics
```
GET    /api/admin/analytics/revenue
GET    /api/admin/analytics/trips
GET    /api/admin/analytics/drivers
GET    /api/admin/analytics/cancellations
GET    /api/admin/reports/export
```

### Referrals
```
GET    /api/admin/referrals
GET    /api/admin/referrals/:id
POST   /api/admin/referrals/:id/complete
```

### Scheduled Rides
```
GET    /api/admin/scheduled-rides
GET    /api/admin/scheduled-rides/:id
DELETE /api/admin/scheduled-rides/:id
POST   /api/admin/scheduled-rides/:id/assign-driver
```

### Emergency
```
GET    /api/admin/emergency-alerts
GET    /api/admin/emergency-alerts/:id
PUT    /api/admin/emergency-alerts/:id/resolve
POST   /api/admin/emergency-alerts/:id/escalate
```

### Cities
```
GET    /api/admin/cities
POST   /api/admin/cities
PUT    /api/admin/cities/:id
DELETE /api/admin/cities/:id
```

---

## ADMIN PAGES TO BUILD

### 1. /fleet - Fleet Management
**Features:**
- List all vehicles with filters
- Add new vehicle form
- Edit vehicle details
- Upload vehicle photos
- Assign to driver
- Mark for maintenance
- View service history

### 2. /drivers/kyc - Driver KYC & Documents
**Features:**
- Pending applications list
- Document viewer with approve/reject
- Expiry tracking dashboard
- Auto-suspension on expiry
- Bulk approval tools
- Document upload interface

### 3. /support - Support Tickets
**Features:**
- Ticket list with filters
- Create new ticket
- Conversation thread
- Assign to admin
- Canned responses dropdown
- Link to trip/user
- Mark resolved

### 4. /promotions - Promo Codes
**Features:**
- Active/expired promo list
- Create promo wizard
- Usage analytics
- Disable/enable toggle
- Duplicate promo

### 5. /wallet - Wallet Management
**Features:**
- Rider wallet search
- Transaction history
- Manual credit/debit
- Refund processing
- Driver earnings dashboard
- Pending payouts list

### 6. /payouts - Payout Management
**Features:**
- Payout schedule calendar
- Process batch payouts
- Individual payout details
- Export to accounting
- Failed payout retry

### 7. /live-monitor - Live Trip Monitoring
**Features:**
- Real-time map with all active trips
- Driver location tracking
- Live trip count
- Manual trip intervention
- Emergency alert notifications

### 8. /analytics - Analytics Dashboard
**Features:**
- Revenue charts
- Trip volume trends
- Driver performance
- Cancellation analysis
- Peak hour heatmap
- Export reports

### 9. /referrals - Referral Management
**Features:**
- Referral leaderboard
- Pending rewards
- Referral code generator
- Usage tracking

### 10. /scheduled - Scheduled Rides
**Features:**
- Upcoming rides calendar
- Auto-assign settings
- Manual driver assignment
- Cancel scheduled rides

### 11. /emergency - Emergency Center
**Features:**
- Active SOS alerts
- Emergency contact
- Incident logs
- Safety reports

### 12. /cities - Service Areas
**Features:**
- City list
- Coverage map
- City-wise pricing
- Operational hours
- Launch new city wizard

---

## IMPLEMENTATION NOTES

All endpoints return JSON in this format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "field": "fieldName" // if validation error
  }
}
```

This specification provides everything needed to build the complete admin system matching Uber's functionality.
