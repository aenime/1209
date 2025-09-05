#!/bin/bash

# Verification Script: Dynamic URL Implementation
# This script verifies that all hardcoded URLs have been replaced with dynamic detection

echo "🔍 Verifying Dynamic URL Implementation..."
echo ""

# Check .env files
echo "📁 Checking .env files:"
echo "Root .env file:"
grep "APP_BASE_URL" .env | head -1
echo "Server .env file:"
grep "APP_BASE_URL" Server/.env | head -1
echo "Test .env file:"
grep "APP_BASE_URL" Server/.env.cashfree-test | head -1
echo ""

# Check for any remaining hardcoded URLs in code files
echo "🔍 Searching for hardcoded URLs in code files:"
hardcoded_urls=$(find . -name "*.js" -exec grep -l "deepskyblue-mule-970118.hostingersite.com" {} \; 2>/dev/null)
if [ -z "$hardcoded_urls" ]; then
    echo "✅ No hardcoded URLs found in JavaScript files"
else
    echo "❌ Found hardcoded URLs in:"
    echo "$hardcoded_urls"
fi
echo ""

# Check payment controllers for proper redirection logic
echo "🔄 Checking payment redirection logic:"
echo "Enhanced Payment Controller:"
grep -n "thankyou\|cart" Server/Controller/EnhancedPaymentController.js | head -3
echo ""
echo "Payment Controller:"
grep -n "thankyou\|cart" Server/Controller/Payment.controller.js | head -3
echo ""

echo "✅ Verification Complete!"
echo ""
echo "📋 Expected Behavior:"
echo "• Payment Success → {frontend_domain}/thankyou"
echo "• Payment Failure → {frontend_domain}/cart"
echo "• URLs auto-detected from request headers"
echo "• Works in development, staging, and production"
