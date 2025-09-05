const NewCashfreeService = require('./services/payment/NewCashfreeService.js');

console.log('✅ Service loaded successfully');

async function testOrderCreation() {
  try {
    const service = new NewCashfreeService();
    console.log('✅ Service created successfully');
    
    console.log('Config:', {
      CASHFREE_APP_ID: service.config.CASHFREE_APP_ID,
      CASHFREE_SECRET_KEY: service.config.CASHFREE_SECRET_KEY ? service.config.CASHFREE_SECRET_KEY.substring(0, 10) + '...' : 'missing',
      CASHFREE_ENV: service.config.CASHFREE_ENV,
      baseURL: service.baseURL
    });

    // Test order creation
    console.log('\n🔄 Creating test order...');
    const result = await service.createCashfreeOrder({
      orderId: 'TEST_' + Date.now(),
      orderAmount: 100,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '9876543210'
    });
    
    console.log('\n✅ Order creation result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testOrderCreation();
