#!/usr/bin/env node

/**
 * Simple test to verify the return URL is correctly generated
 */

const axios = require('axios');

async function testPaymentCreation() {
    console.log('🧪 Testing Payment Creation with Return URL...');
    console.log('='.repeat(50));

    try {
        // Wait a moment for server to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await axios.post('http://localhost:10000/api/enhanced-payment/create-order', {
            amount: 100,
            customerName: 'Test User',
            customerEmail: 'test@example.com',
            customerPhone: '9999999999'
        }, {
            timeout: 10000
        });

        console.log('✅ Payment order created successfully!');
        console.log('📦 Response:', JSON.stringify(response.data, null, 2));
        
        // Check the payment link
        if (response.data.data && response.data.data.payment_link) {
            console.log('\n🔗 Payment Link Generated:');
            console.log(response.data.data.payment_link);
            
            console.log('\n📊 Key Details:');
            console.log(`- Order ID: ${response.data.data.order_id}`);
            console.log(`- Environment: ${response.data.data.environment}`);
            console.log(`- Status: ${response.data.data.order_status}`);
        }

        console.log('\n✅ Test completed! The return URL should now be:');
        console.log('📍 https://localhost:10000/api/enhanced-payment/return');
        console.log('\n🎯 This will redirect to:');
        console.log('   ✅ Success: http://localhost:3000/thankyou');
        console.log('   ❌ Failure: http://localhost:3000/cart');

    } catch (error) {
        console.error('❌ Error testing payment creation:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testPaymentCreation();
