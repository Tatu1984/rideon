# RideOn - Quick Start Guide

## 🚀 Run the Project in 5 Minutes

### 1. Start the Admin Panel & Backend

```bash
# Terminal 1: Start Backend API
cd ~/Desktop/projects/rideon/apps/backend
npm run demo
# Backend running at: http://localhost:3001

# Terminal 2: Start Admin Panel
cd ~/Desktop/projects/rideon/apps/admin
npm run dev
# Admin panel running at: http://localhost:3002
```

### 2. Access Admin Panel

Open browser: **http://localhost:3002**

**Login Credentials:**
- Email: `admin@rideon.com`
- Password: `admin123`

### 3. Test Admin Features

✅ **Manual Add User (Rider):**
1. Go to Users page
2. Click "+ Add User"
3. Fill form: First Name, Last Name, Email, Phone, Role
4. Click "Add User"
5. User created instantly as approved

✅ **Add Team Member (Employee):**
1. Go to Team Management page
2. Click "+ Add Team Member"
3. Select role (Dispatcher, Manager, Support, etc.)
4. Assign permissions
5. Save

✅ **View Pending Approvals:**
1. Go to Pending Approvals page
2. See pending drivers and users
3. Review details
4. Approve or reject

---

## 📱 Run the Driver App

### Option 1: Using Expo Go (Fastest - Recommended)

```bash
cd ~/Desktop/projects/rideon/driver-app

# Start Expo development server
npx expo start

# On your Android phone:
# 1. Install "Expo Go" app from Play Store
# 2. Scan the QR code displayed in terminal
# 3. App will load on your phone
```

### Option 2: Android Emulator

```bash
cd ~/Desktop/projects/rideon/driver-app

# Install dependencies (if not already done)
npm install --force

# Start and run on Android emulator
npx expo start --android
```

### Option 3: Fix npm Issues First

```bash
# If npm install keeps failing, try:

# Clear cache
npm cache clean --force

# Install with force flag
npm install --force

# Or fix permissions
sudo chown -R $(whoami) ~/.npm

# Then run
npx expo start
```

---

## 📊 Project URLs

| Service | URL | Status |
|---------|-----|--------|
| Admin Panel | http://localhost:3002 | ✅ Running |
| Backend API | http://localhost:3001 | ✅ Running |
| API Health | http://localhost:3001/api/health | ✅ Available |
| Driver App | Expo Go / Emulator | 🔨 Ready to test |

---

## 🗂️ Project Structure

```
rideon/
├── apps/
│   ├── admin/          ← Admin Panel (Next.js)
│   ├── backend/        ← Backend API (Express)
│   └── web/            ← Landing page
├── driver-app/         ← Driver Mobile App (React Native)
├── rider-app/          ← Rider App (Not started yet)
└── *.md               ← Documentation files
```

---

## ⚡ Quick Commands

### Admin Panel
```bash
# Start admin
cd apps/admin && npm run dev

# Stop admin (Ctrl+C in terminal)
```

### Backend API
```bash
# Start backend
cd apps/backend && npm run demo

# Stop backend (Ctrl+C in terminal)
```

### Driver App
```bash
# Start driver app
cd driver-app && npx expo start

# Run on Android
npx expo start --android

# Run on iOS (not needed for this project)
npx expo start --ios
```

---

## 🔧 Troubleshooting

### Admin Panel Not Loading?
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# If not running, start it
cd apps/backend && npm run demo
```

### Driver App npm Issues?
```bash
# Use force install
npm install --force

# Or just use expo directly (downloads dependencies automatically)
npx expo start
```

### Port Already in Use?
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3002 (admin)
lsof -ti:3002 | xargs kill -9
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `PROJECT_STATUS.md` | Complete project overview |
| `FINAL_ADMIN_STATUS.md` | Admin panel features and testing |
| `ADMIN_UPDATES.md` | Latest admin panel updates |
| `MOBILE_APPS_SPEC.md` | Complete mobile app specifications |
| `DRIVER_APP_STRUCTURE.md` | Driver app architecture |
| `DRIVER_APP_COMPLETE_SUMMARY.md` | Driver app implementation status |
| `QUICK_START_GUIDE.md` | This file |

---

## ✅ What's Working Now

### Admin Panel (100%)
- ✅ All 21 pages functional
- ✅ Manual add for Users, Drivers, Team
- ✅ Approval workflow
- ✅ Team management with RBAC
- ✅ 97+ API endpoints

### Driver App (75%)
- ✅ Login & Registration (4-step process)
- ✅ Home screen with map
- ✅ Online/Offline toggle
- ✅ Trip request modal (30-second countdown)
- ✅ Earnings dashboard
- ✅ Trip history
- ✅ Profile & settings
- ⏳ Navigation (placeholder)
- ⏳ Documents, Vehicle, Bank screens (placeholders)

---

## 🎯 Next Steps

1. **Test Admin Panel:**
   - Go to http://localhost:3002
   - Try adding users, drivers, team members
   - Test approval workflow

2. **Test Driver App:**
   - Run `npx expo start` in driver-app folder
   - Use Expo Go on Android phone
   - Test login/registration
   - See home screen with map

3. **Push to GitHub:**
   - When you're happy with testing
   - Push entire rideon folder to GitHub
   - Include all files and folders

4. **Next Development Phase:**
   - Complete driver app remaining screens
   - Build rider app
   - Add real-time features
   - Deploy to production

---

## 💡 Pro Tips

1. **Keep Backend Running:** Admin panel needs backend API to work
2. **Use Expo Go:** Fastest way to test driver app on real device
3. **Check Logs:** Terminal shows errors and requests in real-time
4. **Hot Reload:** Changes auto-reload in both admin and driver app
5. **Documentation:** Refer to PROJECT_STATUS.md for complete details

---

## 🎉 You're All Set!

Your RideOn platform is ready to test. Start with the admin panel, then try the driver app. Both are functional and ready for demonstration.

**Happy Testing!** 🚀
