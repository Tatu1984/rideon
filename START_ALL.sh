#!/bin/bash

echo "🚀 Starting ALL RideOn Services..."
echo ""

# Kill all existing processes
pkill -9 node 2>/dev/null
pkill -9 -f expo 2>/dev/null
lsof -ti:3000,3001,8081,8082 | xargs kill -9 2>/dev/null
sleep 2

# Start Backend in new terminal
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/apps/backend && echo \"🔥 Starting Backend API on port 3001...\" && npm run demo"'

# Wait for backend
sleep 5

# Start Admin Panel in new terminal
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/apps/web && echo \"🌐 Starting Admin Panel on port 3000...\" && npm run dev"'

# Wait for admin
sleep 5

# Start Rider App in new terminal
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/rider-app && echo \"📱 Starting Rider App on port 8081...\" && echo \"Wait for QR code to appear...\" && npx expo start --clear"'

# Start Driver App in new terminal
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/driver-app && echo \"🚗 Starting Driver App on port 8082...\" && echo \"Wait for QR code to appear...\" && npx expo start --clear"'

echo ""
echo "✅ All services starting in separate terminals!"
echo ""
echo "📋 CREDENTIALS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Admin Panel: http://localhost:3000"
echo "  Email: admin@rideon.com"
echo "  Password: admin123"
echo ""
echo "Backend API: http://localhost:3001"
echo ""
echo "Rider App: Port 8081 (scan QR with Expo Go)"
echo "  Login: ANY email (e.g., test@test.com)"
echo ""
echo "Driver App: Port 8082 (scan QR with Expo Go)"
echo "  Login: ANY email (e.g., driver@test.com)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏰ Wait 2-3 minutes for mobile apps to show QR codes"
