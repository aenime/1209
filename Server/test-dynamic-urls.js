// Test script to verify dynamic URL functionality
const NewCashfreeService = require('./services/payment/NewCashfreeService.js');

// Mock request object for testing
const mockRequest = {
  get: (header) => {
    const headers = {
      'Host': 'yourdomain.com',
      'X-Forwarded-Proto': 'https'
    };
    return headers[header];
  },
  protocol: 'https',
  hostname: 'yourdomain.com'
};

async function testDynamicUrls() {
  console.log('🧪 Testing Dynamic URL Implementation...\n');
  
  const service = new NewCashfreeService();
  
  // Test 1: Dynamic URL detection without request
  console.log('Test 1: URL detection without request object');
  const urlWithoutReq = service.getDynamicClientUrl();
  console.log('Result:', urlWithoutReq);
  console.log('Expected: http://localhost:3000 (fallback)\n');
  
  // Test 2: Dynamic URL detection with mock request
  console.log('Test 2: URL detection with mock request');
  const urlWithReq = service.getDynamicClientUrl(mockRequest);
  console.log('Result:', urlWithReq);
  console.log('Expected: https://yourdomain.com\n');
  
  // Test 3: Test order creation with dynamic URLs
  console.log('Test 3: Order creation with dynamic return URL');
  try {
    const orderResult = await service.createCashfreeOrder({
      orderId: 'TEST_' + Date.now(),
      orderAmount: 100,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '9999999999',
      req: mockRequest
    });
    
    console.log('Order creation result:');
    console.log('- Success:', orderResult.success);
    console.log('- Return URL:', orderResult.return_url);
    console.log('- Expected pattern: Backend API URL for payment return handling\n');
  } catch (error) {
    console.log('Expected error (no valid credentials):', error.message, '\n');
  }
  
  console.log('✅ Dynamic URL Implementation Test Complete!');
  console.log('\n📋 Summary of Changes:');
  console.log('1. Removed hardcoded https://deepskyblue-mule-970118.hostingersite.com');
  console.log('2. Implemented dynamic URL detection from request headers');
  console.log('3. Payment success → {frontend_domain}/thankyou');
  console.log('4. Payment failure → {frontend_domain}/cart');
  console.log('5. Environment-agnostic (works in dev, staging, production)');
}

testDynamicUrls().catch(console.error);
