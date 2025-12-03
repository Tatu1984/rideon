#!/bin/bash

echo "🚀 Starting Rider App..."
echo ""
echo "This will take 30-60 seconds..."
echo ""

cd /Users/sudipto/Desktop/projects/rideon/rider-app

# Clear cache
rm -rf .expo
rm -rf node_modules/.cache

# Start Expo
npx expo start --clear --lan

echo ""
echo "✅ Rider App is ready!"
echo "📱 Scan the QR code above with Expo Go app"
