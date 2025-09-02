const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const envAuthSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  
  // Hashed password with salt
  passwordHash: {
    type: String,
    required: true
  },
  
  // Salt for password hashing
  salt: {
    type: String,
    required: false, // Will be set by pre-save hook
    default: null
  },
  
  // Account security
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Failed login attempts tracking
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  
  // Account lockout until this time
  lockedUntil: {
    type: Date,
    default: null
  },
  
  // Last successful login
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Login IP tracking for security
  lastLoginIP: {
    type: String,
    default: null
  },
  
  // Session management
  currentSessionToken: {
    type: String,
    default: null
  },
  
  sessionExpiry: {
    type: Date,
    default: null
  },
  
  // Security settings
  requireIPWhitelist: {
    type: Boolean,
    default: false
  },
  
  allowedIPs: [{
    type: String
  }],
  
  // Two-factor authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    default: null
  },
  
  // Password reset
  resetToken: {
    type: String,
    default: null
  },
  
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  
  // Audit trail
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  createdBy: {
    type: String,
    default: 'system'
  }
});

// Constants for security
envAuthSchema.statics.MAX_LOGIN_ATTEMPTS = 5;
envAuthSchema.statics.LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
envAuthSchema.statics.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Hash password before saving
envAuthSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    // Generate salt
    this.salt = crypto.randomBytes(32).toString('hex');
    
    // Hash password with salt
    this.passwordHash = await bcrypt.hash(this.passwordHash + this.salt, 12);
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Check if account is locked
envAuthSchema.methods.isLocked = function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
};

// Increment failed login attempts
envAuthSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockedUntil: 1 },
      $set: { failedLoginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { failedLoginAttempts: 1 } };
  
  // If we've reached max attempts and it's not locked, lock it
  if (this.failedLoginAttempts + 1 >= envAuthSchema.statics.MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockedUntil: Date.now() + envAuthSchema.statics.LOCKOUT_TIME };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts after successful login
envAuthSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { failedLoginAttempts: 1, lockedUntil: 1 }
  });
};

// Compare password
envAuthSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const hashedCandidate = await bcrypt.hash(candidatePassword + this.salt, 12);
    return await bcrypt.compare(candidatePassword + this.salt, this.passwordHash);
  } catch (error) {
    return false;
  }
};

// Generate session token
envAuthSchema.methods.generateSessionToken = function() {
  const token = crypto.randomBytes(64).toString('hex');
  this.currentSessionToken = token;
  this.sessionExpiry = new Date(Date.now() + envAuthSchema.statics.SESSION_TIMEOUT);
  return token;
};

// Validate session
envAuthSchema.methods.isValidSession = function(token) {
  return (
    this.currentSessionToken === token &&
    this.sessionExpiry &&
    this.sessionExpiry > new Date() &&
    this.isActive
  );
};

// Check IP whitelist
envAuthSchema.methods.isIPAllowed = function(ip) {
  if (!this.requireIPWhitelist) return true;
  return this.allowedIPs.includes(ip) || this.allowedIPs.includes('127.0.0.1') || this.allowedIPs.includes('localhost');
};

// Generate password reset token
envAuthSchema.methods.generateResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return token;
};

// Create default admin user if none exists
envAuthSchema.statics.createDefaultAdmin = async function() {
  try {
    const adminExists = await this.findOne({ username: 'admin' });
    if (!adminExists) {
      const defaultPassword = crypto.randomBytes(16).toString('hex');
      
      const admin = new this({
        username: 'admin',
        passwordHash: defaultPassword, // Will be hashed by pre-save hook
        isActive: true,
        createdBy: 'system'
      });
      
      await admin.save();
      
      
      return { username: 'admin', password: defaultPassword };
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = mongoose.model('EnvAuth', envAuthSchema);
