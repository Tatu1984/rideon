# 🔐 RideOn - Login Credentials & Access Guide

## 📱 Mobile Apps (Expo Go)

### Rider App
**Port:** 8081 (or 8088)
**URL:** `exp://192.168.0.158:8081`

**Test Account:**
- Email: `rider@test.com`
- Password: `password123`

**Or register a new account:**
- Any email works
- Password: Minimum 6 characters
- Role: Select "Rider"

---

### Driver App
**Port:** 8082
**URL:** `exp://192.168.0.158:8082`

**Test Account:**
- Email: `driver@test.com`
- Password: `password123`

**Or register a new account:**
- Any email works
- Password: Minimum 6 characters
- Role: Select "Driver"

---

## 💻 Web Applications

### Admin Panel
**URL:** http://localhost:3000

**Admin Account:**
- Email: `admin@rideon.com`
- Password: `admin123`

**Features:**
- Dashboard with real-time analytics
- User management (riders & drivers)
- Driver verification
- Trip monitoring
- Payment oversight
- Promo code management
- Support tickets

---

### Backend API
**URL:** http://localhost:3001
**Health Check:** http://localhost:3001/health
**API Docs:** See `API_DOCUMENTATION.md`

**Auth Endpoints:**
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/refresh` - Refresh token
- POST `/api/v1/auth/logout` - Logout
- GET `/api/v1/auth/profile` - Get profile

---

## 🚀 Quick Start Guide

### 1. Start Backend (Required)
```bash
cd apps/backend
npm install
npm run dev
```

### 2. Start Admin Panel (Optional)
```bash
cd apps/web
npm install
npm run dev
```

### 3. Start Rider App
```bash
cd rider-app
npx expo start
```
Then scan QR code with iPhone Camera app or enter URL manually in Expo Go.

### 4. Start Driver App
```bash
cd driver-app
npx expo start
```
Scan QR code or enter URL in Expo Go.

---

## 📲 How to Login on Mobile

### First Time Setup:
1. **Install Expo Go** from App Store (iOS) or Play Store (Android)
2. Make sure your phone and computer are on the **same WiFi**
3. Run the app (rider-app or driver-app)
4. **Scan QR code** that appears in terminal

### Login Screen:
1. Tap "Login" button
2. Enter email: `rider@test.com` or `driver@test.com`
3. Enter password: `password123`
4. Tap "Sign In"

### Or Register:
1. Tap "Sign Up" link
2. Fill in:
   - Email
   - Password (min 6 chars)
   - First Name
   - Last Name
   - Phone (optional)
3. Select role: Rider or Driver
4. Tap "Register"

---

## 🔑 All Test Credentials

| Platform | Email | Password | Role |
|----------|-------|----------|------|
| Admin Panel | admin@rideon.com | admin123 | Admin |
| Rider App | rider@test.com | password123 | Rider |
| Driver App | driver@test.com | password123 | Driver |

---

## 🛠️ Database Setup (If Needed)

If you need to reset or seed the database:

```bash
cd apps/backend

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

---

## ⚠️ Important Notes

1. **WiFi Connection:** Phone and computer must be on same network
2. **Expo Go:** Maps won't work in Expo Go (requires custom build)
3. **Auto-Registration:** Apps create accounts automatically on signup
4. **Password:** All test accounts use `password123`
5. **Backend Required:** Backend must be running for apps to work

---

## 🐛 Troubleshooting

### Can't Login?
1. Check backend is running: http://localhost:3001/health
2. Verify email/password are correct
3. Try registering a new account

### App Crashes?
1. Reload: Shake phone → tap "Reload"
2. Clear cache: `npx expo start --clear`
3. Reinstall: Delete node_modules → `npm install`

### No QR Code?
Run directly in terminal (not in IDE):
```bash
cd rider-app
npx expo start
```

---

## 📞 Support

For issues, check:
- API_DOCUMENTATION.md - Full API reference
- README.md - Project overview
- GitHub Issues - Report problems

---

**Your Local IP:** 192.168.0.158
**Make sure all devices are on the same network!**
