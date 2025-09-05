const mongoose = require('mongoose');
const EnvConfig = require('./model/EnvConfig.modal.js');

async function migrateCashfreeFields() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Use production database
    const dbName = 'fullapp';
    const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;
    
    await mongoose.connect(mongoString);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${dbName}`);

    console.log('\n🔍 Looking for configurations with old field names...');

    // Find all configs that have the old field names
    const configs = await EnvConfig.find({
      $or: [
        { CASHFREE_CLIENT_ID: { $exists: true, $ne: '' } },
        { CASHFREE_CLIENT_SECRET: { $exists: true, $ne: '' } }
      ]
    });

    console.log(`📋 Found ${configs.length} configurations with old field names`);

    if (configs.length === 0) {
      console.log('✅ No migration needed - no old field names found');
      return;
    }

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      console.log(`\n🔄 Migrating configuration ${i + 1}/${configs.length}`);
      console.log(`   ID: ${config._id}`);
      console.log(`   Active: ${config.isActive}`);

      let updated = false;

      // Migrate CASHFREE_CLIENT_ID to CASHFREE_APP_ID
      if (config.CASHFREE_CLIENT_ID && !config.CASHFREE_APP_ID) {
        console.log(`   Migrating CLIENT_ID to APP_ID: ${config.CASHFREE_CLIENT_ID}`);
        config.CASHFREE_APP_ID = config.CASHFREE_CLIENT_ID;
        updated = true;
      }

      // Migrate CASHFREE_CLIENT_SECRET to CASHFREE_SECRET_KEY
      if (config.CASHFREE_CLIENT_SECRET && !config.CASHFREE_SECRET_KEY) {
        console.log(`   Migrating CLIENT_SECRET to SECRET_KEY: [REDACTED]`);
        config.CASHFREE_SECRET_KEY = config.CASHFREE_CLIENT_SECRET;
        updated = true;
      }

      if (updated) {
        await config.save();
        console.log('   ✅ Migration completed for this configuration');
      } else {
        console.log('   ℹ️  No migration needed - new fields already exist');
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary of migrated fields:');
    console.log('   CASHFREE_CLIENT_ID → CASHFREE_APP_ID');
    console.log('   CASHFREE_CLIENT_SECRET → CASHFREE_SECRET_KEY');
    
    console.log('\n⚠️  Note: Old field names are still in the database but will be ignored');
    console.log('   You can manually remove them from the Admin Panel if desired');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB');
    await mongoose.disconnect();
  }
}

console.log('🚀 Cashfree Field Migration Script');
console.log('   This script migrates old field names to new ones:');
console.log('   CASHFREE_CLIENT_ID → CASHFREE_APP_ID');
console.log('   CASHFREE_CLIENT_SECRET → CASHFREE_SECRET_KEY\n');

migrateCashfreeFields();
