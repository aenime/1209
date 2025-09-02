#!/bin/bash

# 🏦 Cashfree Payment Gateway - Configuration Setup Script
# This script helps you set up and test your Cashfree integration

echo "🏦 Cashfree Payment Gateway Configuration Helper"
echo "================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if server is running
echo "🔍 Checking server status..."
if curl -s http://localhost:5001/api/payment-enhanced/test > /dev/null; then
    print_status $GREEN "✅ Server is running on port 5001"
else
    print_status $RED "❌ Server is not running. Please start your server first:"
    print_status $YELLOW "   cd Server && npm start"
    exit 1
fi

echo ""

# Check payment configuration
echo "🔧 Checking payment configuration..."
config_response=$(curl -s http://localhost:5001/api/payment-enhanced/config)

if echo "$config_response" | grep -q '"success":true'; then
    if echo "$config_response" | grep -q '"enabled":true'; then
        if echo "$config_response" | grep -q '"isConfigured":true'; then
            print_status $GREEN "✅ Payment gateway is configured and enabled"
            
            # Extract environment
            environment=$(echo "$config_response" | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)
            print_status $BLUE "   Environment: $environment"
        else
            print_status $RED "❌ Payment gateway is not configured"
            print_status $YELLOW "   Please configure your Cashfree credentials"
        fi
    else
        print_status $RED "❌ Payment gateway is disabled"
    fi
else
    print_status $RED "❌ Failed to check payment configuration"
fi

echo ""

# Check environment details
echo "🌍 Checking environment details..."
env_response=$(curl -s http://localhost:5001/api/payment-enhanced/debug/environment)

if echo "$env_response" | grep -q '"environment"'; then
    print_status $GREEN "✅ Environment check successful"
    
    # Extract URLs
    client_url=$(echo "$env_response" | grep -o '"client_auto":"[^"]*"' | cut -d'"' -f4)
    server_url=$(echo "$env_response" | grep -o '"server_auto":"[^"]*"' | cut -d'"' -f4)
    
    print_status $BLUE "   Client URL: $client_url"
    print_status $BLUE "   Server URL: $server_url"
else
    print_status $RED "❌ Failed to get environment details"
fi

echo ""

# Test API connection
echo "🔗 Testing API connection..."
api_test=$(curl -s http://localhost:5001/api/payment-enhanced/debug/api-connection)

if echo "$api_test" | grep -q '"success":true'; then
    print_status $GREEN "✅ API connection test successful"
else
    print_status $RED "❌ API connection test failed"
    if echo "$api_test" | grep -q '"message"'; then
        message=$(echo "$api_test" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        print_status $YELLOW "   Error: $message"
    fi
fi

echo ""

# Test order creation
echo "💳 Testing order creation..."
test_order_data='{
    "amount": 1.00,
    "customer": {
        "customer_phone": "9999999999",
        "customer_email": "test@example.com",
        "customer_name": "Test User"
    },
    "orderNote": "Configuration test order"
}'

order_response=$(curl -s -X POST http://localhost:5001/api/payment-enhanced/create-order \
    -H "Content-Type: application/json" \
    -d "$test_order_data")

if echo "$order_response" | grep -q '"success":true'; then
    print_status $GREEN "✅ Order creation test successful"
    
    # Extract order ID
    order_id=$(echo "$order_response" | grep -o '"order_id":"[^"]*"' | cut -d'"' -f4)
    print_status $BLUE "   Test Order ID: $order_id"
    
    # Check if payment session ID exists
    if echo "$order_response" | grep -q '"payment_session_id"'; then
        print_status $GREEN "   ✅ Payment session created"
    else
        print_status $YELLOW "   ⚠️ Payment session ID missing"
    fi
else
    print_status $RED "❌ Order creation test failed"
    if echo "$order_response" | grep -q '"message"'; then
        error_msg=$(echo "$order_response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        print_status $YELLOW "   Error: $error_msg"
    fi
fi

echo ""

# Summary and recommendations
echo "📋 Configuration Summary"
echo "========================"

if echo "$config_response" | grep -q '"enabled":true' && echo "$config_response" | grep -q '"isConfigured":true'; then
    print_status $GREEN "🎉 Your Cashfree integration is ready!"
    echo ""
    print_status $BLUE "Next steps:"
    print_status $BLUE "1. Open your app: http://localhost:3000"
    print_status $BLUE "2. Add items to cart and proceed to checkout"
    print_status $BLUE "3. Test payment with test cards:"
    print_status $BLUE "   Success: 4111 1111 1111 1111"
    print_status $BLUE "   Failure: 4012 0010 3714 1112"
    print_status $BLUE "4. Use the complete test page: test-cashfree-complete-integration.html"
else
    print_status $YELLOW "⚠️ Configuration needed"
    echo ""
    print_status $BLUE "To configure Cashfree:"
    print_status $BLUE "1. Add to your .env file:"
    print_status $BLUE "   CASHFREE_CLIENT_ID=your_client_id"
    print_status $BLUE "   CASHFREE_CLIENT_SECRET=your_client_secret"
    print_status $BLUE "   CASHFREE_ENVIRONMENT=sandbox"
    print_status $BLUE "   CASHFREE_ENABLED=true"
    print_status $BLUE "2. Restart your server"
    print_status $BLUE "3. Run this script again"
fi

echo ""
print_status $BLUE "📖 For complete documentation, see: CASHFREE_IMPLEMENTATION_GUIDE.md"
print_status $BLUE "🧪 For comprehensive testing, open: test-cashfree-complete-integration.html"

echo ""
echo "Script completed at $(date)"
