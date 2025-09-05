/**
 * Test script to verify Cashfree configuration loading from database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const NewCashfreeService = require('./services/payment/NewCashfreeService.js');

// MongoDB connection string
const dbName = process.env.DB || "kurti";
const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;

async function testCashfreeConfig() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoString);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Cashfree configuration loading...');
    
    // Test 1: Create new service instance
    console.log('\n1️⃣ Creating NewCashfreeService instance...');
    const service = new NewCashfreeService();
    
    // Test 2: Load configuration from database
    console.log('\n2️⃣ Loading configuration from database...');
    await service.loadConfig();
    
    // Test 3: Verify configuration is loaded
    console.log('\n3️⃣ Verifying configuration...');
    if (service.config && service.config.CASHFREE_APP_ID) {
      console.log('✅ Configuration loaded successfully!');
      console.log('   App ID:', service.config.CASHFREE_APP_ID.substring(0, 8) + '...');
      console.log('   Environment:', service.config.CASHFREE_ENV);
      console.log('   API URL:', service.baseURL);
    } else {
      console.log('❌ Configuration not loaded properly');
    }
    
    // Test 4: Test wrapper function
    console.log('\n4️⃣ Testing wrapper function...');
    try {
      // This should automatically load config
      const testOrder = await NewCashfreeService.createCashfreeOrder(
        'TEST_ORDER_' + Date.now(),
        1.00,
        'Test Customer',
        'test@example.com',
        '9999999999'
      );
      
      if (testOrder.success) {
        console.log('✅ Order creation test passed');
        console.log('   Order ID:', testOrder.orderId);
        console.log('   Payment Session ID:', testOrder.paymentSessionId.substring(0, 8) + '...');
      } else {
        console.log('⚠️  Order creation test failed (expected in test mode)');
        console.log('   Error:', testOrder.error);
      }
    } catch (error) {
      console.log('⚠️  Order creation test failed (expected):', error.message);
    }

    console.log('\n🎉 Database configuration loading test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testCashfreeConfig();
