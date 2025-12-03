#!/bin/bash

echo "🚗 Starting Driver App..."
echo ""
echo "This will take 30-60 seconds..."
echo ""

cd /Users/sudipto/Desktop/projects/rideon/driver-app

# Clear cache
rm -rf .expo
rm -rf node_modules/.cache

# Start Expo
npx expo start --clear --lan

echo ""
echo "✅ Driver App is ready!"
echo "📱 Scan the QR code above with Expo Go app"
