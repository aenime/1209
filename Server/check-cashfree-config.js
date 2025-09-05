#!/usr/bin/env node

/**
 * This script checks if the Cashfree configuration is properly set up
 */
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Try to load .env.cashfree-test first, then .env if test file doesn't exist
let configLoaded = false;

const testEnvPath = path.resolve(__dirname, '.env.cashfree-test');
if (fs.existsSync(testEnvPath)) {
  console.log('Loading test environment from .env.cashfree-test');
  dotenv.config({ path: testEnvPath });
  configLoaded = true;
} else {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    console.log('Loading environment from .env');
    dotenv.config();
    configLoaded = true;
  }
}

if (!configLoaded) {
  console.error('No environment file found. Create either .env or .env.cashfree-test');
  process.exit(1);
}

// Check for required variables
const requiredVars = ['CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY', 'CASHFREE_ENV'];
const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Display configuration
console.log('\n=== Cashfree Configuration ===');
console.log(`Environment: ${process.env.CASHFREE_ENV}`);
console.log(`App ID: ${process.env.CASHFREE_APP_ID.substring(0, 3)}${'*'.repeat(5)}`);
console.log(`Secret Key: ${'*'.repeat(10)}`);
console.log(`App Base URL: ${process.env.APP_BASE_URL || 'Not configured'}`);
console.log(`Test Port: ${process.env.CASHFREE_TEST_PORT || 3030}`);
console.log('\n✅ Configuration loaded successfully\n');

// Try to load the SDK
try {
  const { CFConfig, CFEnvironment, OrdersApi } = require('cashfree-pg-sdk-nodejs');
  console.log(`✅ SDK loaded successfully (version: ${require('cashfree-pg-sdk-nodejs/package.json').version})`);
  
  // Initialize the SDK with v2.x structure
  const cfConfig = new CFConfig(
    process.env.CASHFREE_ENV === 'PRODUCTION' 
      ? CFEnvironment.PRODUCTION
      : CFEnvironment.SANDBOX,
    "2022-01-01", // apiVersion
    process.env.CASHFREE_APP_ID, // clientId
    process.env.CASHFREE_SECRET_KEY, // clientSecret
    180000 // timeout
  );
  
  console.log('✅ SDK initialized successfully');
  
  // Show API endpoints
  console.log('\n=== Cashfree API Endpoints ===');
  console.log(`Base URL: ${process.env.CASHFREE_ENV === 'PRODUCTION' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg'}`);
  console.log(`Create Order: ${process.env.CASHFREE_ENV === 'PRODUCTION' ? 'https://api.cashfree.com/pg/orders' : 'https://sandbox.cashfree.com/pg/orders'}`);
  console.log(`Order Status: ${process.env.CASHFREE_ENV === 'PRODUCTION' ? 'https://api.cashfree.com/pg/orders/{order_id}' : 'https://sandbox.cashfree.com/pg/orders/{order_id}'}`);
  
  console.log('\n=== Test Server Endpoints ===');
  console.log(`Test UI: http://localhost:${process.env.CASHFREE_TEST_PORT || 3030}`);
  console.log(`Direct Payment: http://localhost:${process.env.CASHFREE_TEST_PORT || 3030}/api/enhanced-payment/payment_cashfree?amount=100`);
  console.log(`Create Order: http://localhost:${process.env.CASHFREE_TEST_PORT || 3030}/api/enhanced-payment/create_order?amount=100&name=Test&email=test@example.com&phone=9999999999`);
  console.log(`Verify Payment: http://localhost:${process.env.CASHFREE_TEST_PORT || 3030}/api/enhanced-payment/verify/{order_id}`);
  
  console.log('\n✅ All checks passed! You can run the test server with:');
  console.log('./run-cashfree-test.sh');
  
} catch (error) {
  console.error('❌ Error loading SDK:', error.message);
  console.log('Please run: npm install cashfree-pg-sdk-nodejs');
  process.exit(1);
}
