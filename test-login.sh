#!/bin/bash

echo "Testing admin login..."

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rideon.com","password":"admin123"}'

echo ""
