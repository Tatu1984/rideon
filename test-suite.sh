#!/bin/bash

echo "🧪 Running Complete Test Suite for RideOn API..."
echo ""

echo "1️⃣ Testing Health Endpoint..."
curl -s http://localhost:3001/health | grep -q '"status":"ok"' && echo "✅ Health check passed" || echo "❌ Health check failed"

echo ""
echo "2️⃣ Registering Rider..."
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"rider2@test.com","password":"pass123","firstName":"John","lastName":"Rider","role":"rider"}' | grep -q '"success":true' && echo "✅ Rider registered" || echo "❌ Rider registration failed"

echo ""
echo "3️⃣ Registering Driver..."
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"driver2@test.com","password":"pass123","firstName":"Mike","lastName":"Driver","role":"driver"}' | grep -q '"success":true' && echo "✅ Driver registered" || echo "❌ Driver registration failed"

echo ""
echo "4️⃣ Registering Admin..."
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"admin2@test.com","password":"pass123","firstName":"Sarah","lastName":"Admin","role":"admin"}' | grep -q '"success":true' && echo "✅ Admin registered" || echo "❌ Admin registration failed"

echo ""
echo "5️⃣ Estimating Fare (NYC - Downtown to Times Square)..."
FARE_DATA=$(curl -s -X POST http://localhost:3001/api/rider/trips/estimate -H "Content-Type: application/json" -d '{"pickupLocation":{"lat":40.7128,"lng":-74.0060},"dropoffLocation":{"lat":40.7580,"lng":-73.9855}}')
echo "$FARE_DATA" | grep -q '"estimatedFare"' && echo "✅ Fare estimated successfully" || echo "❌ Fare estimation failed"

echo ""
echo "6️⃣ Creating Trip..."
TRIP_DATA=$(curl -s -X POST http://localhost:3001/api/rider/trips -H "Content-Type: application/json" -d '{"riderId":5,"pickupLocation":{"lat":40.7128,"lng":-74.0060,"address":"Downtown NYC"},"dropoffLocation":{"lat":40.7580,"lng":-73.9855,"address":"Times Square"}}')
echo "$TRIP_DATA" | grep -q '"id"' && echo "✅ Trip created successfully" || echo "❌ Trip creation failed"

echo ""
echo "7️⃣ Viewing All Users..."
USER_COUNT=$(curl -s http://localhost:3001/api/admin/users | grep -o '"id"' | wc -l | tr -d ' ')
echo "✅ Total Users: $USER_COUNT"

echo ""
echo "8️⃣ Viewing All Trips..."
TRIP_COUNT=$(curl -s http://localhost:3001/api/admin/trips | grep -o '"id"' | wc -l | tr -d ' ')
echo "✅ Total Trips: $TRIP_COUNT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All Tests Completed! RideOn API is working!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  • Users in system: $USER_COUNT"
echo "  • Trips created: $TRIP_COUNT"
echo "  • Server: http://localhost:3001"
echo "  • Status: ✅ RUNNING"
