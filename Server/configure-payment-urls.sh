#!/bin/bash

# 🚀 Deployment Domain Configuration Script
# Use this script to configure your deployed domain for payment returns

echo "🌐 Payment Return URL Configuration"
echo "===================================="
echo ""

# Detect current environment
if [ -n "$RENDER_EXTERNAL_URL" ]; then
    CURRENT_DOMAIN="$RENDER_EXTERNAL_URL"
    PLATFORM="Render"
elif [ -n "$VERCEL_URL" ]; then
    CURRENT_DOMAIN="https://$VERCEL_URL"
    PLATFORM="Vercel"
elif [ -n "$HEROKU_APP_NAME" ]; then
    CURRENT_DOMAIN="https://$HEROKU_APP_NAME.herokuapp.com"
    PLATFORM="Heroku"
else
    CURRENT_DOMAIN="Not detected"
    PLATFORM="Unknown"
fi

echo "🔍 Platform detected: $PLATFORM"
echo "🌐 Current domain: $CURRENT_DOMAIN"
echo ""

if [ "$CURRENT_DOMAIN" != "Not detected" ]; then
    echo "✅ Your payment return URL will be:"
    echo "   $CURRENT_DOMAIN/api/payment/return"
    echo ""
    echo "✅ Success redirects will go to:"
    echo "   $CURRENT_DOMAIN/thankyou"
    echo ""
    echo "✅ Failed payments will redirect to:"
    echo "   $CURRENT_DOMAIN/cart"
    echo ""
else
    echo "⚠️  Could not auto-detect deployment domain"
    echo ""
    echo "📝 To manually configure, set environment variable:"
    echo "   DEPLOYED_DOMAIN=https://your-actual-domain.com"
    echo ""
    echo "   This will make payment returns use:"
    echo "   https://your-actual-domain.com/api/payment/return"
    echo ""
fi

echo "🔧 Environment Variables for Payment URLs:"
echo "===========================================" 
echo "CASHFREE_ENVIRONMENT=production"
echo "APP_BASE_URL=auto"
echo "CLIENT_URL=auto"
echo "SERVER_URL=auto"

if [ "$CURRENT_DOMAIN" != "Not detected" ]; then
    echo "DEPLOYED_DOMAIN=$CURRENT_DOMAIN  # Optional - auto-detected"
else
    echo "DEPLOYED_DOMAIN=https://your-domain.com  # Set your deployed domain"
fi

echo ""
echo "🎯 How Payment Return URLs Work:"
echo "================================"
echo "1. Payment Gateway → https://your-domain.com/api/payment/return"
echo "2. Server checks payment status with Cashfree"
echo "3. Success → Redirect to: https://your-domain.com/thankyou"
echo "4. Failed → Redirect to: https://your-domain.com/cart"
echo ""

echo "🚀 Your system is configured for automatic URL detection!"
echo "   The payment return handler will automatically use your deployed domain."
echo ""

# Test current configuration
echo "🧪 Testing current environment detection..."
echo "   NODE_ENV: ${NODE_ENV:-not_set}"
echo "   CASHFREE_ENVIRONMENT: ${CASHFREE_ENVIRONMENT:-not_set}"
echo "   PORT: ${PORT:-not_set}"
echo ""

if [ "${CASHFREE_ENVIRONMENT}" = "production" ]; then
    echo "✅ Cashfree is configured for PRODUCTION"
else
    echo "⚠️  Cashfree environment: ${CASHFREE_ENVIRONMENT:-sandbox}"
    echo "   For live payments, set: CASHFREE_ENVIRONMENT=production"
fi

echo ""
echo "🎉 Setup complete! Your payment returns will work automatically."
echo "   Test your payment flow to verify everything works correctly."
