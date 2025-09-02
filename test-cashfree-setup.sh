#!/bin/bash

echo "🔧 Testing Cashfree Payment Gateway Configuration"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo -e "${BLUE}1. Testing server connectivity...${NC}"
if curl -s http://localhost:5001/api/payment-enhanced/config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running on port 5001${NC}"
else
    echo -e "${RED}❌ Server is not running on port 5001${NC}"
    echo "Please start your server with: cd Server && npm start"
    exit 1
fi

echo ""

# Test 2: Check environment configuration
echo -e "${BLUE}2. Checking environment configuration...${NC}"
ENV_RESPONSE=$(curl -s http://localhost:5001/api/payment-enhanced/debug/environment)

if echo "$ENV_RESPONSE" | grep -q '"client_id":"SET"'; then
    echo -e "${GREEN}✅ Cashfree Client ID is configured${NC}"
else
    echo -e "${YELLOW}⚠️  Cashfree Client ID is not configured${NC}"
    echo -e "${YELLOW}   Add your Cashfree credentials to Server/.env file${NC}"
fi

if echo "$ENV_RESPONSE" | grep -q '"client_secret":"SET"'; then
    echo -e "${GREEN}✅ Cashfree Client Secret is configured${NC}"
else
    echo -e "${YELLOW}⚠️  Cashfree Client Secret is not configured${NC}"
fi

if echo "$ENV_RESPONSE" | grep -q '"environment":"sandbox"'; then
    echo -e "${GREEN}✅ Environment is set to sandbox${NC}"
elif echo "$ENV_RESPONSE" | grep -q '"environment":"production"'; then
    echo -e "${GREEN}✅ Environment is set to production${NC}"
else
    echo -e "${YELLOW}⚠️  Environment is not configured${NC}"
fi

echo ""

# Test 3: Check payment config
echo -e "${BLUE}3. Testing payment configuration...${NC}"
CONFIG_RESPONSE=$(curl -s http://localhost:5001/api/payment-enhanced/config)

if echo "$CONFIG_RESPONSE" | grep -q '"success":true'; then
    if echo "$CONFIG_RESPONSE" | grep -q '"enabled":true'; then
        echo -e "${GREEN}✅ Payment gateway is enabled${NC}"
    else
        echo -e "${YELLOW}⚠️  Payment gateway is disabled${NC}"
    fi
    
    if echo "$CONFIG_RESPONSE" | grep -q '"isConfigured":true'; then
        echo -e "${GREEN}✅ Payment gateway is fully configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Payment gateway configuration incomplete${NC}"
    fi
else
    echo -e "${RED}❌ Payment configuration test failed${NC}"
fi

echo ""

# Test 4: Test API connection (if configured)
echo -e "${BLUE}4. Testing Cashfree API connection...${NC}"
if echo "$CONFIG_RESPONSE" | grep -q '"isConfigured":true'; then
    API_RESPONSE=$(curl -s http://localhost:5001/api/payment-enhanced/debug/api-connection)
    
    if echo "$API_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Cashfree API connection successful${NC}"
    else
        echo -e "${RED}❌ Cashfree API connection failed${NC}"
        echo -e "${YELLOW}   Check your API credentials in .env file${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping API test - credentials not configured${NC}"
fi

echo ""

# Test 5: Test order creation
echo -e "${BLUE}5. Testing order creation...${NC}"
if echo "$CONFIG_RESPONSE" | grep -q '"isConfigured":true'; then
    ORDER_DATA='{"amount":100,"customer":{"customer_phone":"9999999999","customer_email":"test@example.com","customer_name":"Test User"}}'
    ORDER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$ORDER_DATA" http://localhost:5001/api/payment-enhanced/create-order)
    
    if echo "$ORDER_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Order creation successful${NC}"
        ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"order_id":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}   Order ID: $ORDER_ID${NC}"
    else
        echo -e "${RED}❌ Order creation failed${NC}"
        echo -e "${YELLOW}   Response: $ORDER_RESPONSE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping order test - credentials not configured${NC}"
fi

echo ""
echo "🔧 Configuration Summary:"
echo "========================="

if echo "$CONFIG_RESPONSE" | grep -q '"isConfigured":true'; then
    echo -e "${GREEN}✅ Your Cashfree integration is fully configured and ready to use!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Open test-cashfree-sdk-debug.html in your browser"
    echo "2. Test the complete payment flow"
    echo "3. Use test cards provided in the setup guide"
else
    echo -e "${YELLOW}⚠️  Your Cashfree integration needs configuration${NC}"
    echo ""
    echo -e "${BLUE}To complete setup:${NC}"
    echo "1. Get your Cashfree credentials from: https://merchant.cashfree.com/"
    echo "2. Edit Server/.env file and add your credentials:"
    echo "   CASHFREE_CLIENT_ID=your_client_id"
    echo "   CASHFREE_CLIENT_SECRET=your_client_secret"
    echo "3. Restart your server: cd Server && npm start"
    echo "4. Run this test again"
fi

echo ""
echo -e "${BLUE}Test completed at: $(date)${NC}"
