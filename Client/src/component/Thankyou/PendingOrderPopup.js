/**
 * React Core and Navigation Imports
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Context Hooks
 */
import { useCart } from '../../contexts/CartContext';

/**
 * Heroicons for UI Elements
 */
import { 
  CheckCircleIcon, 
  ShoppingBagIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

/**
 * Pending Order Popup Component - Order Completion Notification
 * 
 * Modal popup for notifying users about completed orders:
 * - Displays order confirmation details
 * - Provides quick access to order status
 * - Offers continuation options for user flow
 * - Handles localStorage cleanup for fresh sessions
 * - Shows order summary with pricing information
 * - Maintains user engagement after purchase completion
 * 
 * Key Features:
 * - Non-intrusive popup design with overlay
 * - Order details display with formatted pricing
 * - Two action paths: view order details or continue shopping
 * - Complete localStorage cleanup when continuing shopping
 * - Consistent design language with checkout flow
 * - Mobile-responsive layout for all devices
 * 
 * Business Logic:
 * - Preserves order data when viewing order details
 * - Cleans all session data when continuing shopping
 * - Ensures clean state for new shopping sessions
 * - Maintains order tracking capabilities
 * - Provides smooth transition between purchase and browsing
 * 
 * User Experience:
 * - Clear visual hierarchy with success indicators
 * - Intuitive action buttons with distinct purposes
 * - Smooth animations and transitions
 * - Accessible design with proper contrast and sizing
 * - Non-blocking interface allowing background interaction
 * 
 * Props:
 * - isOpen: Controls popup visibility
 * - onClose: Callback function for closing popup
 * - orderData: Order information including pricing and items
 */
const PendingOrderPopup = ({ isOpen, onClose, orderData }) => {
  /**
   * Navigation and Context Hooks
   */
  const navigate = useNavigate();
  const { handleSetCartProducts } = useCart();

  /**
   * Early Return for Closed State
   * 
   * Performance optimization to prevent unnecessary rendering
   * when popup is not visible.
   */
  if (!isOpen) return null;

  /**
   * Simple Close Handler
   * 
   * Handles basic popup closure without data cleanup:
   * - Used for X button clicks
   * - Preserves order data for potential future access
   * - Maintains session state for order tracking
   */
  const handleSimpleClose = () => {
    onClose();
  };

  /**
   * Continue Shopping Handler with Complete Cleanup
   * 
   * Manages user transition back to shopping:
   * - Performs comprehensive localStorage cleanup
   * - Resets cart state in context
   * - Navigates to homepage for fresh shopping session
   * - Ensures clean state for new purchases
   * 
   * Cleanup Strategy:
   * - Removes all cart-related data
   * - Clears payment and order information
   * - Resets address and delivery data
   * - Cleans transaction and status data
   * - Updates context state for consistency
   */
  const handleContinueShopping = () => {
    const clearAllLocalData = () => {
      // Cart data cleanup
      localStorage.removeItem("cartProducts");
      localStorage.removeItem("slectedData");
      localStorage.removeItem("address");
      localStorage.removeItem("cartTotalPrice");
      localStorage.removeItem("cartTotalMRP");
      localStorage.removeItem("cartTotalDiscount");
      localStorage.removeItem("cartTotalExtraDiscount");
      
      // Payment and order data cleanup
      localStorage.removeItem("orderId");
      localStorage.removeItem("totalPrice");
      localStorage.removeItem("orderData");
      localStorage.removeItem("paymentMethod");
      localStorage.removeItem("selectedPaymentOption");
      localStorage.removeItem("customerInfo");
      localStorage.removeItem("deliveryAddress");
      localStorage.removeItem("orderStatus");
      localStorage.removeItem("transactionId");
      localStorage.removeItem("transactionIdData");
      
      // Context state cleanup
      handleSetCartProducts([]);
    };

    clearAllLocalData();
    onClose();
    navigate('/');
  };

  /**
   * View Order Handler
   * 
   * Navigates to order details page:
   * - Preserves order data for display
   * - Closes popup before navigation
   * - Maintains order tracking capabilities
   */
  const handleViewOrder = () => {
    onClose();
    navigate('/ThankYou');
  };

  /**
   * Final Amount Calculation
   * 
   * Calculates display amount using same logic as payment system:
   * - Uses totalPrice if available in orderData
   * - Falls back to cartTotalPrice for consistency
   * - Ensures pricing matches payment flow calculations
   * - Handles edge cases with default fallback to 0
   */
  const finalAmount = orderData?.totalPrice || parseFloat(orderData?.cartTotalPrice || 0) || 0;
  const displayAmount = orderData?.totalPrice || 
    (orderData?.cartTotalPrice ? parseFloat(orderData.cartTotalPrice) : 0) || 
    "0";
  const orderId = orderData?.orderId || "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 animate-zoom-in-95">
        
        {/* Close Button - Using handleSimpleClose to prevent data clearing */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSimpleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close popup"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Icon and Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse"></div>
            <div className="relative bg-yellow-500 rounded-full p-4 shadow-lg">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Your Order is Pending for Payment Confirmation
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            We found a pending order that needs your attention
          </p>
          
          <div className="inline-flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-lg font-bold border border-yellow-200">
            <span className="mr-1">₹</span>
            <span>{displayAmount}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Order ID:</span>
            <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
              {orderId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Payment Pending
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewOrder}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>View Order Details</span>
          </button>
          
          <button
            onClick={handleContinueShopping}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ShoppingBagIcon className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Trust Indicator */}
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            🔒 Secured by SSL encryption
          </span>
        </div>
      </div>
    </div>
  );
};

export default PendingOrderPopup;
