const mongoose = require('mongoose');
const EnvConfig = require('./model/EnvConfig.modal.js');

async function listCollectionsAndTestData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Use the same connection logic as the main server
    const dbName = 'fullapp'; // Force production database to see the real data
    const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;
    
    await mongoose.connect(mongoString);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${dbName}`);

    // List all collections
    console.log('\n📁 Available collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

    // Check specific collection names that might contain config data
    const configCollections = collections.filter(c => 
      c.name.toLowerCase().includes('config') || 
      c.name.toLowerCase().includes('env') ||
      c.name.toLowerCase().includes('setting')
    );
    
    if (configCollections.length > 0) {
      console.log('\n🎯 Configuration-related collections:');
      configCollections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }

    // Check if EnvConfig collection exists and has data
    console.log('\n🔍 Checking EnvConfig collection...');
    const envConfigCount = await EnvConfig.countDocuments();
    console.log(`📊 EnvConfig documents: ${envConfigCount}`);

    if (envConfigCount === 0) {
      console.log('\n💡 No EnvConfig found. Let me create a sample configuration...');
      
      const sampleConfig = new EnvConfig({
        configName: 'sample-test-config',
        CASHFREE_ENABLED: true,
        CASHFREE_CLIENT_ID: 'TEST123456789',
        CASHFREE_CLIENT_SECRET: 'test_secret_key_12345',
        CASHFREE_ENVIRONMENT: 'production',
        isActive: true
      });

      await sampleConfig.save();
      console.log('✅ Created sample configuration');
      
      // Now test the service query
      console.log('\n🧪 Testing service query after creating sample data...');
      const serviceConfig = await EnvConfig.findOne({ isActive: true });
      
      if (serviceConfig) {
        console.log('✅ Service query found config');
        console.log(`   ID: ${serviceConfig._id}`);
        console.log(`   CASHFREE_CLIENT_ID: ${serviceConfig.CASHFREE_CLIENT_ID ? '[FOUND]' : 'undefined'}`);
        console.log(`   CASHFREE_CLIENT_SECRET: ${serviceConfig.CASHFREE_CLIENT_SECRET ? '[FOUND]' : 'undefined'}`);
        console.log(`   CASHFREE_ENVIRONMENT: ${serviceConfig.CASHFREE_ENVIRONMENT}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB');
    await mongoose.disconnect();
  }
}

listCollectionsAndTestData();
