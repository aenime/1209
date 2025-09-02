/**
 * DATABASE MIGRATION SCRIPT
 * 
 * This script will:
 * 1. Update the database schema to rename REACT_APP_PURCHASETAGGOOGLE to REACT_APP_AW_CONVERSION_ID
 * 2. Ensure all existing records are updated
 */

const mongoose = require('mongoose');

// Database migration function
async function migrateEnvConfigField() {
  try {
    
    // Get the EnvConfig collection directly
    const db = mongoose.connection.db;
    const collection = db.collection('envconfigs'); // MongoDB collection name is usually lowercase/plural
    
    // Find all documents that have the old field
    const documents = await collection.find({
      REACT_APP_PURCHASETAGGOOGLE: { $exists: true }
    }).toArray();
    
    
    if (documents.length > 0) {
      // Update each document
      for (const doc of documents) {
        const updateResult = await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              REACT_APP_AW_CONVERSION_ID: doc.REACT_APP_PURCHASETAGGOOGLE || ''
            },
            $unset: {
              REACT_APP_PURCHASETAGGOOGLE: ""
            }
          }
        );
        
      }
    }
    
    // Also ensure the field exists in all documents (even if empty)
    const allDocuments = await collection.find({}).toArray();
    for (const doc of allDocuments) {
      if (!doc.hasOwnProperty('REACT_APP_AW_CONVERSION_ID')) {
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              REACT_APP_AW_CONVERSION_ID: ''
            }
          }
        );
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Export for use in server
module.exports = { migrateEnvConfigField };

// For direct execution
if (require.main === module) {
  // Connect to database and run migration
  const runMigration = async () => {
    try {
      // You'll need to update this connection string to match your setup
      await mongoose.connect('mongodb://localhost:27017/your-database-name');
      
      await migrateEnvConfigField();
      
      await mongoose.disconnect();
    } catch (error) {
      process.exit(1);
    }
  };
  
  runMigration();
}
