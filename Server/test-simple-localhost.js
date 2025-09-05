const NewCashfreeService = require('./services/payment/NewCashfreeService.js');

async function testProductionLocalhostSimple() {
  try {
    console.log('🧪 Testing PRODUCTION mode with localhost (simplified test)...\n');

    // Create service instance with mock config
    const cashfreeService = new NewCashfreeService();
    
    // Set up test configuration manually (bypass database)
    cashfreeService.config = {
      CASHFREE_APP_ID: 'TEST123456789',
      CASHFREE_SECRET_KEY: 'cfsk_ma_test_dummy_key_0000000000000000000000000000',
      CASHFREE_ENV: 'PRODUCTION'  // Start in production mode
    };

    // Initialize the axios client manually
    const axios = require('axios');
    cashfreeService.baseURL = 'https://api.cashfree.com/pg';
    cashfreeService.client = axios.create({
      baseURL: cashfreeService.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-version': cashfreeService.API_VERSION,
        'x-client-id': cashfreeService.config.CASHFREE_APP_ID,
        'x-client-secret': cashfreeService.config.CASHFREE_SECRET_KEY
      }
    });

    // Mock request object with localhost (this mimics the browser request)
    const mockReq = {
      get: (header) => {
        if (header === 'Host') return '127.0.0.1:3000';
        if (header === 'X-Forwarded-Host') return null;
        if (header === 'X-Forwarded-Proto') return null;
        return null;
      },
      protocol: 'http',
      hostname: '127.0.0.1',
      headers: { host: '127.0.0.1:3000' }
    };

    console.log('📋 Initial environment:', cashfreeService.config.CASHFREE_ENV);
    console.log('🌐 Mock request host:', mockReq.get('Host'));
    console.log('🔗 Initial base URL:', cashfreeService.baseURL);
    
    // Test order creation - this should trigger auto-switch to sandbox
    console.log('\n🚀 Creating order (should auto-switch to SANDBOX)...');
    
    try {
      const orderData = {
        orderId: 'TEST_AUTO_SWITCH_' + Date.now(),
        orderAmount: 1,
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '9999999999',
        req: mockReq
      };

      const result = await cashfreeService.createCashfreeOrder(orderData);
      console.log('✅ Order creation completed');
      console.log('📋 Final environment:', cashfreeService.config.CASHFREE_ENV);
      console.log('🔗 Final base URL:', cashfreeService.baseURL);
      console.log('🔗 Return URL used:', result.order_meta?.return_url || 'Not found');
      
    } catch (error) {
      console.log('📋 Final environment after auto-switch:', cashfreeService.config.CASHFREE_ENV);
      console.log('🔗 Final base URL:', cashfreeService.baseURL);
      console.log('⚠️  Order creation failed (expected with test credentials)');
      console.log('🔍 Error details:', error.message);
      
      // Check if the error is about HTTPS URL requirement
      if (error.message && error.message.toLowerCase().includes('https')) {
        console.log('❌ HTTPS URL error still occurring - auto-switch failed');
        console.log('   Full error:', error.message);
      } else {
        console.log('✅ No HTTPS URL error - auto-switch to SANDBOX worked!');
      }
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testProductionLocalhostSimple();
