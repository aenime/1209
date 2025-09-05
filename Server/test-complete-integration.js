const express = require('express');
const NewCashfreeService = require('./services/payment/NewCashfreeService.js');

// Create a simple test server
const app = express();
app.use(express.json());

// Test endpoint
app.post('/test-payment', async (req, res) => {
  try {
    console.log('🔄 Testing payment creation...');
    
    const service = new NewCashfreeService();
    const result = await service.createCashfreeOrder({
      orderId: 'FINAL_TEST_' + Date.now(),
      orderAmount: req.body.amount || 200,
      customerName: req.body.customerName || 'Test Customer',
      customerEmail: req.body.customerEmail || 'test@example.com',
      customerPhone: req.body.customerPhone || '9876543210'
    });
    
    console.log('✅ Payment creation result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start test server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on http://localhost:${PORT}`);
  console.log('📝 To test: curl -X POST http://localhost:3001/test-payment -H "Content-Type: application/json" -d \'{"amount": 300}\'');
});

// Run a quick test
setTimeout(async () => {
  try {
    console.log('\n🔄 Running automatic test...');
    const service = new NewCashfreeService();
    const result = await service.createCashfreeOrder({
      orderId: 'AUTO_TEST_' + Date.now(),
      orderAmount: 199,
      customerName: 'Auto Test Customer',
      customerEmail: 'auto.test@example.com',
      customerPhone: '9876543210'
    });
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! Cashfree integration is working perfectly!');
      console.log('💳 Payment Link:', result.payment_link);
      console.log('🆔 Order ID:', result.order_id);
      console.log('📊 CF Order ID:', result.cf_order_id);
    } else {
      console.log('\n❌ Test failed:', result.message);
    }
    
  } catch (error) {
    console.error('\n❌ Auto test error:', error.message);
  }
}, 1000);
