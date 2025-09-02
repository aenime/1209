/**
 * React and Core Dependencies
 */
import React from "react";

/**
 * Context Hooks and Navigation
 */
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

/**
 * Component and Hook Imports
 */
import ProductGridTailwind from "../ProductGrid/ProductGridTailwind";
import useDynamicTitle from "../../hooks/useDynamicTitle";

/**
 * Wishlist Component - Customer Favorite Products Management
 * 
 * Complete wishlist interface featuring:
 * - Persistent favorite product storage across sessions
 * - Dynamic item count display in title and header
 * - Responsive product grid with optimized layout
 * - Empty state with engaging call-to-action
 * - Bulk actions for wishlist management
 * - Seamless integration with cart functionality
 * - Professional UI design with consistent branding
 * 
 * Key Features:
 * - Real-time wishlist item count in page title
 * - Mobile-responsive grid layout (1-4 columns based on screen size)
 * - Quick actions: Continue shopping and move all to cart
 * - Empty state with clear call-to-action
 * - Smooth transitions and hover effects
 * - Integrated cart functionality for easy purchasing
 * 
 * Business Logic:
 * - Wishlist persistence across browser sessions
 * - Dynamic title updates based on item count
 * - Bulk cart operations with proper size defaults
 * - Navigation integration for seamless user flow
 * - Professional empty state to encourage shopping
 * 
 * User Experience:
 * - Clear visual feedback for all interactions
 * - Intuitive navigation and action buttons
 * - Responsive design for all device sizes
 * - Professional appearance builds trust
 * - Seamless integration with shopping flow
 * 
 * @returns {JSX.Element} Complete wishlist management interface
 */
const Wishlist = () => {
  /**
   * Wishlist Context Integration
   * 
   * Manages favorite products with persistent storage:
   * - whiteListProducts: Array of saved favorite products
   * - handleSetWhiteListProducts: Function to toggle wishlist items
   */
  const {
    whiteListProducts,
    handleSetWhiteListProducts
  } = useWishlist();

  /**
   * Navigation Hook
   * 
   * Provides programmatic navigation for user flow management
   */
  const navigate = useNavigate();

  /**
   * Cart Context Integration
   * 
   * Enables bulk cart operations from wishlist:
   * - cartProducts: Current cart items array
   * - handleSetCartProducts: Function to update cart contents
   */
  const {
    cartProducts,
    handleSetCartProducts
  } = useCart();

  /**
   * Dynamic Page Title with Item Count
   * 
   * Creates SEO-friendly and user-friendly page titles:
   * - Shows item count for non-empty wishlists
   * - Uses proper singular/plural grammar
   * - Provides clear context for browser tabs
   * - Updates in real-time as items change
   */
  const wishlistTitle = whiteListProducts?.length > 0 
    ? `Wishlist (${whiteListProducts.length} ${whiteListProducts.length === 1 ? 'item' : 'items'})` 
    : 'Wishlist';
  useDynamicTitle(wishlistTitle);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section with Dynamic Content */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {whiteListProducts?.length > 0 
                  ? `${whiteListProducts.length} ${whiteListProducts.length === 1 ? 'item' : 'items'} saved`
                  : 'Save your favorite items here'
                }
              </p>
            </div>
            {whiteListProducts?.length > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  <i className="fas fa-heart text-red-500 mr-1"></i>
                  {whiteListProducts.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Conditional Content: Products Grid or Empty State */}
        {whiteListProducts?.length > 0 ? (
          <div>
            {/* Product Grid Display */}
            <ProductGridTailwind 
              products={whiteListProducts}
              columns={4}
              aspectRatio="square"
              className="mb-6"
            />

            {/* Additional Actions for Non-Empty Wishlist */}
            <div className="mt-12 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                  <p className="text-sm text-gray-500">Manage all your wishlist items at once</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      // Add all items to cart
                      const newCartItems = whiteListProducts.map(item => ({
                        ...item,
                        quantity: 1,
                        selectSize: "M"
                      }));
                      handleSetCartProducts([...(cartProducts || []), ...newCartItems]);
                      // Clear wishlist
                      whiteListProducts.forEach(item => handleSetWhiteListProducts(item));
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    <i className="fas fa-shopping-cart mr-2"></i>
                    Move All to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-heart-broken text-3xl text-red-400"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Start adding items to your wishlist by clicking the heart icon on products you love.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-shopping-bag mr-2"></i>
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
