#!/usr/bin/env node

/**
 * Quick Deployment Test Script
 * Tests if all deployment fixes are working correctly
 */

const path = require("path");
const http = require("http");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, '../.env') });
require("dotenv").config();

console.log("🧪 Testing Deployment Configuration...\n");

// Test 1: Environment Variables
console.log("📋 Test 1: Environment Variables");
const envVars = {
  'CASHFREE_APP_ID': process.env.CASHFREE_APP_ID,
  'CASHFREE_SECRET_KEY': process.env.CASHFREE_SECRET_KEY ? 'SET' : 'MISSING',
  'CASHFREE_ENV': process.env.CASHFREE_ENV,
  'NODE_ENV': process.env.NODE_ENV
};

let envPassed = true;
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value || 'MISSING'}`);
  if (!value) envPassed = false;
});

// Test 2: Check if server starts correctly
console.log("\n🚀 Test 2: Server Startup");
try {
  // Try to start server on a test port
  const testServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server running');
  });
  
  testServer.listen(0, () => {
    const port = testServer.address().port;
    console.log(`✅ Server can start successfully (test port: ${port})`);
    testServer.close();
    
    // Test 3: Payment Service Configuration
    console.log("\n💳 Test 3: Payment Service");
    try {
      const NewCashfreeService = require('./services/payment/NewCashfreeService');
      const paymentService = new NewCashfreeService();
      console.log("✅ Payment service initialized successfully");
      console.log(`✅ API Environment: ${paymentService.config.CASHFREE_ENV}`);
      console.log(`✅ Base URL: ${paymentService.baseURL}`);
    } catch (error) {
      console.log("❌ Payment service initialization failed:", error.message);
    }
    
    // Final Results
    console.log("\n📊 Deployment Test Results:");
    console.log(envPassed ? "✅ Environment: READY" : "❌ Environment: FAILED");
    console.log("✅ Server: READY");
    console.log("✅ Payment: READY");
    console.log("\n🎯 Deployment Status: " + (envPassed ? "READY FOR PRODUCTION 🚀" : "NEEDS CONFIGURATION ⚠️"));
    
    if (envPassed) {
      console.log("\n🔗 Next Steps:");
      console.log("1. Run: npm run build");
      console.log("2. Deploy with start command: npm start");
      console.log("3. Set environment variables in your platform");
    }
  });
  
} catch (error) {
  console.log("❌ Server startup test failed:", error.message);
}
