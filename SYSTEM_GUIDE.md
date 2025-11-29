# 🚗 RideOn System - Complete Guide

Your Uber-like platform is **fully operational** with both Backend API and Admin Dashboard running.

---

## 📱 Access Points

### 1. **Admin Dashboard** (User & Driver Management)
**URL:** http://localhost:3002
- **Purpose:** Manage all users, drivers, approvals, vehicles, pricing, zones, etc.
- **Port:** 3002
- **Framework:** Next.js (React)

### 2. **Backend API** (REST Endpoints)
**URL:** http://localhost:3001
- **Purpose:** All API endpoints for riders, drivers, and admin operations
- **Port:** 3001
- **Framework:** Node.js + Express

---

## ✨ Available Features

### **User Management** (http://localhost:3002/users)
- ✅ View all users (riders, drivers, admins)
- ✅ Add new users manually
- ✅ Edit user details
- ✅ Delete users
- ✅ Filter users by role

### **Driver Management** (http://localhost:3002/drivers)
- ✅ View all drivers
- ✅ Approve/Reject drivers
- ✅ Assign vehicle types to drivers
- ✅ View driver ratings and trips
- ✅ Driver onboarding workflow

### **Driver KYC (Know Your Customer)** (http://localhost:3002/drivers/kyc)
- ✅ Verify driver documents
- ✅ Upload/manage driver documents
- ✅ Approve/reject documentation
- ✅ View pending driver approvals

### **Fleet Management** (http://localhost:3002/fleet)
- ✅ Add new vehicles
- ✅ Manage vehicle types
- ✅ Assign vehicles to drivers
- ✅ Track vehicle status

### **Vehicle Types** (http://localhost:3002/vehicles)
- ✅ Create custom vehicle types (Economy, Premium, SUV, Luxury, etc.)
- ✅ Set pricing for each vehicle type
- ✅ Manage vehicle features

### **Pricing Management** (http://localhost:3002/pricing)
- ✅ Set base fares
- ✅ Set per-km rates
- ✅ Configure surge pricing
- ✅ Create time-based pricing rules
- ✅ Peak hours and evening surge configurations

### **Zones/Geofencing** (http://localhost:3002/zones)
- ✅ Create service areas
- ✅ Set pricing multipliers for zones
- ✅ Configure airport fees
- ✅ Manage premium areas

### **Trips Management** (http://localhost:3002/trips)
- ✅ View all trips
- ✅ View trip details and status
- ✅ Edit/cancel trips

### **Support Tickets** (http://localhost:3002/support)
- ✅ View support tickets from users
- ✅ Respond to tickets
- ✅ Manage ticket status (open, resolved, etc.)
- ✅ Assign tickets to support team

### **Analytics Dashboard** (http://localhost:3002/analytics)
- ✅ Total revenue overview
- ✅ Total trips count
- ✅ Total users and drivers
- ✅ Average ratings
- ✅ Revenue charts
- ✅ Trip trends

### **Wallet Management** (http://localhost:3002/wallet)
- ✅ View rider wallets and balance
- ✅ Credit/debit rider wallets
- ✅ View driver earnings
- ✅ Payout tracking

### **Promotions** (http://localhost:3002/promotions)
- ✅ Create promo codes
- ✅ Manage discount codes
- ✅ Track usage

### **Notifications** (http://localhost:3002/notifications)
- ✅ Send push notifications
- ✅ View notification history

### **Cities Management** (http://localhost:3002/cities)
- ✅ Add new service cities
- ✅ Manage city settings
- ✅ Enable/disable cities

### **Emergency/SOS** (http://localhost:3002/emergency)
- ✅ View emergency alerts from users
- ✅ Respond to SOS calls

### **Scheduled Rides** (http://localhost:3002/scheduled)
- ✅ View future bookings
- ✅ Manage scheduled rides

### **Referrals** (http://localhost:3002/referrals)
- ✅ Track referral programs
- ✅ Manage referral rewards

---

## 🚀 Quick Start - Add Your First Users

### **Step 1: Add a Rider User**
1. Open http://localhost:3002/users
2. Click "Add New User"
3. Fill in:
   - **First Name:** John
   - **Last Name:** Doe
   - **Email:** john@example.com
   - **Role:** Rider
4. Click "Add User"

### **Step 2: Add a Driver**
1. Go to http://localhost:3002/users
2. Click "Add New User"
3. Fill in:
   - **First Name:** Jane
   - **Last Name:** Smith
   - **Email:** jane@example.com
   - **Role:** Driver
4. Click "Add User"

### **Step 3: Upload Driver Documents (KYC)**
1. Go to http://localhost:3002/drivers
2. Find Jane Smith in the list
3. Click "View Documents" or "Manage KYC"
4. Upload:
   - Driver's License
   - Vehicle Registration
   - Insurance Certificate
5. Admin will verify and approve

### **Step 4: Assign Vehicle to Driver**
1. Go to http://localhost:3002/drivers
2. Click "Assign Vehicle" for the driver
3. Select vehicle type (Economy, Premium, SUV, Luxury)
4. Confirm assignment

### **Step 5: Set Up Pricing**
1. Go to http://localhost:3002/pricing
2. Configure:
   - Base fare: $2.50
   - Per km rate: $1.50
   - Per minute rate: $0.30
   - Surge pricing multipliers

---

## 🔗 API Endpoints Reference

### **Authentication**
```bash
# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"rider@test.com",
    "password":"pass123",
    "firstName":"John",
    "lastName":"Doe",
    "role":"rider"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rider@test.com","password":"pass123"}'
```

### **Trips**
```bash
# Estimate fare
curl -X POST http://localhost:3001/api/rider/trips/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation":{"lat":40.7128,"lng":-74.0060},
    "dropoffLocation":{"lat":40.7580,"lng":-73.9855}
  }'

# Create a trip
curl -X POST http://localhost:3001/api/rider/trips \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLocation":{"lat":40.7128,"lng":-74.0060},
    "dropoffLocation":{"lat":40.7580,"lng":-73.9855}
  }'
```

### **Admin Operations**
```bash
# Get all users
curl http://localhost:3001/api/admin/users

# Get all drivers
curl http://localhost:3001/api/admin/drivers

# Get all trips
curl http://localhost:3001/api/admin/trips

# Get vehicle types
curl http://localhost:3001/api/admin/vehicle-types

# Get pricing rules
curl http://localhost:3001/api/admin/pricing

# Get zones
curl http://localhost:3001/api/admin/zones

# Add new vehicle
curl -X POST http://localhost:3001/api/admin/fleet \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleTypeId":1,
    "driverId":1,
    "make":"Toyota",
    "model":"Prius",
    "year":2023,
    "color":"White",
    "licensePlate":"ABC123",
    "vin":"VIN123",
    "registrationNumber":"REG123"
  }'

# Approve driver
curl -X POST http://localhost:3001/api/admin/drivers/1/approve

# Get pending drivers (for approval)
curl http://localhost:3001/api/admin/drivers/pending-approval
```

---

## 📊 Current System State

### **Demo Data Available:**
- ✅ Pre-configured vehicle types (Economy, Premium, SUV, Luxury)
- ✅ Pre-configured pricing rules (standard, peak hours, evening surge)
- ✅ Pre-configured zones (Downtown, Airport)
- ✅ Sample users, trips, and drivers (created as you add them)

### **In-Memory Database:**
- Data stored in memory (resets when server restarts)
- Perfect for testing and development
- All CRUD operations work fully

---

## 🔐 Admin Login

The admin dashboard may require authentication. Check for:
- Default admin credentials (if configured)
- Login page at http://localhost:3002/login
- Token-based auth system ready

---

## 💡 What You Can Do Right Now

1. **Test User Onboarding**
   - Add riders via admin panel
   - Add drivers via admin panel
   - Upload driver documents

2. **Test Driver Approval Workflow**
   - Upload KYC documents
   - Admin verifies and approves
   - Assign vehicles to approved drivers

3. **Test Pricing & Zones**
   - Create custom vehicle types
   - Set surge pricing
   - Configure geofence zones

4. **Test Trip Management**
   - Create trips via API
   - Track trips through admin panel
   - View trip history

5. **Test Analytics**
   - View revenue reports
   - See trip statistics
   - Monitor driver performance

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3002 (admin)
lsof -ti:3002 | xargs kill -9
```

### Restart Services
```bash
# Restart backend
cd apps/backend && npm run demo

# Restart admin
cd apps/admin && npm run dev
```

### Check Health
```bash
curl http://localhost:3001/health
```

---

## 📞 Summary

**Your RideOn system includes:**
- ✅ Complete user management (riders & drivers)
- ✅ Driver onboarding with KYC/document verification
- ✅ Fleet management with vehicle tracking
- ✅ Advanced pricing with surge multipliers
- ✅ Geofencing with zone-based pricing
- ✅ Trip management and tracking
- ✅ Support ticket system
- ✅ Analytics and reporting
- ✅ Wallet and payout management
- ✅ Promotions and referrals
- ✅ Emergency/SOS features

Everything is ready to use! Start with the Admin Dashboard at **http://localhost:3002** 🎉
