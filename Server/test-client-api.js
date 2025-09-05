const axios = require('axios');

// Start the server and test the API endpoint
async function testClientAPI() {
  console.log('🧪 Testing Client-Side API Integration...\n');

  try {
    console.log('📡 Making API call to create Cashfree order...');
    
    const response = await axios.post('http://localhost:5001/api/payment-enhanced/create-order', {
      orderId: 'CLIENT_TEST_' + Date.now(),
      amount: 750,
      customerName: 'Client API Test',
      customerEmail: 'client.api@example.com',
      customerPhone: '9876543210'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.payment_link) {
      console.log('\n🎉 SUCCESS! Payment link created:');
      console.log('🔗 Payment URL:', response.data.payment_link);
      console.log('💰 Amount: ₹' + response.data.order_amount || '750');
      console.log('📋 Order ID:', response.data.order_id);
      console.log('🆔 Cashfree Order ID:', response.data.cf_order_id);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running on localhost:5001');
      console.log('Please start the server with: cd Server && node index.js');
    } else if (error.response) {
      console.log('❌ API Error:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('❌ Request Error:', error.message);
    }
  }
}

testClientAPI();
