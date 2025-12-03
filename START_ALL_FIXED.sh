#!/bin/bash

echo "🚀 Starting ALL RideOn Services (FIXED)..."
echo ""

# Kill all existing processes
pkill -9 node 2>/dev/null
pkill -9 -f expo 2>/dev/null
lsof -ti:3000,3001,8081,8082,8083 | xargs kill -9 2>/dev/null
sleep 3

# Start Backend in new terminal
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/apps/backend && echo \"🔥 BACKEND API - Port 3001\" && echo \"\" && npm run demo"'

sleep 5

# Start Admin Panel in new terminal
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/apps/web && echo \"🌐 ADMIN PANEL - Port 3000\" && echo \"\" && npm run dev"'

sleep 5

# Start Rider App on port 8081
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/rider-app && echo \"📱 RIDER APP - Port 8081\" && echo \"Wait for QR code...\" && echo \"\" && npx expo start --clear --port 8081"'

sleep 3

# Start Driver App on port 8082
osascript -e 'tell application "Terminal" to do script "cd /Users/sudipto/Desktop/projects/rideon/driver-app && echo \"🚗 DRIVER APP - Port 8082\" && echo \"Wait for QR code...\" && echo \"\" && npx expo start --clear --port 8082"'

echo ""
echo "✅ ALL SERVICES STARTING!"
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║          RIDEON CREDENTIALS                ║"
echo "╠════════════════════════════════════════════╣"
echo "║ Admin Panel: http://localhost:3000        ║"
echo "║   Email: admin@rideon.com                 ║"
echo "║   Password: admin123                      ║"
echo "║                                            ║"
echo "║ Backend: http://localhost:3001            ║"
echo "║                                            ║"
echo "║ Rider App: Port 8081 (scan QR)            ║"
echo "║   Login: ANY email (auto-created)         ║"
echo "║                                            ║"
echo "║ Driver App: Port 8082 (scan QR)           ║"
echo "║   Login: ANY email (auto-created)         ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "⏰ Wait 2-3 minutes for mobile QR codes"
