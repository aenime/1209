#!/bin/bash

echo "🧪 Testing Improved Payment Return URL Handler..."
echo "=================================================="
echo ""

# Wait for server
sleep 2

echo "📋 Test 1: Return URL with missing order_id but SUCCESS status"
echo "🔗 Simulating successful payment without order_id"
curl -i "http://localhost:10000/api/enhanced-payment/return?payment_status=SUCCESS&status=SUCCESS" \
  -w "\n📊 Status: %{http_code}\n" 2>/dev/null | grep -E "HTTP|Location:"

echo ""
echo "----------------------------------------"
echo ""

echo "📋 Test 2: Return URL with cf_order_id instead of order_id"
echo "🔗 Testing alternative parameter name"
curl -i "http://localhost:10000/api/enhanced-payment/return?cf_order_id=TEST123&payment_status=SUCCESS" \
  -w "\n📊 Status: %{http_code}\n" 2>/dev/null | grep -E "HTTP|Location:"

echo ""
echo "----------------------------------------"
echo ""

echo "📋 Test 3: POST request with order data in body"
echo "🔗 Testing POST method with JSON body"
curl -i -X POST "http://localhost:10000/api/enhanced-payment/return" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "TEST_POST_123", "payment_status": "SUCCESS"}' \
  -w "\n📊 Status: %{http_code}\n" 2>/dev/null | grep -E "HTTP|Location:"

echo ""
echo "----------------------------------------"
echo ""

echo "📋 Test 4: Return URL with payment_session_id"
echo "🔗 Testing with session ID parameter"
curl -i "http://localhost:10000/api/enhanced-payment/return?payment_session_id=session123&payment_status=SUCCESS" \
  -w "\n📊 Status: %{http_code}\n" 2>/dev/null | grep -E "HTTP|Location:"

echo ""
echo "=========================================="
echo "✅ Improved Return URL Testing Complete!"
echo ""
echo "📋 Expected Behaviors:"
echo "   ✅ Missing order_id + SUCCESS → /thankyou (unverified)"
echo "   ✅ Alternative parameter names → proper extraction"
echo "   ✅ POST requests → handled same as GET"
echo "   ✅ Detailed logging → for debugging"
