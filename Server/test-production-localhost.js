const NewCashfreeService = require('./services/payment/NewCashfreeService.js');

async function testProductionModeWithLocalhost() {
  try {
    console.log('🧪 Testing PRODUCTION mode with localhost (auto-switch scenario)...\n');

    // Create service instance
    const cashfreeService = new NewCashfreeService();
    
    // Load configuration 
    await cashfreeService.loadConfig();
    
    // Force production mode to simulate the issue
    console.log('🔧 Forcing PRODUCTION mode to test auto-switch...');
    cashfreeService.config.CASHFREE_ENV = 'PRODUCTION';
    
    // Mock request object with localhost
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
      console.log('🔗 Return URL used:', result.order_meta?.return_url || 'Not found');
      
    } catch (error) {
      console.log('📋 Final environment after auto-switch:', cashfreeService.config.CASHFREE_ENV);
      console.log('⚠️  Order creation failed (expected with test credentials)');
      console.log('🔍 Error type:', error.type || error.message);
      
      // Check if the error is about HTTPS (this would indicate the fix didn't work)
      if (error.message && error.message.includes('https')) {
        console.log('❌ HTTPS error still occurring - auto-switch failed');
      } else {
        console.log('✅ No HTTPS error - auto-switch to SANDBOX worked!');
      }
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testProductionModeWithLocalhost();
