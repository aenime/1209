const mongoose = require('mongoose');

const envConfigSchema = new mongoose.Schema({
  configName: {
    type: String,
    default: 'default',
    unique: true
  },
  
  // Branding & UI
  REACT_APP_FAM: { type: String, default: '' },
  REACT_APP_BRAND_TAGLINE: { type: String, default: '' },
  REACT_APP_LOGO: { type: String, default: '' },
  REACT_APP_MO: { type: String, default: '' },
  REACT_APP_ADDRESS: { type: String, default: '' },
  
  // Theme Colors
  REACT_APP_KEY_COLOR: { type: String, default: '' },
  REACT_APP_S_COLOR: { type: String, default: '' },
  REACT_APP_ADDRESS_BUTTON_COLOR: { type: String, default: '' },
  
  // Feature Toggles
  REACT_APP_COD: { type: String, default: '' },
  REACT_APP_SIZE: { type: String, default: '' },
  
  // Cashfree Payment Gateway
  CASHFREE_ENABLED: { type: Boolean, default: false },
  CASHFREE_CLIENT_ID: { type: String, default: '' },
  CASHFREE_CLIENT_SECRET: { type: String, default: '' },
  CASHFREE_ENVIRONMENT: { type: String, default: 'sandbox', enum: ['sandbox', 'production'] },
  
  // Analytics
  REACT_APP_G4: { type: String, default: '' },
  REACT_APP_FBPIXEL: { type: String, default: '' },
  REACT_APP_AW: { type: String, default: '' },
  REACT_APP_AW_CONVERSION_ID: { type: String, default: '' }, // Fixed: was REACT_APP_PURCHASETAGGOOGLE
  REACT_APP_TRACKING_USE_OFFER_PRICE: { type: String, default: '' },
  
  // Advanced
  REACT_APP_DETECTION_MODE: { type: String, default: '0' },
  REACT_APP_OFFER_URL_SUFFIX: { type: String, default: '' },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Update timestamp on save
envConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EnvConfig', envConfigSchema);
