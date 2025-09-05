#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Run this to verify all required environment variables are loaded
 */

const path = require("path");

// Load environment variables in the correct order
require("dotenv").config({ path: path.join(__dirname, '../.env') });
require("dotenv").config();

console.log("=== Environment Variables Validation ===\n");

// Required variables for Cashfree
const requiredVars = [
  'CASHFREE_APP_ID',
  'CASHFREE_SECRET_KEY', 
  'CASHFREE_ENV',
  'APP_BASE_URL',
  'NODE_ENV'
];

let allValid = true;

console.log("📋 Checking required environment variables:\n");

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = varName.includes('SECRET') ? 
    (value ? `${value.substring(0, 10)}...` : 'undefined') : 
    (value || 'undefined');
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value) {
    allValid = false;
  }
});

console.log("\n=== Configuration Summary ===");
console.log(`Environment: ${process.env.CASHFREE_ENV || 'NOT SET'}`);
console.log(`Node Environment: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`Base URL Mode: ${process.env.APP_BASE_URL || 'NOT SET'}`);

console.log("\n=== Validation Result ===");
if (allValid) {
  console.log("✅ All required environment variables are set!");
  console.log("🚀 Ready for payment processing");
} else {
  console.log("❌ Missing required environment variables!");
  console.log("Please check your .env file configuration");
}

console.log("\n=== Environment Files Check ===");
const envFiles = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env')
];

envFiles.forEach(filePath => {
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${filePath}`);
  } else {
    console.log(`❌ Missing: ${filePath}`);
  }
});

// Exit with appropriate code
process.exit(allValid ? 0 : 1);
