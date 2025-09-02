/**
 * Product Routes Module - E-Commerce Product and Category API Endpoints
 * 
 * Defines RESTful API routes for product and category management:
 * - Complete CRUD operations for products and categories
 * - Standardized HTTP methods and response patterns
 * - Cross-origin request support with CORS headers
 * - RESTful URL structure for intuitive API usage
 * 
 * Route Structure:
 * - Products: /api/products/* for all product operations
 * - Categories: /api/category/* for all category operations
 * - Individual resources: /:id pattern for specific items
 * 
 * HTTP Methods:
 * - POST: Create new resources
 * - GET: Retrieve resources
 * - PUT: Update existing resources
 * - DELETE: Remove resources
 * 
 * Security Features:
 * - CORS headers for cross-origin requests
 * - Consistent header configuration
 * - Controller-based request handling
 */

/**
 * Product Controller Import
 * 
 * Imports all product and category controller functions
 * that handle the actual business logic for each endpoint.
 */
const ProductController = require('../Controller/Products.controller');

/**
 * Product Routes Configuration
 * 
 * Configures all product and category related API endpoints:
 * 
 * @param {Object} app - Express application instance
 * 
 * Product Endpoints:
 * - POST /api/products/add - Create new products (bulk or single)
 * - GET /api/products/get - Retrieve all products with category grouping
 * - GET /api/products/:productId - Get specific product details
 * - PUT /api/products/update/:productId - Update existing product
 * - DELETE /api/products/delete/:productId - Remove product
 * 
 * Category Endpoints:
 * - POST /api/category/add - Create new category
 * - GET /api/category/get - Retrieve all categories
 * - GET /api/category/:categoryId - Get specific category with products
 * - PUT /api/category/update/:categoryId - Update existing category
 * - DELETE /api/category/delete/:categoryId - Remove category
 */
module.exports = function (app) {
    /**
     * CORS Middleware Configuration
     * 
     * Sets up cross-origin resource sharing headers:
     * - Allows requests from different domains
     * - Supports standard content types
     * - Enables modern web application integration
     */
    app.use(function (req, res, next) {
        res.header("Access-Control-Headers", "Origin, Content-Type, Accept");
        next();
    });

    /**
     * Product Management Routes
     */
    // Create new products (supports bulk insertion)
    app.post('/api/products/add', ProductController.addProducts);
    
    // Retrieve all products grouped by categories
    app.get('/api/products/get', ProductController.getProducts);
    
    // Get specific product details by ID
    app.get('/api/products/:productId', ProductController.selecteProduct);
    
    // Update existing product information
    app.put('/api/products/update/:productId', ProductController.updateProduct);
    
    // Delete product by ID
    app.delete('/api/products/delete/:productId', ProductController.deleteProduct);

    /**
     * Category Management Routes
     */
    // Create new category
    app.post('/api/category/add', ProductController.addCategory);
    
    // Retrieve all categories
    app.get('/api/category/get', ProductController.getCategory);
    
    // Get specific category with associated products
    app.get('/api/category/:categoryId', ProductController.getSelectedCategory);
    
    // Update existing category information
    app.put('/api/category/update/:categoryId', ProductController.updateCategory);
    
    // Delete category by ID
    app.delete('/api/category/delete/:categoryId', ProductController.deleteCategory);
}