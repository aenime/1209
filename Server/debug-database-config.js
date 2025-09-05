/**
 * Debug script to check what's actually stored in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection string
const dbName = process.env.DB || "kurti";
const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;

async function debugDatabaseConfig() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoString);
    console.log('✅ Connected to MongoDB');

    // Import the EnvConfig model
    const EnvConfig = require('./model/EnvConfig.modal.js');
    
    console.log('\n🔍 Checking database for environment configuration...');
    
    // Find all configs
    const allConfigs = await EnvConfig.find({});
    console.log(`📋 Found ${allConfigs.length} configuration(s) in database`);
    
    for (const config of allConfigs) {
      console.log('\n📄 Configuration:', config._id);
      console.log('   Is Active:', config.isActive);
      console.log('   Config Name:', config.configName);
      console.log('   Created:', config.createdAt);
      
      // Check Cashfree fields
      console.log('\n💳 Cashfree Fields:');
      console.log('   CASHFREE_ENABLED:', config.CASHFREE_ENABLED);
      console.log('   CASHFREE_APP_ID:', config.CASHFREE_APP_ID ? config.CASHFREE_APP_ID.substring(0, 8) + '...' : 'Not set');
      console.log('   CASHFREE_SECRET_KEY:', config.CASHFREE_SECRET_KEY ? config.CASHFREE_SECRET_KEY.substring(0, 8) + '...' : 'Not set');
      console.log('   CASHFREE_ENVIRONMENT:', config.CASHFREE_ENVIRONMENT);
      
      // Also check old field names
      console.log('\n🔄 Legacy Fields (if any):');
      console.log('   CASHFREE_CLIENT_ID:', config.CASHFREE_CLIENT_ID ? config.CASHFREE_CLIENT_ID.substring(0, 8) + '...' : 'Not set');
      console.log('   CASHFREE_CLIENT_SECRET:', config.CASHFREE_CLIENT_SECRET ? config.CASHFREE_CLIENT_SECRET.substring(0, 8) + '...' : 'Not set');
      
      // Show all keys that start with CASHFREE
      console.log('\n🔑 All Cashfree-related keys:');
      for (const key in config.toObject()) {
        if (key.includes('CASHFREE')) {
          const value = config[key];
          if (typeof value === 'string' && value.length > 10) {
            console.log(`   ${key}: ${value.substring(0, 8)}...`);
          } else {
            console.log(`   ${key}: ${value}`);
          }
        }
      }
    }
    
    // Try to find active config specifically
    console.log('\n🎯 Looking for active configuration...');
    const activeConfig = await EnvConfig.findOne({ isActive: true });
    
    if (activeConfig) {
      console.log('✅ Found active configuration:', activeConfig._id);
      console.log('   CASHFREE_APP_ID present:', !!activeConfig.CASHFREE_APP_ID);
      console.log('   CASHFREE_SECRET_KEY present:', !!activeConfig.CASHFREE_SECRET_KEY);
    } else {
      console.log('❌ No active configuration found');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the debug
debugDatabaseConfig();
