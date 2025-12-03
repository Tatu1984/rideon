# 🚀 RideOn - Complete Startup Guide

## 📋 Step-by-Step Guide to Run Everything Locally

---

## ✅ STEP 1: START THE BACKEND SERVER

```bash
# Open Terminal 1
cd /Users/sudipto/Desktop/projects/rideon/apps/backend
npm run demo
```

**Expected Output:**
```
🚀 RideOn Demo API is running!
📍 Server: http://localhost:3001
```

**Verify it's working:**
```bash
curl http://localhost:3001/health
```

**Keep this terminal open!**

---

## ✅ STEP 2: START THE ADMIN PANEL

```bash
# Open Terminal 2 (NEW terminal window)
cd /Users/sudipto/Desktop/projects/rideon/apps/web
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3002
- Network:      http://10.147.19.121:3002
```

**Access Admin Panel:**
Open browser → `http://localhost:3002`

**Keep this terminal open!**

---

## ✅ STEP 3: START THE RIDER APP (Mobile)

```bash
# Open Terminal 3 (NEW terminal window)
cd /Users/sudipto/Desktop/projects/rideon/rider-app
REACT_NATIVE_PACKAGER_HOSTNAME=10.147.19.121 npx expo start --lan --port 8081
```

**Wait 1-2 minutes for Metro Bundler to start**

**Expected Output:**
```
Metro waiting on exp://10.147.19.121:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**You'll see a QR code - DON'T SCAN YET!**

**Keep this terminal open!**

---

## ✅ STEP 4: START THE DRIVER APP (Mobile)

```bash
# Open Terminal 4 (NEW terminal window)
cd /Users/sudipto/Desktop/projects/rideon/driver-app
REACT_NATIVE_PACKAGER_HOSTNAME=10.147.19.121 RCT_METRO_PORT=8082 npx expo start --lan --port 8082
```

**Wait 1-2 minutes for Metro Bundler to start**

**Expected Output:**
```
Metro waiting on exp://10.147.19.121:8082
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

**You'll see a QR code**

**Keep this terminal open!**

---

## ✅ STEP 5: TEST THE RIDER APP ON YOUR PHONE

### 5.1 Install Expo Go
- **Android:** Download "Expo Go" from Google Play Store
- **iOS:** Download "Expo Go" from App Store

### 5.2 Scan QR Code
1. Make sure phone and Mac are on **same WiFi**
2. Open **Expo Go** app on phone
3. Tap **"Scan QR Code"**
4. Scan the QR code from **Terminal 3** (Rider app)
5. App will load in 10-30 seconds

### 5.3 Login/Register
**On phone:**
- Tap **"Create New Account"**
- Email: `rider1@test.com`
- Password: `password123`
- Name: Your Name
- Tap **"Register"**

**Expected Result:** You see the Home screen with Google Maps!

---

## ✅ STEP 6: TEST THE DRIVER APP ON YOUR PHONE

### 6.1 Scan Driver App QR Code
1. **Close the Rider app** (or use a second phone)
2. Open **Expo Go** again
3. Tap **"Scan QR Code"**
4. Scan the QR code from **Terminal 4** (Driver app)
5. App will load

### 6.2 Login/Register
**On phone:**
- Tap **"Create New Account"**
- Email: `driver1@test.com`
- Password: `password123`
- Name: Driver Name
- Tap **"Register"**

**Expected Result:** You see the Home screen with Map and "Go Online" button!

### 6.3 Go Online
- Tap the **"Go Online"** toggle
- Button turns green
- Driver is now ready to receive trips

---

## 🧪 STEP 7: TEST COMPLETE BOOKING FLOW

### On Rider App (Phone 1):
1. Enter pickup: `123 Main Street`
2. Enter dropoff: `456 Market Street`
3. Tap **"Search Rides"**
4. Select **"Economy"** vehicle
5. Review fare: ~$12.50
6. Tap **"Confirm Ride"**
7. **Result:** "Finding a driver..." message

### On Driver App (Phone 2 or switch):
1. You'll see **Trip Request popup**
2. Shows: Pickup, Dropoff, Fare
3. **30 second countdown** starts
4. Tap **"Accept Trip"**

### Back on Rider App:
1. See **"Driver is on the way"**
2. See driver's location on map
3. See driver details (name, rating, vehicle)

### On Driver App:
1. Tap **"Arrive at Pickup"**
2. Tap **"Start Trip"**
3. Tap **"Complete Trip"**

### Final Step - Both Apps:
1. Rider rates driver ⭐⭐⭐⭐⭐
2. Trip appears in history
3. Driver sees earnings updated

---

## 📊 QUICK SUMMARY - ALL COMMANDS

```bash
# Terminal 1 - Backend
cd /Users/sudipto/Desktop/projects/rideon/apps/backend && npm run demo

# Terminal 2 - Admin Panel
cd /Users/sudipto/Desktop/projects/rideon/apps/web && npm run dev

# Terminal 3 - Rider App
cd /Users/sudipto/Desktop/projects/rideon/rider-app && REACT_NATIVE_PACKAGER_HOSTNAME=10.147.19.121 npx expo start --lan --port 8081

# Terminal 4 - Driver App
cd /Users/sudipto/Desktop/projects/rideon/driver-app && REACT_NATIVE_PACKAGER_HOSTNAME=10.147.19.121 RCT_METRO_PORT=8082 npx expo start --lan --port 8082
```

---

## 🔍 VERIFY EVERYTHING IS RUNNING

### Check Ports
```bash
# Backend (should return process ID)
lsof -ti:3001

# Admin Panel (should return process ID)
lsof -ti:3002

# Rider App (should return process ID)
lsof -ti:8081

# Driver App (should return process ID)
lsof -ti:8082
```

### Check URLs
- Backend API: http://localhost:3001/health
- Admin Panel: http://localhost:3002
- Rider App: Check Terminal 3 for QR code
- Driver App: Check Terminal 4 for QR code

---

## 🛑 HOW TO STOP EVERYTHING

### Stop Backend
```bash
# In Terminal 1, press: Ctrl + C
```

### Stop Admin Panel
```bash
# In Terminal 2, press: Ctrl + C
```

### Stop Rider App
```bash
# In Terminal 3, press: Ctrl + C
```

### Stop Driver App
```bash
# In Terminal 4, press: Ctrl + C
```

### Kill All Processes (Nuclear Option)
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:8081 | xargs kill -9
lsof -ti:8082 | xargs kill -9
pkill -f "expo start"
```

---

## ⚠️ TROUBLESHOOTING

### Problem: "Port already in use"
```bash
# Kill the process on that port
lsof -ti:3001 | xargs kill -9  # Replace 3001 with your port
```

### Problem: "Cannot connect to backend"
**Solution:**
1. Check backend is running: `lsof -ti:3001`
2. Verify your Mac's IP hasn't changed:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
3. If IP changed, update these files:
   - `/rider-app/src/config/constants.js` → Line 2: `API_URL`
   - `/driver-app/src/services/api.service.js` → Line 4: `API_URL`

### Problem: "QR code not showing"
**Solution:**
Wait 2-3 minutes for Metro Bundler to finish starting. Look for:
```
Metro waiting on exp://10.147.19.121:8081
```

### Problem: "App crashes on phone"
**Solution:**
1. Shake phone
2. Tap "Reload"
3. Check Terminal for error logs

### Problem: "Network request failed" on phone
**Solution:**
1. Make sure phone and Mac are on **same WiFi**
2. Check Mac's firewall isn't blocking connections
3. Try restarting Expo:
   ```bash
   # Press Ctrl+C in terminal, then:
   REACT_NATIVE_PACKAGER_HOSTNAME=10.147.19.121 npx expo start --lan
   ```

---

## 📱 DEMO ACCOUNTS

### Rider Accounts (Auto-created)
- `rider1@test.com` / any password
- `john@example.com` / any password
- `test@rider.com` / any password

### Driver Accounts (Auto-created)
- `driver1@test.com` / any password
- `john@driver.com` / any password
- `test@driver.com` / any password

**Note:** Backend creates accounts automatically with ANY email!

---

## ✅ CHECKLIST - EVERYTHING WORKING

- [ ] Backend running on port 3001
- [ ] Admin Panel accessible at localhost:3002
- [ ] Rider App showing QR code on port 8081
- [ ] Driver App showing QR code on port 8082
- [ ] Can login to Rider app on phone
- [ ] Can login to Driver app on phone
- [ ] Rider can see map and search rides
- [ ] Driver can toggle online/offline
- [ ] Can book a trip from Rider → Driver receives it
- [ ] Can complete full trip flow
- [ ] Trip shows in history on both apps

---

## 🎉 READY TO GO!

**You now have:**
- ✅ Backend API running
- ✅ Admin Panel running
- ✅ Rider mobile app running
- ✅ Driver mobile app running

**All connected and working together!**

Start with **STEP 1** above and follow each step in order.

---

**Need help?** Check the detailed guides:
- [COMPLETE_APPS_GUIDE.md](COMPLETE_APPS_GUIDE.md)
- [FINAL_DELIVERY.md](FINAL_DELIVERY.md)
