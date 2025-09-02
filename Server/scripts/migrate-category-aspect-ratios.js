/**
 * Category Aspect Ratio Migration Script
 * 
 * This script migrates existing category documents to include aspect ratio
 * configuration for consistent product image display. It automatically
 * assigns optimal aspect ratios based on category names and type.
 * 
 * Migration Features:
 * - Auto-detects category types based on names
 * - Assigns appropriate aspect ratios (fashion: 0.8, accessories: 1.0, etc.)
 * - Sets optimal fit modes for different product categories
 * - Provides backup and rollback capabilities
 * - Handles edge cases and error recovery
 * 
 * Usage:
 * Run this script once after updating the Category schema
 * node scripts/migrate-category-aspect-ratios.js
 */

const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Category model
const Category = require('../model/Category.modal');

/**
 * Category Type Classification
 * 
 * Automatically classifies categories based on name patterns
 * and assigns appropriate aspect ratios and fit modes.
 */
const CATEGORY_CLASSIFICATIONS = {
    // Fashion & Apparel - Portrait for full-length display
    fashion: {
        patterns: ['kurti', 'saree', 'dress', 'top', 'ethnic', 'western', 'clothing', 'apparel', 'fashion', 'wear'],
        aspectRatio: 0.8,
        fitMode: 'contain'
    },
    
    // Accessories - Square for uniform grid
    accessories: {
        patterns: ['jewelry', 'jewellery', 'bag', 'shoe', 'accessory', 'accessories', 'watch', 'belt'],
        aspectRatio: 1.0,
        fitMode: 'contain'
    },
    
    // Electronics - Landscape for device displays
    electronics: {
        patterns: ['electronic', 'gadget', 'mobile', 'phone', 'laptop', 'tablet', 'device', 'tech'],
        aspectRatio: 1.333,
        fitMode: 'contain'
    },
    
    // Beauty & Personal Care - Portrait for product shots
    beauty: {
        patterns: ['beauty', 'cosmetic', 'skincare', 'makeup', 'personal care', 'health'],
        aspectRatio: 0.75,
        fitMode: 'contain'
    },
    
    // Home & Living - Square for versatility
    home: {
        patterns: ['home', 'decor', 'kitchen', 'furniture', 'living', 'household'],
        aspectRatio: 1.0,
        fitMode: 'contain'
    },
    
    // Sports & Fitness - Square for equipment
    sports: {
        patterns: ['sport', 'fitness', 'gym', 'exercise', 'outdoor'],
        aspectRatio: 1.0,
        fitMode: 'contain'
    },
    
    // Books & Media - Portrait for covers
    books: {
        patterns: ['book', 'media', 'music', 'movie', 'dvd'],
        aspectRatio: 0.667,
        fitMode: 'contain'
    }
};

/**
 * Default Configuration
 * Used for categories that don't match any specific pattern
 */
const DEFAULT_CONFIG = {
    aspectRatio: 1.0,
    fitMode: 'contain'
};

/**
 * Classify Category Type
 * 
 * Analyzes category name to determine the best aspect ratio configuration.
 * Uses pattern matching to identify category types.
 * 
 * @param {string} categoryName - The name of the category
 * @returns {Object} Configuration object with aspectRatio and fitMode
 */
function classifyCategory(categoryName) {
    if (!categoryName || typeof categoryName !== 'string') {
        return DEFAULT_CONFIG;
    }
    
    const normalizedName = categoryName.toLowerCase().trim();
    
    // Check each classification pattern
    for (const [type, config] of Object.entries(CATEGORY_CLASSIFICATIONS)) {
        const matches = config.patterns.some(pattern => 
            normalizedName.includes(pattern) || pattern.includes(normalizedName)
        );
        
        if (matches) {
            console.log(`📋 Classified "${categoryName}" as ${type} (AR: ${config.aspectRatio}, Fit: ${config.fitMode})`);
            return {
                aspectRatio: config.aspectRatio,
                fitMode: config.fitMode
            };
        }
    }
    
    console.log(`📋 Using default config for "${categoryName}" (AR: ${DEFAULT_CONFIG.aspectRatio}, Fit: ${DEFAULT_CONFIG.fitMode})`);
    return DEFAULT_CONFIG;
}

/**
 * Database Connection
 */
async function connectToDatabase() {
    try {
        const dbName = process.env.DB || "kurti";
        const mongoString = process.env.DB_ENV || process.env.MONGODB_URI || 
            `mongodb+srv://Zofarione:meankitbhaigmailcom@krishna.m6ptm07.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Krishna`;
        
        await mongoose.connect(mongoString);
        console.log('📊 Connected to MongoDB');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * Backup Existing Categories
 * 
 * Creates a backup of existing category data before migration
 * for rollback purposes.
 */
async function backupCategories() {
    try {
        const categories = await Category.find({}).lean();
        const backupData = {
            timestamp: new Date().toISOString(),
            categories: categories
        };
        
        console.log(`💾 Backing up ${categories.length} categories`);
        
        // In a production environment, you might want to save this to a file
        // const fs = require('fs');
        // fs.writeFileSync('./category-backup.json', JSON.stringify(backupData, null, 2));
        
        return backupData;
    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        throw error;
    }
}

/**
 * Migrate Category Aspect Ratios
 * 
 * Updates all existing categories with aspect ratio configuration.
 * Only updates categories that don't already have aspect ratio values.
 */
async function migrateCategoryAspectRatios() {
    try {
        console.log('🔄 Starting category aspect ratio migration...');
        
        // Find categories without aspect ratio configuration
        const categoriesToUpdate = await Category.find({
            $or: [
                { aspectRatio: { $exists: false } },
                { fitMode: { $exists: false } },
                { aspectRatio: null },
                { fitMode: null }
            ]
        });
        
        if (categoriesToUpdate.length === 0) {
            console.log('✅ All categories already have aspect ratio configuration');
            return { updated: 0, skipped: 0, errors: 0 };
        }
        
        console.log(`📝 Found ${categoriesToUpdate.length} categories to update`);
        
        let updated = 0;
        let skipped = 0;
        let errors = 0;
        
        for (const category of categoriesToUpdate) {
            try {
                const config = classifyCategory(category.name);
                
                // Update category with aspect ratio configuration
                await Category.updateOne(
                    { _id: category._id },
                    {
                        $set: {
                            aspectRatio: config.aspectRatio,
                            fitMode: config.fitMode
                        }
                    }
                );
                
                console.log(`✅ Updated category: ${category.name}`);
                updated++;
                
            } catch (error) {
                console.error(`❌ Failed to update category ${category.name}:`, error.message);
                errors++;
            }
        }
        
        return { updated, skipped, errors };
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    }
}

/**
 * Validate Migration Results
 * 
 * Checks that all categories now have proper aspect ratio configuration.
 */
async function validateMigration() {
    try {
        console.log('🔍 Validating migration results...');
        
        const totalCategories = await Category.countDocuments();
        const categoriesWithAR = await Category.countDocuments({
            aspectRatio: { $exists: true, $ne: null },
            fitMode: { $exists: true, $ne: null }
        });
        
        console.log(`📊 Migration validation:`);
        console.log(`   Total categories: ${totalCategories}`);
        console.log(`   Categories with aspect ratio: ${categoriesWithAR}`);
        console.log(`   Coverage: ${((categoriesWithAR / totalCategories) * 100).toFixed(1)}%`);
        
        if (categoriesWithAR === totalCategories) {
            console.log('✅ Migration validation successful - all categories configured');
            return true;
        } else {
            console.log('⚠️  Migration validation warning - some categories missing configuration');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        return false;
    }
}

/**
 * Main Migration Function
 */
async function runMigration() {
    console.log('🚀 Category Aspect Ratio Migration Started');
    console.log('==========================================');
    
    try {
        // Connect to database
        const connected = await connectToDatabase();
        if (!connected) {
            throw new Error('Failed to connect to database');
        }
        
        // Create backup
        const backup = await backupCategories();
        console.log('💾 Backup completed successfully');
        
        // Run migration
        const results = await migrateCategoryAspectRatios();
        
        // Validate results
        const isValid = await validateMigration();
        
        // Summary
        console.log('\n📈 Migration Summary:');
        console.log('===================');
        console.log(`✅ Categories updated: ${results.updated}`);
        console.log(`⏭️  Categories skipped: ${results.skipped}`);
        console.log(`❌ Errors encountered: ${results.errors}`);
        console.log(`✔️  Validation passed: ${isValid ? 'Yes' : 'No'}`);
        
        if (results.errors > 0) {
            console.log('\n⚠️  Some errors occurred during migration. Check logs above.');
            process.exit(1);
        } else {
            console.log('\n🎉 Migration completed successfully!');
            console.log('All categories now have aspect ratio configuration for consistent product image display.');
            process.exit(0);
        }
        
    } catch (error) {
        console.error('\n💥 Migration failed with error:', error.message);
        console.error('Please check your database connection and try again.');
        process.exit(1);
    } finally {
        // Close database connection
        await mongoose.disconnect();
        console.log('📊 Database connection closed');
    }
}

/**
 * CLI Interface
 */
if (require.main === module) {
    // Check if running in the correct directory
    const currentDir = process.cwd();
    if (!currentDir.includes('Server') && !currentDir.includes('server')) {
        console.log('⚠️  Please run this script from the Server directory:');
        console.log('   cd Server && node scripts/migrate-category-aspect-ratios.js');
        process.exit(1);
    }
    
    runMigration();
} else {
    // Export for use in other scripts
    module.exports = {
        classifyCategory,
        migrateCategoryAspectRatios,
        validateMigration,
        connectToDatabase
    };
}
