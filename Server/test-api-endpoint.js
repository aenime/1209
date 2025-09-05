#!/usr/bin/env node

// Simple test script to verify the complete API integration
const axios = require('axios');

async function testCompleteIntegration() {
  console.log('🧪 Testing Complete Cashfree API Integration...\n');

  // Test 1: Direct service call
  console.log('1️⃣ Testing direct service...');
  try {
    const NewCashfreeService = require('./services/payment/NewCashfreeService.js');
    const service = new NewCashfreeService();
    
    const directResult = await service.createCashfreeOrder({
      orderId: 'DIRECT_TEST_' + Date.now(),
      orderAmount: 150,
      customerName: 'Direct Test Customer',
      customerEmail: 'direct@example.com',
      customerPhone: '9876543210'
    });
    
    if (directResult.success) {
      console.log('✅ Direct service call SUCCESS');
      console.log('   Payment Link:', directResult.payment_link);
    } else {
      console.log('❌ Direct service call FAILED:', directResult.message);
    }
  } catch (error) {
    console.log('❌ Direct service call EXCEPTION:', error.message);
  }

  console.log('\n2️⃣ Testing API endpoint...');
  
  // Test 2: API endpoint call
  try {
    const response = await axios.post('http://localhost:5001/api/payment-enhanced/create-order', {
      orderId: 'API_TEST_' + Date.now(),
      orderAmount: 200,
      customerName: 'API Test Customer',
      customerEmail: 'api@example.com',
      customerPhone: '9876543210'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.success) {
      console.log('✅ API endpoint call SUCCESS');
      console.log('   Payment Link:', response.data.payment_link);
    } else {
      console.log('❌ API endpoint call FAILED:', response.data);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ API endpoint call FAILED: Server not running on localhost:5001');
      console.log('   Please start the server first with: node index.js');
    } else {
      console.log('❌ API endpoint call EXCEPTION:', error.message);
    }
  }

  console.log('\n🎯 Integration test completed!');
}

// Run the test
testCompleteIntegration().catch(console.error);
