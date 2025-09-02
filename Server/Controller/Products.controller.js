/**
 * Product and Category Controller
 * 
 * This controller handles all CRUD operations for products and categories
 * in the e-commerce application. It provides endpoints for:
 * - Adding products and categories in bulk
 * - Retrieving all categories and individual categories
 * - Managing product data and category relationships
 * 
 * Database Models:
 * - Products: Product information (title, price, images, etc.)
 * - Categories: Product categories for organization and filtering
 */

/**
 * Database Models
 */
const Products = require("../model/Products.modal");
const Categorys = require("../model/Category.modal");

/**
 * Add Products in Bulk
 * 
 * Allows adding multiple products at once using MongoDB's insertMany operation.
 * Used primarily by admin interfaces for bulk product imports.
 * 
 * @param {Object} req - Express request object
 * @param {Array} req.body - Array of product objects to insert
 * @param {Object} res - Express response object
 */
exports.addProducts = (req, res) => {
  Products.insertMany(req.body)
    .then((result) => {
      res.status(200).json({
        message: "Products add Successfull",
        result,
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: "Somthing wrong!",
        error,
      });
    });
};

/**
 * Add Categories in Bulk
 * 
 * Allows adding multiple categories at once using MongoDB's insertMany operation.
 * Used by admin interfaces for category management.
 * 
 * @param {Object} req - Express request object
 * @param {Array} req.body - Array of category objects to insert
 * @param {Object} res - Express response object
 */
exports.addCategory = (req, res) => {
  Categorys.insertMany(req.body)
    .then((result) => {
      res.status(200).json({
        message: "Products add Successfull",
        result,
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: "Somthing wrong!",
        error,
      });
    });
};

/**
 * Get All Categories
 * 
 * Retrieves all product categories from the database.
 * Used for navigation menus, filters, and category listings.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCategory = async (req, res) => {
  try {
    const categorys = await Categorys.find();
    res.status(200).json({ statusCode: 1, data: categorys });
  } catch (err) {
    res.status(200).json({ statusCode: 0, data: "Internal Server Error" });
  }
};

/**
 * Get Single Category by ID
 * 
 * Retrieves a specific category by its MongoDB ObjectId.
 * Used for category detail pages and filtering operations.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.categoryId - Category ID to retrieve
 * @param {Object} res - Express response object
 */
exports.getSelectedCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const category = await Categorys.findById(categoryId);

    res.status(200).json({ statusCode: 1, data: category });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCategoryWiseProducts = async () => {
  try {
    const categoryWiseProducts = await Categorys.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $project: {
          categoryName: "$name",
          products: {
            $slice: ["$products", 18], // Limit to 12 products per category
          },
        },
      },
    ]);

    return categoryWiseProducts;
  } catch (error) {
    throw error;
  }
};

exports.getProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const sort = req.query.sort == "desc" ? -1 : 1;
    const page = Number(req.query.page) || 1;
    const category = req.query.category;
    const showAll = req.query.showAll === 'true'; // New parameter to show all products

    if (category) {
      const countQuery = { category: category };
      const total = await Products.countDocuments(countQuery);

      const skip = (page - 1) * limit;
      const findQuery = { category: category };

      const products = await Products.find(findQuery)
        .populate("category")
        .select(["-__v"])
        .limit(showAll ? 0 : limit) // Remove limit if showAll is true
        .skip(showAll ? 0 : skip)   // Remove skip if showAll is true
        .sort({ _id: sort });

      res.json({ statusCode: 1, data: products, total, limit: showAll ? products.length : limit });
    } else {
      if (showAll) {
        // Return all products without category grouping for management purposes
        const allProducts = await Products.find({})
          .populate("category")
          .select(["-__v"])
          .sort({ _id: sort });
        
        res.json({ statusCode: 1, data: allProducts, total: allProducts.length });
      } else {
        // Return category-wise products with default limits for frontend display
        const result = await getCategoryWiseProducts();
        res.json({ statusCode: 1, data: result, limit: 18 });
      }
    }
  } catch (error) {
    res.status(500).json({ statusCode: 0, data: "Internal Server Error" });
  }
};

exports.selecteProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const relatedProducts = await Products.find({
      category: product.category,
      _id: { $ne: productId }, // Exclude the current product
    });

    res.status(200).json({ product, relatedProducts });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updateData = req.body;

    const product = await Products.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        statusCode: 0,
        message: "Product not found",
      });
    }

    res.status(200).json({
      statusCode: 1,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      message: "Internal Server Error",
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Products.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        statusCode: 0,
        message: "Product not found",
      });
    }

    res.status(200).json({
      statusCode: 1,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      message: "Internal Server Error",
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updateData = req.body;

    const category = await Categorys.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        statusCode: 0,
        message: "Category not found",
      });
    }

    res.status(200).json({
      statusCode: 1,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      message: "Internal Server Error",
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Check if category is used by any products
    const productsUsingCategory = await Products.countDocuments({
      category: categoryId,
    });

    if (productsUsingCategory > 0) {
      return res.status(400).json({
        statusCode: 0,
        message: `Cannot delete category. ${productsUsingCategory} products are using this category.`,
      });
    }

    const category = await Categorys.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({
        statusCode: 0,
        message: "Category not found",
      });
    }

    res.status(200).json({
      statusCode: 1,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 0,
      message: "Internal Server Error",
    });
  }
};
