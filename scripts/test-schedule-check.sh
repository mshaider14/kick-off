#!/bin/bash

# Test script for schedule check endpoint
# Usage: ./scripts/test-schedule-check.sh [APP_URL] [TOKEN]

APP_URL=${1:-"http://localhost:3000"}
TOKEN=${2:-"test-token"}

echo "Testing schedule check endpoint..."
echo "URL: $APP_URL/api/schedule/check?token=$TOKEN"
echo ""

response=$(curl -s -X POST "$APP_URL/api/schedule/check?token=$TOKEN")

echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"

echo ""
echo "Done!"
