const express = require('express');
const router = express.Router();
const EnvConfig = require('../model/EnvConfig.modal');
const EnvAuth = require('../model/EnvAuth.modal');

// Authentication middleware
const validateSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.envAuthToken ||
                  req.body?.token ||
                  req.query?.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required for configuration access',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const user = await EnvAuth.findOne({
      currentSessionToken: token,
      isActive: true
    });
    
    if (!user || !user.isValidSession(token)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session',
        code: 'INVALID_SESSION'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_ERROR'
    });
  }
};

// Get current environment configuration (PUBLIC - needed for app to function)
router.get('/current', async (req, res) => {
  try {
    let config = await EnvConfig.findOne({ configName: 'default', isActive: true });
    
    // If no config exists, create one with defaults
    if (!config) {
      config = new EnvConfig({ configName: 'default' });
      await config.save();
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching configuration',
      error: error.message
    });
  }
});

// Save environment configuration (PROTECTED)
router.post('/save', validateSession, async (req, res) => {
  try {
    const configData = req.body;
    
    // Remove MongoDB-specific fields if they exist
    delete configData._id;
    delete configData.__v;
    delete configData.createdAt;
    
    // Update or create configuration
    let config = await EnvConfig.findOne({ configName: 'default' });
    
    if (config) {
      // Update existing configuration
      Object.assign(config, configData);
      config.updatedAt = new Date();
      await config.save();
    } else {
      // Create new configuration
      config = new EnvConfig({
        ...configData,
        configName: 'default',
        isActive: true
      });
      await config.save();
    }
    
    res.json({
      success: true,
      message: 'Configuration saved successfully',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving configuration',
      error: error.message
    });
  }
});

// Reset to defaults (PROTECTED)
router.post('/reset', validateSession, async (req, res) => {
  try {
    // Delete existing config and let it recreate with defaults
    await EnvConfig.deleteOne({ configName: 'default' });
    
    // Create new default config
    const defaultConfig = new EnvConfig({ configName: 'default' });
    await defaultConfig.save();
    
    res.json({
      success: true,
      message: 'Configuration reset to defaults successfully',
      data: defaultConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting configuration',
      error: error.message
    });
  }
});

// Get all configurations (for backup/history)
// Get all configurations (PROTECTED)
router.get('/all', validateSession, async (req, res) => {
  try {
    const configs = await EnvConfig.find().sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching configurations',
      error: error.message
    });
  }
});

// Export configuration as .env file content (PROTECTED)
router.get('/export', validateSession, async (req, res) => {
  try {
    const config = await EnvConfig.findOne({ configName: 'default', isActive: true });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    // Generate .env file content with proper formatting
    const envLines = [
      '# ===========================================',
      '# 🌍 Environment Variables - Fullstack App',
      '# ===========================================',
      '# Generated from database configuration',
      '',
      '# ===========================================',
      '# 🎨 BRANDING & UI VARIABLES',
      '# ===========================================',
      `REACT_APP_FAM=${config.REACT_APP_FAM}`,
      `REACT_APP_BRAND_TAGLINE=${config.REACT_APP_BRAND_TAGLINE}`,
      `REACT_APP_LOGO=${config.REACT_APP_LOGO}`,
      `REACT_APP_MO=${config.REACT_APP_MO}`,
      `REACT_APP_ADDRESS=${config.REACT_APP_ADDRESS}`,
      '',
      '# Theme Colors',
      `REACT_APP_KEY_COLOR=${config.REACT_APP_KEY_COLOR}`,
      `REACT_APP_S_COLOR=${config.REACT_APP_S_COLOR}`,
      `REACT_APP_ADDRESS_BUTTON_COLOR=${config.REACT_APP_ADDRESS_BUTTON_COLOR}`,
      '',
      '# ===========================================',
      '# 🛍️ FEATURE TOGGLES',
      '# ===========================================',
      `REACT_APP_COD=${config.REACT_APP_COD}`,
      `REACT_APP_SIZE=${config.REACT_APP_SIZE}`,
      '',
      '# ===========================================',
      '# 💳 CASHFREE PAYMENT GATEWAY',
      '# ===========================================',
      `CASHFREE_ENABLED=${config.CASHFREE_ENABLED}`,
      `CASHFREE_CLIENT_ID=${config.CASHFREE_CLIENT_ID}`,
      `CASHFREE_CLIENT_SECRET=${config.CASHFREE_CLIENT_SECRET}`,
      `CASHFREE_ENVIRONMENT=${config.CASHFREE_ENVIRONMENT}`,
      '',
      '# ===========================================',
      '# 📊 ANALYTICS & TRACKING (Optional)',
      '# ===========================================',
      `REACT_APP_G4=${config.REACT_APP_G4}`,
      `REACT_APP_FBPIXEL=${config.REACT_APP_FBPIXEL}`,
      `REACT_APP_AW=${config.REACT_APP_AW}`,
      `REACT_APP_AW_CONVERSION_ID=${config.REACT_APP_AW_CONVERSION_ID || config.REACT_APP_PURCHASETAGGOOGLE || ''}`,
      `REACT_APP_TRACKING_USE_OFFER_PRICE=${config.REACT_APP_TRACKING_USE_OFFER_PRICE}`,
      '',
      '# ===========================================',
      '# ⚙️ ADVANCED FEATURES',
      '# ===========================================',
      `REACT_APP_DETECTION_MODE=${config.REACT_APP_DETECTION_MODE}`,
      `REACT_APP_OFFER_URL_SUFFIX=${config.REACT_APP_OFFER_URL_SUFFIX}`,
    ];
    
    const envContent = envLines.join('\n');
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=".env"');
    res.send(envContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting configuration',
      error: error.message
    });
  }
});

// Database migration endpoint for fixing REACT_APP_AW_CONVERSION_ID field
router.post('/migrate-conversion-id', async (req, res) => {
  try {
    
    // Find all EnvConfig documents
    const configs = await EnvConfig.find({});
    let migratedCount = 0;
    
    for (const config of configs) {
      let needsUpdate = false;
      const updates = {};
      
      // If the old field exists and new field doesn't, migrate it
      if (config.REACT_APP_PURCHASETAGGOOGLE && !config.REACT_APP_AW_CONVERSION_ID) {
        updates.REACT_APP_AW_CONVERSION_ID = config.REACT_APP_PURCHASETAGGOOGLE;
        needsUpdate = true;
      }
      
      // Ensure the new field exists (even if empty)
      if (!config.hasOwnProperty('REACT_APP_AW_CONVERSION_ID')) {
        updates.REACT_APP_AW_CONVERSION_ID = '';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await EnvConfig.updateOne({ _id: config._id }, { $set: updates });
        migratedCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Migration completed successfully. ${migratedCount} configurations updated.`,
      migratedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

// PUBLIC endpoint to fix Google Ads conversion ID automatically
router.post('/fix-conversion-id', async (req, res) => {
  try {
    
    const config = await EnvConfig.findOne({ configName: 'default' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    const currentConversionId = config.REACT_APP_AW_CONVERSION_ID;
    const googleAdsId = config.REACT_APP_AW; // e.g., "AW-17370500961"
    
    if (!googleAdsId || !googleAdsId.startsWith('AW-')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Ads ID format. Expected format: AW-XXXXXXXXXX'
      });
    }
    
    // Extract the correct conversion ID (just the number part)
    const correctConversionId = googleAdsId.replace('AW-', '');
    
    
    if (currentConversionId === correctConversionId) {
      return res.json({
        success: true,
        message: 'Conversion ID is already correct',
        data: {
          googleAdsId,
          conversionId: correctConversionId,
          changed: false
        }
      });
    }
    
    // Update the conversion ID
    config.REACT_APP_AW_CONVERSION_ID = correctConversionId;
    config.updatedAt = new Date();
    await config.save();
    
    
    res.json({
      success: true,
      message: 'Google Ads conversion ID fixed successfully',
      data: {
        googleAdsId,
        oldConversionId: currentConversionId,
        newConversionId: correctConversionId,
        changed: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fix conversion ID',
      error: error.message
    });
  }
});

// PUBLIC endpoint to test tracking configuration
router.get('/test-tracking', async (req, res) => {
  try {
    const config = await EnvConfig.findOne({ configName: 'default' });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    // Extract tracking IDs
    const tracking = {
      googleAnalytics: config.REACT_APP_G4 || '',
      facebookPixel: config.REACT_APP_FBPIXEL || '',
      googleAds: config.REACT_APP_AW || '',
      conversionId: config.REACT_APP_AW_CONVERSION_ID || ''
    };
    
    // Validate each ID
    const validation = {
      googleAnalytics: tracking.googleAnalytics.startsWith('G-'),
      facebookPixel: tracking.facebookPixel.length > 5,
      googleAds: tracking.googleAds.startsWith('AW-'),
      conversionId: /^\d+$/.test(tracking.conversionId)
    };
    
    const allValid = Object.values(validation).every(v => v);
    
    res.json({
      success: true,
      message: allValid ? 'All tracking IDs are valid' : 'Some tracking IDs need attention',
      data: {
        tracking,
        validation,
        status: allValid ? 'READY' : 'NEEDS_FIXING',
        summary: {
          valid: Object.values(validation).filter(v => v).length,
          total: Object.keys(validation).length,
          allValid
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test tracking configuration',
      error: error.message
    });
  }
});

module.exports = router;
