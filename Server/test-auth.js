// Quick test to validate Cashfree credentials and environment
require('dotenv').config();

console.log('🔍 Testing Cashfree Authentication...\n');

console.log('📋 Environment Configuration:');
console.log('CASHFREE_APP_ID:', process.env.CASHFREE_APP_ID ? `${process.env.CASHFREE_APP_ID.substring(0, 8)}...` : 'NOT SET');
console.log('CASHFREE_SECRET_KEY:', process.env.CASHFREE_SECRET_KEY ? `${process.env.CASHFREE_SECRET_KEY.substring(0, 12)}...` : 'NOT SET');
console.log('CASHFREE_ENV:', process.env.CASHFREE_ENV || 'NOT SET');

const NewCashfreeService = require('./services/payment/NewCashfreeService.js');

async function testAuthentication() {
  try {
    const service = new NewCashfreeService();
    
    console.log('\n🌐 Service Configuration:');
    console.log('Base URL:', service.baseURL);
    console.log('Environment:', service.config.CASHFREE_ENV);
    console.log('API Version:', service.API_VERSION);
    
    // Test with a minimal order
    console.log('\n🧪 Testing order creation...');
    const result = await service.createCashfreeOrder({
      orderId: 'TEST_AUTH_' + Date.now(),
      orderAmount: 1,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '9999999999'
    });
    
    console.log('\n📝 Test Result:');
    console.log('Success:', result.success);
    if (result.success) {
      console.log('✅ Authentication successful!');
      console.log('Payment Link:', result.payment_link ? 'Generated' : 'Not generated');
      console.log('Order ID:', result.order_id);
      console.log('Environment:', result.environment);
    } else {
      console.log('❌ Authentication failed!');
      console.log('Error:', result.message);
      console.log('Details:', result.error);
    }
    
  } catch (error) {
    console.log('\n❌ Test Error:', error.message);
  }
}

testAuthentication();
