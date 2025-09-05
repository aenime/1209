/**
 * Quick Script to Set Cashfree Credentials in Environment Configuration
 * 
 * This script updates the environment configuration with production Cashfree credentials
 * and fixes common deployment issues.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// Import the EnvConfig model
const EnvConfig = require('./model/EnvConfig.modal.js');

// MongoDB connection string
const dbName = process.env.DB || "kurti";
const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;

async function setCashfreeCredentials() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoString);
    console.log('✅ Connected to MongoDB');

    // Find the current active config or create a new one
    let config = await EnvConfig.findOne({ isActive: true });
    
    if (!config) {
      console.log('📝 Creating new environment configuration...');
      config = new EnvConfig({
        configName: 'Production Configuration',
        isActive: true
      });
    }

    // Update Cashfree credentials
    console.log('💳 Setting Cashfree production credentials...');
    config.CASHFREE_ENABLED = true;
    config.CASHFREE_APP_ID = '104850289018eb5138eb795eac92058401';
    config.CASHFREE_SECRET_KEY = 'cfsk_ma_prod_df3b7f6d9e170f5d5f5b4ac233f4708b_7e8fcd48';
    config.CASHFREE_ENVIRONMENT = 'production';

    // Ensure basic store settings are present
    if (!config.REACT_APP_FAM) {
      config.REACT_APP_FAM = 'Your Store Name';
    }
    if (!config.REACT_APP_BRAND_TAGLINE) {
      config.REACT_APP_BRAND_TAGLINE = 'SHOP ONLINE';
    }
    if (!config.REACT_APP_COD) {
      config.REACT_APP_COD = 'yes'; // Enable COD by default
    }

    // Save the configuration
    await config.save();
    console.log('✅ Cashfree credentials saved successfully!');

    // Display the configuration
    console.log('\n📋 Current Configuration:');
    console.log('- Cashfree Enabled:', config.CASHFREE_ENABLED);
    console.log('- Cashfree App ID:', config.CASHFREE_APP_ID);
    console.log('- Cashfree Environment:', config.CASHFREE_ENVIRONMENT);
    console.log('- Store Name:', config.REACT_APP_FAM);
    console.log('- COD Enabled:', config.REACT_APP_COD);

    console.log('\n🚀 Next Steps:');
    console.log('1. Restart your server to apply CSP changes');
    console.log('2. Go to /myadmin/env > Payment section');
    console.log('3. Verify the Cashfree credentials are loaded');
    console.log('4. Test the payment flow');

  } catch (error) {
    console.error('❌ Error setting Cashfree credentials:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
setCashfreeCredentials();
