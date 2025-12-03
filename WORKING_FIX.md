# 🔧 ONE-TIME FIX - GUARANTEED TO WORK

## 🔐 ADMIN PANEL LOGIN

```
URL: http://localhost:3002
Email: admin@rideon.com
Password: admin123
```

---

## 📱 MOBILE APPS - WORKING FIX

### ✅ OPTION 1: Simple Scripts (RECOMMENDED)

**Open TWO terminal windows:**

**Terminal 1 - Rider App:**
```bash
cd /Users/sudipto/Desktop/projects/rideon/rider-app
npx expo start --clear --lan
```

**Terminal 2 - Driver App:**
```bash
cd /Users/sudipto/Desktop/projects/rideon/driver-app
npx expo start --clear --lan
```

Wait 1-2 minutes for QR codes to appear, then scan with Expo Go!

---

### ✅ OPTION 2: Using Scripts

**Terminal 1:**
```bash
/Users/sudipto/Desktop/projects/rideon/start-rider-app.sh
```

**Terminal 2:**
```bash
/Users/sudipto/Desktop/projects/rideon/start-driver-app.sh
```

---

## 🧪 TEST IT NOW

### Step 1: Start Rider App
1. Open Terminal
2. Run:
   ```bash
   cd /Users/sudipto/Desktop/projects/rideon/rider-app
   npx expo start --clear --lan
   ```
3. Wait for QR code (30-60 seconds)
4. **Open Expo Go** on your phone
5. **Scan the QR code**
6. App loads → Login screen appears!

### Step 2: Login
- Email: `test@test.com`
- Password: `anything`
- Tap **Register** or **Login**
- **RESULT:** Home screen with map!

---

## 🚗 TESTING DRIVER APP

### Step 1: Start Driver App
1. **Open NEW Terminal window**
2. Run:
   ```bash
   cd /Users/sudipto/Desktop/projects/rideon/driver-app
   npx expo start --clear --lan
   ```
3. Wait for QR code
4. Scan with Expo Go
5. Login: `driver@test.com` / `anything`
6. **RESULT:** Home screen with map and "Go Online" button!

---

## ⚠️ IF IT STILL DOESN'T WORK

Run this first to completely clean everything:

```bash
cd /Users/sudipto/Desktop/projects/rideon

# Clean Rider App
cd rider-app
rm -rf .expo node_modules/.cache
npm cache clean --force

# Clean Driver App
cd ../driver-app
rm -rf .expo node_modules/.cache
npm cache clean --force

# Now start Rider app
cd ../rider-app
npx expo start --clear --tunnel
```

The `--tunnel` flag will work even if your network has issues!

---

## 📊 VERIFY BACKEND IS RUNNING

Before starting mobile apps, make sure backend is running:

```bash
# Check if backend is running
curl http://localhost:3001/health

# If nothing, start it:
cd /Users/sudipto/Desktop/projects/rideon/apps/backend
npm run demo
```

---

## 🎯 QUICK TEST - RIDER APP ONLY

**Run this ONE command:**

```bash
cd /Users/sudipto/Desktop/projects/rideon/rider-app && npx expo start --clear --lan
```

**Then:**
1. Wait for QR code (1 minute)
2. Open Expo Go on phone
3. Scan QR code
4. Login with ANY email
5. You'll see the map!

**That's it!**

---

## 💡 DEMO CREDENTIALS

**Backend auto-creates accounts for ANY email!**

**Rider:**
- Email: `rider@test.com`
- Password: `123456`

**Driver:**
- Email: `driver@test.com`
- Password: `123456`

**Admin Panel:**
- Email: `admin@rideon.com`
- Password: `admin123`
- URL: `http://localhost:3002`

---

## 🔥 NUCLEAR OPTION - Complete Reset

If nothing works, run this complete reset:

```bash
cd /Users/sudipto/Desktop/projects/rideon

# Kill everything
pkill -9 -f expo
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:8082 | xargs kill -9 2>/dev/null

# Clean Rider app
cd rider-app
rm -rf .expo node_modules
npm install --legacy-peer-deps
npx expo start --clear

# In a NEW terminal, clean Driver app
cd /Users/sudipto/Desktop/projects/rideon/driver-app
rm -rf .expo node_modules
npm install --legacy-peer-deps
npx expo start --clear
```

---

## ✅ SUCCESS INDICATORS

**Rider App Working:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go
```

**You should see:**
- QR code in terminal
- URL like `exp://10.147.19.121:8081`
- "Logs for your project will appear below"

**On Phone after scanning:**
- Expo Go loads the app
- You see the Login screen
- Purple theme (#7C3AED color)
- "RideOn" title with car emoji 🚗

---

## 📱 TESTING CHECKLIST

- [ ] Backend running on port 3001
- [ ] Rider app terminal showing QR code
- [ ] Scanned QR with Expo Go
- [ ] App loaded on phone
- [ ] Login screen visible
- [ ] Can create account
- [ ] See home screen with map

**Once you see the LOGIN SCREEN on your phone, it's working!**
