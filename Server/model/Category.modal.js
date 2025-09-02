/**
 * Category Database Model for E-Commerce Application
 * 
 * This Mongoose schema defines the structure for product category documents in MongoDB.
 * Categories are used to organize and group products for better navigation and filtering.
 * 
 * Category Features:
 * - Category name for display and identification
 * - Category image for visual representation in UI
 * - Aspect ratio configuration for consistent product image display
 * - Image fit mode for optimal product presentation
 * - Simple structure for efficient querying and population
 * 
 * Database Relationships:
 * - Referenced by Product model for product categorization
 * - Used in navigation menus and filtering systems
 * - Supports product aggregation and grouping operations
 */

const mongoose = require('mongoose');

/**
 * Category Schema Definition
 * 
 * Defines the structure for category documents with essential fields
 * for product organization and user interface display.
 */
const categorys = new mongoose.Schema({
    /**
     * Category Name
     * The display name of the category shown in navigation and filters
     */
    name: {
        type: String,
        require: true,
    },
    
    /**
     * Category Image
     * URL or path to the category's representative image for UI display
     */
    image: {
        type: String,
        require: true,
    },
    
    /**
     * Aspect Ratio Configuration
     * Numeric ratio (width/height) for consistent product image display
     * Default: 1 (square) for versatile display across all product types
     * Common values: 0.8 (4:5 portrait), 1 (square), 1.333 (4:3 landscape)
     */
    aspectRatio: {
        type: Number,
        default: 1,
        min: 0.1,
        max: 5
    },
    
    /**
     * Image Fit Mode
     * Determines how product images are displayed within the aspect ratio container
     * - 'contain': Shows full image with minimal padding (recommended for most products)
     * - 'cover': Fills container completely, may crop image for uniform appearance
     * - 'fill': Stretches image to fill container (may distort image)
     */
    fitMode: {
        type: String,
        enum: ['contain', 'cover', 'fill'],
        default: 'contain'
    }
});

/**
 * Export Category Model
 * 
 * Creates and exports the Mongoose model for categories collection.
 * This model is referenced by the Products model for categorization.
 */
module.exports = mongoose.model('categorys', categorys);
