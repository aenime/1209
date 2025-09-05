const mongoose = require('mongoose');
const EnvConfig = require('./model/EnvConfig.modal.js');

async function detailedDebugDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Use the same connection logic as the main server
    const dbName = 'fullapp'; // Force production database to see the real data
    const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;
    
    await mongoose.connect(mongoString);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${dbName}`);

    console.log('\n🔍 Detailed Database Configuration Analysis...\n');

    // Get ALL configs
    const allConfigs = await EnvConfig.find({});
    console.log(`📊 Total configurations found: ${allConfigs.length}`);

    allConfigs.forEach((config, index) => {
      console.log(`\n📋 Configuration ${index + 1}:`);
      console.log(`   ID: ${config._id}`);
      console.log(`   isActive: ${config.isActive}`);
      console.log(`   createdAt: ${config.createdAt}`);
      console.log(`   updatedAt: ${config.updatedAt}`);
      
      // Check all possible Cashfree field names
      const possibleFields = [
        'CASHFREE_APP_ID',
        'CASHFREE_SECRET_KEY', 
        'CASHFREE_CLIENT_ID',
        'CASHFREE_CLIENT_SECRET',
        'CASHFREE_ENVIRONMENT'
      ];
      
      console.log('\n   Cashfree Fields:');
      possibleFields.forEach(field => {
        const value = config[field];
        if (value) {
          console.log(`   ✅ ${field}: ${field.includes('SECRET') ? '[REDACTED]' : value}`);
        } else {
          console.log(`   ❌ ${field}: undefined/null`);
        }
      });
      
      // Print the raw object to see what fields actually exist
      console.log('\n   Raw object keys:');
      const keys = Object.keys(config.toObject()).filter(key => 
        key.includes('CASHFREE') || key.includes('cashfree')
      );
      console.log(`   ${keys.length > 0 ? keys.join(', ') : 'No Cashfree-related keys found'}`);
    });

    // Test the specific query the service uses
    console.log('\n🎯 Testing service query: EnvConfig.findOne({ isActive: true })');
    const serviceConfig = await EnvConfig.findOne({ isActive: true });
    
    if (serviceConfig) {
      console.log('✅ Service query found config');
      console.log(`   ID: ${serviceConfig._id}`);
      
      // Test the exact logic from the service
      const appId = serviceConfig.CASHFREE_APP_ID || serviceConfig.CASHFREE_CLIENT_ID;
      const secretKey = serviceConfig.CASHFREE_SECRET_KEY || serviceConfig.CASHFREE_CLIENT_SECRET;
      
      console.log('\n🧪 Testing service logic:');
      console.log(`   CASHFREE_APP_ID: ${serviceConfig.CASHFREE_APP_ID ? '[FOUND]' : 'undefined'}`);
      console.log(`   CASHFREE_CLIENT_ID: ${serviceConfig.CASHFREE_CLIENT_ID ? '[FOUND]' : 'undefined'}`);
      console.log(`   CASHFREE_SECRET_KEY: ${serviceConfig.CASHFREE_SECRET_KEY ? '[FOUND]' : 'undefined'}`);
      console.log(`   CASHFREE_CLIENT_SECRET: ${serviceConfig.CASHFREE_CLIENT_SECRET ? '[FOUND]' : 'undefined'}`);
      console.log(`   Resolved appId: ${appId ? '[FOUND]' : 'undefined'}`);
      console.log(`   Resolved secretKey: ${secretKey ? '[FOUND]' : 'undefined'}`);
      console.log(`   Has both credentials: ${appId && secretKey ? 'YES' : 'NO'}`);
      
    } else {
      console.log('❌ Service query found no active config');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB');
    await mongoose.disconnect();
  }
}

detailedDebugDatabase();
