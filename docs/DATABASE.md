# Database Schema & ERD

## Entity Relationship Diagram (Text Format)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    USERS    │         │    RIDERS    │         │   DRIVERS   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │────────>│ id (PK)      │         │ id (PK)     │
│ email       │         │ user_id (FK) │         │ user_id (FK)│<────┐
│ phone_number│         │ home_address │         │ license_num │     │
│ password    │         │ work_address │         │ status      │     │
│ role        │         │ rating       │         │ rating      │     │
│ is_active   │         │ total_trips  │         │ total_trips │     │
│ created_at  │         │ created_at   │         │ is_verified │     │
└─────────────┘         └──────────────┘         │ is_online   │     │
       │                                         │ commission  │     │
       │                                         │ earnings    │     │
       │                                         └─────────────┘     │
       │                                                │            │
       │                                                │            │
       │                    ┌───────────────────────────┘            │
       │                    │                                        │
       │                    ▼                                        │
       │         ┌──────────────────┐                                │
       │         │     VEHICLES     │                                │
       │         ├──────────────────┤                                │
       │         │ id (PK)          │                                │
       │         │ driver_id (FK)   │────────────────────────────────┘
       │         │ make             │
       │         │ model            │
       │         │ year             │
       │         │ color            │
       │         │ plate_number     │
       │         │ vehicle_type     │
       │         │ seats            │
       │         └──────────────────┘
       │
       │         ┌──────────────────────┐
       │         │  DRIVER_DOCUMENTS    │
       │         ├──────────────────────┤
       │         │ id (PK)              │
       ├────────>│ driver_id (FK)       │
       │         │ document_type        │
       │         │ file_url             │
       │         │ status               │
       │         │ verified_by (FK)     │
       │         │ verified_at          │
       │         │ expiry_date          │
       │         └──────────────────────┘
       │
       │
       │         ┌─────────────────────────────────────────┐
       │         │              TRIPS                      │
       │         ├─────────────────────────────────────────┤
       │         │ id (PK)                                 │
       ├────────>│ rider_id (FK)                           │
       │         │ driver_id (FK)                          │
       │         │ vehicle_id (FK)                         │
       │         │ pickup_location (GEOGRAPHY)             │
       │         │ pickup_address                          │
       │         │ dropoff_location (GEOGRAPHY)            │
       │         │ dropoff_address                         │
       │         │ status                                  │
       │         │ estimated_fare                          │
       │         │ final_fare                              │
       │         │ distance_km                             │
       │         │ duration_minutes                        │
       │         │ surge_multiplier                        │
       │         │ requested_at                            │
       │         │ accepted_at                             │
       │         │ started_at                              │
       │         │ completed_at                            │
       │         │ cancelled_at                            │
       │         │ cancelled_by                            │
       │         │ cancellation_reason                     │
       │         │ cancellation_fee                        │
       │         └──────────────┬──────────────────────────┘
       │                        │
       │                        │
       │         ┌──────────────▼──────────────┐
       │         │   TRIP_STATUS_HISTORY       │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       │         │ trip_id (FK)                │
       │         │ status                      │
       │         │ location (GEOGRAPHY)        │
       │         │ notes                       │
       │         │ created_at                  │
       │         └─────────────────────────────┘
       │
       │         ┌─────────────────────────────┐
       │         │         PAYMENTS            │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       ├────────>│ trip_id (FK)                │
       │         │ rider_id (FK)               │
       │         │ driver_id (FK)              │
       │         │ amount                      │
       │         │ currency                    │
       │         │ payment_method              │
       │         │ status                      │
       │         │ gateway_transaction_id      │
       │         │ gateway_response            │
       │         │ processed_at                │
       │         │ refunded_at                 │
       │         │ refund_amount               │
       │         └─────────────────────────────┘
       │
       │         ┌─────────────────────────────┐
       │         │         RATINGS             │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       ├────────>│ trip_id (FK)                │
       │         │ rider_id (FK)               │
       │         │ driver_id (FK)              │
       │         │ rated_by                    │
       │         │ rated_to                    │
       │         │ rating (1-5)                │
       │         │ review                      │
       │         │ tags (JSON)                 │
       │         │ created_at                  │
       │         └─────────────────────────────┘
       │
       │         ┌─────────────────────────────┐
       │         │     PRICING_RULES           │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       │         │ zone_id (FK)                │
       │         │ vehicle_type                │
       │         │ base_fare                   │
       │         │ booking_fee                 │
       │         │ per_km_rate                 │
       │         │ per_minute_rate             │
       │         │ minimum_fare                │
       │         │ cancellation_fee            │
       │         │ wait_time_threshold_min     │
       │         │ wait_time_per_minute        │
       │         │ currency                    │
       │         │ effective_from              │
       │         │ effective_to                │
       │         └─────────────────────────────┘
       │
       │         ┌─────────────────────────────┐
       │         │          ZONES              │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       │         │ name                        │
       │         │ city                        │
       │         │ country                     │
       │         │ boundary (GEOGRAPHY)        │
       │         │ surge_multiplier            │
       │         │ is_active                   │
       │         │ created_at                  │
       │         └─────────────────────────────┘
       │
       │         ┌─────────────────────────────┐
       │         │      PROMO_CODES            │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       │         │ code                        │
       │         │ discount_type               │
       │         │ discount_value              │
       │         │ max_discount                │
       │         │ min_trip_amount             │
       │         │ usage_limit                 │
       │         │ used_count                  │
       │         │ valid_from                  │
       │         │ valid_to                    │
       │         │ is_active                   │
       │         └─────────────────────────────┘
       │
       │         ┌─────────────────────────────┐
       │         │    PROMO_CODE_USAGE         │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       ├────────>│ promo_code_id (FK)          │
       │         │ user_id (FK)                │
       │         │ trip_id (FK)                │
       │         │ discount_applied            │
       │         │ used_at                     │
       │         └─────────────────────────────┘
       │
       │         ┌─────────────────────────────┐
       │         │      NOTIFICATIONS          │
       │         ├─────────────────────────────┤
       │         │ id (PK)                     │
       └────────>│ user_id (FK)                │
                 │ type                        │
                 │ title                       │
                 │ message                     │
                 │ data (JSON)                 │
                 │ is_read                     │
                 │ sent_at                     │
                 │ read_at                     │
                 └─────────────────────────────┘

       ┌─────────────────────────────┐
       │     DRIVER_LOCATIONS        │
       ├─────────────────────────────┤
       │ id (PK)                     │
       │ driver_id (FK)              │
       │ location (GEOGRAPHY)        │
       │ heading                     │
       │ speed                       │
       │ accuracy                    │
       │ timestamp                   │
       └─────────────────────────────┘

       ┌─────────────────────────────┐
       │     REFRESH_TOKENS          │
       ├─────────────────────────────┤
       │ id (PK)                     │
       │ user_id (FK)                │
       │ token                       │
       │ expires_at                  │
       │ created_at                  │
       │ revoked_at                  │
       └─────────────────────────────┘

       ┌─────────────────────────────┐
       │     SUPPORT_TICKETS         │
       ├─────────────────────────────┤
       │ id (PK)                     │
       │ user_id (FK)                │
       │ trip_id (FK)                │
       │ category                    │
       │ subject                     │
       │ description                 │
       │ status                      │
       │ priority                    │
       │ assigned_to (FK)            │
       │ resolved_at                 │
       │ created_at                  │
       └─────────────────────────────┘

       ┌─────────────────────────────┐
       │   DRIVER_PAYOUTS            │
       ├─────────────────────────────┤
       │ id (PK)                     │
       │ driver_id (FK)              │
       │ period_start                │
       │ period_end                  │
       │ total_earnings              │
       │ commission                  │
       │ net_payout                  │
       │ status                      │
       │ paid_at                     │
       │ created_at                  │
       └─────────────────────────────┘
```

## SQL Schema Definitions

### 1. Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'rider', 'driver')),
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Riders Table

```sql
CREATE TABLE riders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  home_address TEXT,
  home_location GEOGRAPHY(POINT, 4326),
  work_address TEXT,
  work_location GEOGRAPHY(POINT, 4326),
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_trips INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  preferred_payment_method VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_riders_user_id ON riders(user_id);
```

### 3. Drivers Table

```sql
CREATE TABLE drivers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended', 'banned')),
  is_verified BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT false,
  current_location GEOGRAPHY(POINT, 4326),
  last_location_update TIMESTAMP,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_trips INTEGER DEFAULT 0,
  acceptance_rate DECIMAL(5, 2) DEFAULT 100.00,
  cancellation_rate DECIMAL(5, 2) DEFAULT 0.00,
  total_earnings DECIMAL(10, 2) DEFAULT 0.00,
  commission_rate DECIMAL(5, 2) DEFAULT 20.00,
  bank_account_number VARCHAR(50),
  bank_routing_number VARCHAR(50),
  ssn_last4 VARCHAR(4),
  background_check_status VARCHAR(20),
  background_check_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_online ON drivers(is_online) WHERE is_online = true;
CREATE INDEX idx_drivers_location ON drivers USING GIST(current_location);
```

### 4. Vehicles Table

```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(30),
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(20) DEFAULT 'standard' CHECK (vehicle_type IN ('standard', 'premium', 'xl', 'suv')),
  seats INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  insurance_policy_number VARCHAR(50),
  insurance_expiry DATE,
  registration_expiry DATE,
  inspection_expiry DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate_number);
```

### 5. Driver Documents Table

```sql
CREATE TABLE driver_documents (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('license', 'registration', 'insurance', 'inspection', 'photo', 'background_check')),
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  rejection_reason TEXT,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_driver_documents_driver_id ON driver_documents(driver_id);
CREATE INDEX idx_driver_documents_status ON driver_documents(status);
```

### 6. Trips Table

```sql
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  rider_id INTEGER NOT NULL REFERENCES riders(id),
  driver_id INTEGER REFERENCES drivers(id),
  vehicle_id INTEGER REFERENCES vehicles(id),

  -- Locations
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  pickup_address TEXT NOT NULL,
  dropoff_location GEOGRAPHY(POINT, 4326) NOT NULL,
  dropoff_address TEXT NOT NULL,

  -- Status and timing
  status VARCHAR(20) DEFAULT 'requested' CHECK (status IN (
    'requested', 'accepted', 'driver_en_route', 'arrived',
    'in_progress', 'completed', 'cancelled'
  )),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  driver_arrived_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by VARCHAR(20),
  cancellation_reason TEXT,

  -- Pricing
  estimated_fare DECIMAL(10, 2),
  final_fare DECIMAL(10, 2),
  base_fare DECIMAL(10, 2),
  distance_fare DECIMAL(10, 2),
  time_fare DECIMAL(10, 2),
  booking_fee DECIMAL(10, 2),
  surge_multiplier DECIMAL(3, 2) DEFAULT 1.00,
  cancellation_fee DECIMAL(10, 2) DEFAULT 0.00,
  promo_discount DECIMAL(10, 2) DEFAULT 0.00,

  -- Trip details
  distance_km DECIMAL(10, 2),
  duration_minutes INTEGER,
  wait_time_minutes INTEGER DEFAULT 0,
  route_polyline TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trips_rider_id ON trips(rider_id);
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX idx_trips_status_created ON trips(status, created_at DESC);
CREATE INDEX idx_trips_pickup_location ON trips USING GIST(pickup_location);
```

### 7. Trip Status History Table

```sql
CREATE TABLE trip_status_history (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trip_status_history_trip_id ON trip_status_history(trip_id);
CREATE INDEX idx_trip_status_history_created_at ON trip_status_history(created_at);
```

### 8. Payments Table

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER UNIQUE NOT NULL REFERENCES trips(id),
  rider_id INTEGER NOT NULL REFERENCES riders(id),
  driver_id INTEGER NOT NULL REFERENCES drivers(id),

  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'wallet')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),

  -- Gateway integration
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,

  -- Timestamps
  processed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,

  -- Commission
  platform_commission DECIMAL(10, 2),
  driver_earnings DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_trip_id ON payments(trip_id);
CREATE INDEX idx_payments_rider_id ON payments(rider_id);
CREATE INDEX idx_payments_driver_id ON payments(driver_id);
CREATE INDEX idx_payments_status ON payments(status);
```

### 9. Ratings Table

```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER UNIQUE NOT NULL REFERENCES trips(id),
  rider_id INTEGER NOT NULL REFERENCES riders(id),
  driver_id INTEGER NOT NULL REFERENCES drivers(id),

  -- Who rated whom
  rated_by VARCHAR(20) NOT NULL CHECK (rated_by IN ('rider', 'driver')),
  rated_to VARCHAR(20) NOT NULL CHECK (rated_to IN ('rider', 'driver')),

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  tags JSONB, -- e.g., ["clean car", "polite", "safe driving"]

  is_visible BOOLEAN DEFAULT true,
  flagged BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_trip_id ON ratings(trip_id);
CREATE INDEX idx_ratings_rider_id ON ratings(rider_id);
CREATE INDEX idx_ratings_driver_id ON ratings(driver_id);
```

### 10. Zones Table

```sql
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),

  -- GeoJSON polygon
  boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,

  -- Pricing modifiers
  surge_multiplier DECIMAL(3, 2) DEFAULT 1.00,
  demand_level VARCHAR(20) DEFAULT 'normal' CHECK (demand_level IN ('low', 'normal', 'high', 'very_high')),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zones_boundary ON zones USING GIST(boundary);
CREATE INDEX idx_zones_active ON zones(is_active) WHERE is_active = true;
```

### 11. Pricing Rules Table

```sql
CREATE TABLE pricing_rules (
  id SERIAL PRIMARY KEY,
  zone_id INTEGER REFERENCES zones(id),
  vehicle_type VARCHAR(20) DEFAULT 'standard',

  base_fare DECIMAL(10, 2) NOT NULL DEFAULT 2.50,
  booking_fee DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  per_km_rate DECIMAL(10, 2) NOT NULL DEFAULT 1.50,
  per_minute_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.30,
  minimum_fare DECIMAL(10, 2) NOT NULL DEFAULT 5.00,

  cancellation_fee DECIMAL(10, 2) DEFAULT 3.00,
  wait_time_threshold_minutes INTEGER DEFAULT 5,
  wait_time_per_minute DECIMAL(10, 2) DEFAULT 0.50,

  currency VARCHAR(3) DEFAULT 'USD',

  effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  effective_to TIMESTAMP,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_rules_zone_id ON pricing_rules(zone_id);
CREATE INDEX idx_pricing_rules_effective ON pricing_rules(effective_from, effective_to);
```

### 12. Promo Codes Table

```sql
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,

  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount DECIMAL(10, 2),
  min_trip_amount DECIMAL(10, 2) DEFAULT 0.00,

  usage_limit INTEGER, -- NULL means unlimited
  used_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,

  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_to TIMESTAMP,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active, valid_from, valid_to);
```

### 13. Promo Code Usage Table

```sql
CREATE TABLE promo_code_usage (
  id SERIAL PRIMARY KEY,
  promo_code_id INTEGER NOT NULL REFERENCES promo_codes(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  trip_id INTEGER NOT NULL REFERENCES trips(id),

  discount_applied DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(promo_code_id, trip_id)
);

CREATE INDEX idx_promo_code_usage_promo_id ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_user_id ON promo_code_usage(user_id);
```

### 14. Notifications Table

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL CHECK (type IN (
    'trip_update', 'payment', 'promo', 'account', 'system'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional structured data

  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,

  -- Push notification
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);
```

### 15. Driver Locations Table (Time-series data)

```sql
CREATE TABLE driver_locations (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,

  location GEOGRAPHY(POINT, 4326) NOT NULL,
  heading DECIMAL(5, 2), -- 0-360 degrees
  speed DECIMAL(5, 2), -- km/h
  accuracy DECIMAL(6, 2), -- meters

  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_timestamp ON driver_locations(timestamp DESC);
CREATE INDEX idx_driver_locations_location ON driver_locations USING GIST(location);

-- Partition this table by month for better performance
```

### 16. Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,

  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,

  device_info JSONB -- { device_type, os, app_version }
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### 17. Support Tickets Table

```sql
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  trip_id INTEGER REFERENCES trips(id),

  category VARCHAR(50) NOT NULL CHECK (category IN (
    'payment_issue', 'driver_behavior', 'lost_item',
    'accident', 'app_issue', 'other'
  )),
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  assigned_to INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
```

### 18. Driver Payouts Table

```sql
CREATE TABLE driver_payouts (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES drivers(id),

  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,

  total_trips INTEGER NOT NULL,
  total_earnings DECIMAL(10, 2) NOT NULL,
  platform_commission DECIMAL(10, 2) NOT NULL,
  adjustments DECIMAL(10, 2) DEFAULT 0.00,
  net_payout DECIMAL(10, 2) NOT NULL,

  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),

  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  paid_at TIMESTAMP,

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_driver_payouts_driver_id ON driver_payouts(driver_id);
CREATE INDEX idx_driver_payouts_period ON driver_payouts(period_start, period_end);
CREATE INDEX idx_driver_payouts_status ON driver_payouts(status);
```

## Database Functions and Triggers

### 1. Update Timestamps Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_riders_updated_at BEFORE UPDATE ON riders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... apply to all other tables
```

### 2. Update Driver Rating Function

```sql
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rated_to = 'driver' THEN
    UPDATE drivers
    SET rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM ratings
      WHERE driver_id = NEW.driver_id AND rated_to = 'driver'
    ),
    total_trips = (
      SELECT COUNT(*)
      FROM trips
      WHERE driver_id = NEW.driver_id AND status = 'completed'
    )
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_driver_rating_trigger
AFTER INSERT ON ratings
FOR EACH ROW EXECUTE FUNCTION update_driver_rating();
```

### 3. Update Rider Rating Function

```sql
CREATE OR REPLACE FUNCTION update_rider_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rated_to = 'rider' THEN
    UPDATE riders
    SET rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM ratings
      WHERE rider_id = NEW.rider_id AND rated_to = 'rider'
    ),
    total_trips = (
      SELECT COUNT(*)
      FROM trips
      WHERE rider_id = NEW.rider_id AND status = 'completed'
    )
    WHERE id = NEW.rider_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rider_rating_trigger
AFTER INSERT ON ratings
FOR EACH ROW EXECUTE FUNCTION update_rider_rating();
```

### 4. Find Nearby Drivers Function

```sql
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  pickup_lat DECIMAL,
  pickup_lng DECIMAL,
  radius_km DECIMAL DEFAULT 5.0,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  driver_id INTEGER,
  distance_km DECIMAL,
  rating DECIMAL,
  total_trips INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    ST_Distance(
      d.current_location::geography,
      ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography
    ) / 1000 AS distance_km,
    d.rating,
    d.total_trips
  FROM drivers d
  WHERE d.is_online = true
    AND d.is_verified = true
    AND d.status = 'approved'
    AND ST_DWithin(
      d.current_location::geography,
      ST_SetSRID(ST_MakePoint(pickup_lng, pickup_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC, d.rating DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
```

## Initial Data Setup

### Enable PostGIS Extension

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Create Default Admin User

```sql
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES (
  'admin@rideon.com',
  '$2b$10$YourHashedPasswordHere',
  'Admin',
  'User',
  'admin',
  true,
  true
);
```

### Create Default Pricing Rules

```sql
INSERT INTO pricing_rules (
  zone_id, vehicle_type, base_fare, booking_fee, per_km_rate, per_minute_rate, minimum_fare
) VALUES (
  NULL, 'standard', 2.50, 1.00, 1.50, 0.30, 5.00
);
```

## Database Indexes Strategy

1. **Primary Keys**: Automatic B-tree index
2. **Foreign Keys**: Explicit indexes for join performance
3. **Geospatial Indexes**: GIST indexes for location-based queries
4. **Composite Indexes**: For common query patterns (status + date)
5. **Partial Indexes**: For frequently filtered subsets (is_online = true)

## Performance Optimization Tips

1. **Connection Pooling**: Use pg-pool with min 5, max 20 connections
2. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries
3. **Partitioning**: Partition driver_locations by month
4. **Archival**: Archive completed trips older than 1 year
5. **Read Replicas**: Use for reporting and analytics
6. **Caching**: Cache pricing rules, zones in Redis
