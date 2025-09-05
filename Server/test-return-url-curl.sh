#!/bin/bash

echo "🧪 Testing Payment Return URLs with cURL..."
echo "=================================================="
echo ""

# Wait for server to be ready
sleep 2

# Test 1: Payment Success Scenario
echo "📋 Test 1: Payment Success Scenario"
echo "🔗 URL: /api/enhanced-payment/return?order_id=TEST_SUCCESS&payment_status=SUCCESS"
echo ""

curl -i "http://localhost:10000/api/enhanced-payment/return?order_id=TEST_SUCCESS&payment_status=SUCCESS&order_status=PAID" \
  -w "\n📊 Status Code: %{http_code}\n🕐 Response Time: %{time_total}s\n" \
  -L --max-redirs 0 2>/dev/null

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Payment Failure Scenario  
echo "📋 Test 2: Payment Failure Scenario"
echo "🔗 URL: /api/enhanced-payment/return?order_id=TEST_FAIL&payment_status=FAILED"
echo ""

curl -i "http://localhost:10000/api/enhanced-payment/return?order_id=TEST_FAIL&payment_status=FAILED&order_status=ACTIVE" \
  -w "\n📊 Status Code: %{http_code}\n🕐 Response Time: %{time_total}s\n" \
  -L --max-redirs 0 2>/dev/null

echo ""
echo "----------------------------------------"
echo ""

# Test 3: Missing Order ID Scenario
echo "📋 Test 3: Missing Order ID Scenario"
echo "🔗 URL: /api/enhanced-payment/return?payment_status=SUCCESS"
echo ""

curl -i "http://localhost:10000/api/enhanced-payment/return?payment_status=SUCCESS" \
  -w "\n📊 Status Code: %{http_code}\n🕐 Response Time: %{time_total}s\n" \
  -L --max-redirs 0 2>/dev/null

echo ""
echo "----------------------------------------"
echo ""

# Test 4: Payment Pending Scenario
echo "📋 Test 4: Payment Pending Scenario"
echo "🔗 URL: /api/enhanced-payment/return?order_id=TEST_PENDING&payment_status=PENDING"
echo ""

curl -i "http://localhost:10000/api/enhanced-payment/return?order_id=TEST_PENDING&payment_status=PENDING&order_status=ACTIVE" \
  -w "\n📊 Status Code: %{http_code}\n🕐 Response Time: %{time_total}s\n" \
  -L --max-redirs 0 2>/dev/null

echo ""
echo "=========================================="
echo "✅ Return URL Testing Complete!"
echo ""
echo "📋 Expected Redirect Behaviors:"
echo "   ✅ Success  → http://localhost:3000/thankyou"
echo "   ❌ Failure  → http://localhost:3000/cart"
echo "   ❓ Pending  → http://localhost:3000/cart"
echo "   🚫 No Order → http://localhost:3000/cart"
echo ""
echo "💡 All scenarios should return HTTP 302 (redirect)"
echo "🔗 Location header shows the final destination URL"
