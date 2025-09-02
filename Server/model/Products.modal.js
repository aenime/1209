/**
 * Product Database Model for E-Commerce Application
 * 
 * This Mongoose schema defines the structure for product documents in MongoDB.
 * It includes all essential product information for an e-commerce platform:
 * 
 * Product Features:
 * - Basic product information (title, description, details)
 * - Image gallery support with multiple images
 * - Pricing with original price and discounted price
 * - Size variants for clothing/apparel products
 * - Customer rating system
 * - Category relationship via ObjectId reference
 * 
 * Database Relationships:
 * - References 'categorys' collection for product categorization
 * - Supports MongoDB populate() for category data retrieval
 */

const mongoose = require('mongoose');

/**
 * Product Schema Definition
 * 
 * Defines the structure and validation rules for product documents.
 * Each field includes appropriate data types and validation requirements.
 */
const products = new mongoose.Schema({
    /**
     * Product Title
     * The display name of the product shown to customers
     */
    title: {
        type: String,
        require: true,
    },
    
    /**
     * Product Description
     * Detailed description of the product for customer information
     */
    description: {
        type: String,
        require: true,
    },
    
    /**
     * Product Details
     * Additional technical or specific details about the product
     */
    productDetails: {
        type: String,
        require: true,
    },
    
    /**
     * Product Images
     * Array of image URLs for product gallery display
     */
    images: {
        type: Array,
        require: true,
    },
    
    /**
     * Original Price
     * The base price of the product (MRP/original price)
     */
    price: {
        type: Number,
        require: true,
    },
    
    /**
     * Discounted Price
     * The selling price after applying discounts (optional)
     */
    discount: {
        type: Number,
    },
    
    /**
     * Available Sizes
     * Array of size options for the product (e.g., S, M, L, XL)
     */
    size: {
        type: Array,
    },
    
    /**
     * Customer Rating
     * Average rating given by customers (1-5 scale)
     */
    rating: {
        type: Number,
    },
    
    /**
     * Product Category Reference
     * MongoDB ObjectId referencing the category this product belongs to
     */
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorys' // References the 'categorys' collection
    }
});

/**
 * Export Product Model
 * 
 * Creates and exports the Mongoose model for products collection.
 * This model can be used throughout the application for CRUD operations.
 */
module.exports = mongoose.model('products', products);