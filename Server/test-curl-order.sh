#!/bin/bash

echo "🧪 Testing Cashfree Order Creation with cURL..."
echo "=============================================="

# Test endpoint - Using the enhanced payment endpoint
API_URL="http://localhost:10000/api/enhanced-payment/create-order"

# Test payload
PAYLOAD='{
  "amount": 100,
  "customerName": "Test Customer",
  "customerEmail": "test@example.com",
  "customerPhone": "9999999999"
}'

echo "📋 Testing order creation..."
echo "🔗 API URL: $API_URL"
echo "📦 Payload: $PAYLOAD"
echo ""

# First, let's test if the server is running
echo "🔍 Testing server availability..."
curl -s -o /dev/null -w "📊 Server Status: %{http_code}\n" http://localhost:10000/

echo ""
echo "🚀 Making cURL request for order creation..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Host: localhost:3000" \
  -d "$PAYLOAD" \
  -w "\n\n📊 Response Code: %{http_code}\n⏱️  Response Time: %{time_total}s\n" \
  -v

echo ""
echo "🔄 Also testing the GET endpoint for comparison..."
GET_URL="http://localhost:10000/api/enhanced-payment/create_order?amount=100&name=Test%20Customer&email=test@example.com&phone=9999999999"
echo "🔗 GET URL: $GET_URL"

curl -X GET "$GET_URL" \
  -H "Accept: application/json" \
  -H "Host: localhost:3000" \
  -w "\n\n📊 GET Response Code: %{http_code}\n" \
  -v

echo ""
echo "✅ cURL test completed!"
echo ""
echo "📋 Expected behaviors:"
echo "   ✅ Always uses PRODUCTION mode"
echo "   ✅ Generates HTTPS return URLs"
echo "   ✅ Loads credentials from Admin Panel"
echo "   ✅ Returns payment link or error message"
echo ""
echo "💡 Note: If you see credential errors, configure them in Admin Panel:"
echo "   Go to: /myadmin/env > Payment"
echo "   Set: CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENVIRONMENT"
