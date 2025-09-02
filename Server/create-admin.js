const mongoose = require('mongoose');
const EnvAuth = require('./model/EnvAuth.modal');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Facebook', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  
  try {
    // Check if admin already exists
    const adminExists = await EnvAuth.findOne({ username: 'admin' });
    
    if (adminExists) {
      await EnvAuth.deleteOne({ username: 'admin' });
    }
    
    // Create new admin user with known password
    const admin = new EnvAuth({
      username: 'admin',
      passwordHash: '11881188', // Will be hashed by pre-save hook
      isActive: true,
      createdBy: 'setup-script'
    });
    
    await admin.save();
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}).catch(error => {
  process.exit(1);
});
