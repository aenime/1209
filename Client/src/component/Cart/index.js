/**
 * React Core and Navigation Imports
 */
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Context Hooks
 */
import { useCart } from "../../contexts/CartContext";
import { useProduct } from "../../contexts/ProductContext";
import { useUI } from "../../contexts/UIContext";
import { useOffer } from "../../contexts/OfferContext";

/**
 * Custom Hooks
 */
import useDynamicTitle from "../../hooks/useDynamicTitle";

/**
 * Utility Functions
 */
import { getButtonColor } from "../../utils/themeColorsSimple";
import { setPaymentAmount } from "../../utils/priceHelper";
import API_BASE_URL from "../../config/api";

/**
 * Component Imports
 */
import CheckoutSteps from "./CheckoutSteps";
import CartSummary from "./CartSummary";
import CartItem from "./CartItem";
import CartRecommendations from "./CartRecommendations";
import UrgencyTimer from "./UrgencyTimer";
import FrequentlyBoughtTogether from "./FrequentlyBoughtTogether";
import SizeChart from "../SizeChart/SizeChart";

/**
 * Shopping Cart Component - Complete E-Commerce Cart Experience
 * 
 * Main shopping cart interface featuring:
 * - Dynamic cart item management with real-time updates
 * - Advanced pricing calculations with offer integrations
 * - Size and quantity selection modals
 * - Cart recommendations and upselling
 * - Urgency timers for limited-time offers
 * - Frequently bought together suggestions
 * - Responsive design for all devices
 * - Checkout process integration
 * 
 * Key Features:
 * - Real-time price calculations with discount applications
 * - Offer eligibility detection and automatic application
 * - Dynamic cart title showing item count
 * - Product customization (size, quantity) with modal interfaces
 * - Cart abandonment prevention with urgency indicators
 * - Cross-sell and upsell recommendations
 * - Seamless checkout flow integration
 * - Persistent cart state across sessions
 */
const Cart = () => {
  // Navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  /**
   * Cart Context Data and Functions
   * 
   * Provides complete cart management functionality:
   * - cartProducts: Array of items currently in cart
   * - handleSetCartProducts: Function to update cart items
   * - Price calculations: totalDiscount, totalMRP, totalPrice
   * - Product selection: selectedProduct for customization
   * - Offer calculations: totalExtraDiscount for promotional pricing
   */
  const {
    cartProducts,
    handleSetCartProducts,
    totalDiscount,
    totalMRP,
    selectedProduct,
    setSelectedProduct,
    totalExtraDiscount,
    totalPrice: contextTotalPrice, // Calculated price from CartContext
  } = useCart();

  /**
   * Additional Context Data
   */
  const { relatedProducts } = useProduct();
  const { setStep } = useUI();
  const { isEligibleForOffers } = useOffer();

  /**
   * Local state for cart recommendations and payment status
   */
  const [cartRecommendations, setCartRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState(null);

  /**
   * Handle payment return status messages
   */
  useEffect(() => {
    if (location.state) {
      const { paymentFailed, paymentError, paymentTimeout, message, reason } = location.state;
      
      if (paymentFailed || paymentError || paymentTimeout) {
        let statusMessage = {
          type: 'error',
          title: 'Payment Issue',
          text: message || 'There was an issue with your payment'
        };

        if (paymentFailed) {
          statusMessage.title = reason === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed';
          statusMessage.text = reason === 'cancelled' 
            ? 'Your payment was cancelled. Your items are still in your cart.'
            : 'Payment could not be processed. Please try again.';
        } else if (paymentTimeout) {
          statusMessage.title = 'Payment Timeout';
          statusMessage.text = 'Payment processing took too long. Please try again.';
        }

        setPaymentStatusMessage(statusMessage);
        
        // Clear the state after showing the message
        window.history.replaceState(null, '');
        
        // Auto-hide message after 8 seconds
        setTimeout(() => {
          setPaymentStatusMessage(null);
        }, 8000);
      }
    }
  }, [location.state]);

  /**
   * Fetch recommendations for cart page
   */
  useEffect(() => {
    const fetchCartRecommendations = async () => {
      try {
        setRecommendationsLoading(true);
        
        // If we already have related products, use them
        if (relatedProducts && relatedProducts.length > 0) {
          setCartRecommendations(relatedProducts);
          setRecommendationsLoading(false);
          return;
        }

        // Otherwise, fetch random products as recommendations
        const response = await fetch(`${API_BASE_URL}/api/products/get`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Get random products excluding items already in cart
          const availableProducts = data.data.filter(product => 
            !cartProducts?.some(cartItem => cartItem._id === product._id)
          );
          
          // Shuffle and take first 4 products
          const shuffled = availableProducts.sort(() => 0.5 - Math.random());
          const recommendations = shuffled.slice(0, 4);
          
          setCartRecommendations(recommendations);
        } else {
          setCartRecommendations([]);
        }
      } catch (error) {
        console.warn('Failed to fetch cart recommendations:', error);
        setCartRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    // Only fetch if cart has items
    if (cartProducts && cartProducts.length > 0) {
      fetchCartRecommendations();
    } else {
      setRecommendationsLoading(false);
      setCartRecommendations([]);
    }
  }, [cartProducts, relatedProducts]);

  /**
   * Dynamic Page Title with Cart Count
   * 
   * Updates browser title to reflect current cart state:
   * - Shows item count in parentheses
   * - Uses singular/plural forms correctly
   * - Falls back to generic title for empty cart
   */
  const cartTitle = cartProducts?.length > 0 
    ? `Shopping Cart (${cartProducts.length} ${cartProducts.length === 1 ? 'item' : 'items'})` 
    : 'Shopping Cart';
  useDynamicTitle(cartTitle);
  
  /**
   * Theme Configuration
   */
  const themColor = getButtonColor();
  
  /**
   * Modal State Management
   * 
   * Manages various modal interfaces for cart customization:
   * - Size selection modal for product variants
   * - Quantity modification modal
   * - Size chart display modal
   * - Modal-specific quantity tracking before confirmation
   */
  const [showSizeModal, setShowSizeModal] = useState({
    show: false,
    product: {},
  });
  
  const [showQuantityModal, setShowQuantityModal] = useState({
    show: false,
    product: {},
  });
  
  const [showSizeChart, setShowSizeChart] = useState(false);
  
  /**
   * Modal Quantity State
   * 
   * Tracks quantity changes within modal before user confirmation:
   * - Prevents immediate cart updates during user interaction
   * - Allows users to cancel changes
   * - Confirms changes only on modal submission
   */
  const [modalQuantity, setModalQuantity] = useState(1);
  
  /**
   * Cart Products Selection Effect
   * 
   * Synchronizes cart products with selected products for checkout:
   * - Updates selectedProduct when cart changes
   * - Ensures checkout process has current cart data
   * - Maintains consistency between cart and checkout states
   */
  useEffect(() => {
    if (cartProducts?.length > 0) {
      setSelectedProduct(cartProducts);
    }
  }, [cartProducts, setSelectedProduct]);

  /**
   * Total Price Calculation
   * 
   * Uses the calculated total price from CartContext:
   * - Includes Buy 2 Get 1 Free offer calculations
   * - Applies all discounts and promotional pricing
   * - Ensures consistent pricing across components
   * - Falls back to 0 for empty cart scenarios
   */
  const totalPrice = contextTotalPrice || 0;

  /**
   * Checkout Navigation Handler
   * 
   * Manages transition from cart to checkout process:
   * - Sets payment amount using utility function for consistency
   * - Handles payment amount validation and error cases
   * - Updates UI step for checkout flow tracking
   * - Navigates to address collection page
   * - Ensures proper checkout state initialization
   */
  const handleCheckoutNavigation = () => {
    // Set payment amount using centralized utility for consistency
    const success = setPaymentAmount(totalPrice, 'cart-checkout');
    
    if (!success) {
      // Payment amount setting failed - handled by utility function
      console.warn('Payment amount setting failed during checkout');
    } else {
      // Payment amount successfully set
      console.log('Payment amount set for checkout:', totalPrice);
    }
    
    // Initialize checkout flow
    setStep(1);
    navigate("/address");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Compact Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                Cart
              </h1>
              {cartProducts?.length > 0 && (
                <p className="text-xs text-gray-600">
                  {cartProducts.length} item{cartProducts.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Message */}
      {paymentStatusMessage && (
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className={`p-4 rounded-lg border ${
            paymentStatusMessage.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {paymentStatusMessage.type === 'error' ? (
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium">
                  {paymentStatusMessage.title}
                </h3>
                <p className="mt-1 text-sm">
                  {paymentStatusMessage.text}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setPaymentStatusMessage(null)}
                  className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-8">
        {cartProducts?.length === 0 ? (
          // Enhanced Empty Cart State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16" style={{ backgroundColor: 'var(--primary-color)', opacity: 0.1 }}></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-12 -translate-x-12" style={{ backgroundColor: 'var(--secondary-color)', opacity: 0.1 }}></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 5a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Discover amazing products and start building your perfect order
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="group relative w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Start Shopping
                  </span>
                  <div className="absolute inset-0 bg-blue-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Mobile-Optimized Cart Layout
          <div className="lg:grid lg:grid-cols-3 lg:gap-6 mt-3">
            {/* Main Content - Full width on mobile, 2/3 on desktop */}
            <div className="lg:col-span-2 space-y-3">
              {/* Mobile-only Steps Progress */}
              <div className="block lg:hidden">
                <CheckoutSteps
                  currentStep={1}
                  totalItems={cartProducts?.length || 0}
                  totalPrice={totalPrice}
                  showProgressBar={false}
                  onProceedToCheckout={handleCheckoutNavigation}
                />
              </div>

              {/* Compact Select All Header for Mobile */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedProduct?.length === cartProducts?.length}
                        onChange={() => {
                          if (selectedProduct?.length === cartProducts?.length) {
                            setSelectedProduct([]);
                          } else {
                            setSelectedProduct(cartProducts);
                          }
                        }}
                      />
                      <div className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                        selectedProduct?.length === cartProducts?.length
                          ? "bg-blue-500 border-transparent"
                          : "border-gray-300 group-hover:border-blue-400"
                      }`}>
                        {selectedProduct?.length === cartProducts?.length && (
                          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      Select All ({cartProducts?.length})
                    </span>
                  </label>
                  
                  <button
                    onClick={() => {
                      handleSetCartProducts([]);
                      setSelectedProduct([]);
                    }}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-600 text-xs font-medium transition-all duration-200 hover:bg-red-50 px-2 py-1 rounded"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-2">
                {cartProducts?.map((product, index) => (
                  <CartItem
                    key={product?._id || index}
                    product={product}
                    isSelected={selectedProduct?.some((p) => p._id === product._id)}
                    onToggleSelect={(product) => {
                      const isCurrentlySelected = selectedProduct?.some((p) => p._id === product._id);
                      if (isCurrentlySelected) {
                        setSelectedProduct(selectedProduct.filter((p) => p._id !== product._id));
                      } else {
                        setSelectedProduct([...selectedProduct, product]);
                      }
                    }}
                    onRemove={(product) => {
                      const updatedCart = cartProducts.filter((item) => item._id !== product._id);
                      handleSetCartProducts(updatedCart);
                      const updatedSelected = selectedProduct.filter((item) => item._id !== product._id);
                      setSelectedProduct(updatedSelected);
                    }}
                    showSizeSelector={() => setShowSizeModal({ show: true, product })}
                    showQuantitySelector={() => {
                      setModalQuantity(product?.quantity || 1);
                      setShowQuantityModal({ show: true, product });
                    }}
                  />
                ))}
              </div>

              {/* Urgency Timer - Displayed on both Mobile and Desktop */}
              {cartProducts?.length > 0 && (
                <UrgencyTimer 
                  initialMinutes={15} 
                  showStockAlert={true}
                  lowStockCount={3}
                  className="mt-3"
                />
              )}

              {/* Frequently Bought Together section */}
              {/* Frequently Bought Together - Conditionally render based on cart products and related products */}
              {cartProducts?.length > 0 && relatedProducts?.length > 0 && (
                <FrequentlyBoughtTogether 
                  mainProduct={cartProducts[0]}
                  suggestedProducts={relatedProducts?.slice(0, 3) || []}
                  onAddToCart={(products) => {
                    const newCartProducts = [
                      ...(cartProducts || []),
                      ...products.map(product => ({ ...product, quantity: 1 }))
                    ];
                    handleSetCartProducts(newCartProducts);
                    setSelectedProduct(newCartProducts);
                  }}
                  themColor={themColor}
                />
              )}
              
              {/* Compact Safety Section - Hidden on Mobile */}
              <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 ml-2">Safe & Secure</h3>
                </div>
                
                {/* Premium Quality Badge */}
                <div className="w-full h-32 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Background Stars */}
                  <div className="absolute inset-0">
                    <div className="absolute top-3 left-4 text-white opacity-30">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <div className="absolute top-6 right-6 text-white opacity-30">
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <div className="absolute bottom-4 left-3 text-white opacity-30">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Badge Content */}
                  <div className="text-center text-white relative z-10">
                    <div className="flex items-center justify-center mb-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <div className="text-lg font-bold italic mb-0.5" style={{ fontFamily: 'Georgia, serif' }}>Premium</div>
                    <div className="text-lg font-bold italic" style={{ fontFamily: 'Georgia, serif' }}>quality</div>
                    <div className="mt-2 border-t border-white border-opacity-30 pt-1">
                      <div className="flex justify-center space-x-1">
                        <div className="w-1 h-3 bg-white"></div>
                        <div className="w-1 h-4 bg-white"></div>
                        <div className="w-1 h-2 bg-white"></div>
                        <div className="w-1 h-4 bg-white"></div>
                        <div className="w-1 h-3 bg-white"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Border Circle */}
                  <div className="absolute inset-2 border-2 border-white border-opacity-20 rounded-lg"></div>
                </div>
              </div>

              {/* Cart Recommendations - Visible on Mobile and Desktop */}
              <div className="mt-3">
                <CartRecommendations
                  recommendations={cartRecommendations}
                  currentCartItems={cartProducts}
                  isLoading={recommendationsLoading}
                  onAddToCart={(product) => {
                    const newProduct = { ...product, quantity: 1 };
                    handleSetCartProducts([...(cartProducts || []), newProduct]);
                    setSelectedProduct([...(selectedProduct || []), newProduct]);
                  }}
                  themColor={themColor}
                />
              </div>
            </div>

            {/* Right Column - Cart Summary (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <CartSummary
                  selectedProduct={selectedProduct}
                  totalPrice={totalPrice}
                  totalMRP={totalMRP}
                  totalDiscount={totalDiscount}
                  totalExtraDiscount={totalExtraDiscount}
                  onProceedToCheckout={handleCheckoutNavigation}
                  themColor={themColor}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Cart Summary - Appears in normal flow */}
        {cartProducts?.length > 0 && (
          <div className="lg:hidden mt-6">
            <CartSummary
              selectedProduct={selectedProduct}
              totalPrice={totalPrice}
              totalMRP={totalMRP}
              totalDiscount={totalDiscount}
              totalExtraDiscount={totalExtraDiscount}
              onProceedToCheckout={handleCheckoutNavigation}
              themColor={themColor}
            />
          </div>
        )}
      </div>

      {/* Mobile-Optimized Checkout Footer */}
      {cartProducts?.length > 0 && selectedProduct?.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-50 safe-area-bottom">
          {/* Full-width slider - only show for offer eligible users */}
          {isEligibleForOffers && (
            <div className="bg-red-500 text-white py-1 text-center text-xs font-medium overflow-hidden">
              <div 
                className="flex whitespace-nowrap"
                style={{
                  animation: 'marquee 15s linear infinite',
                }}
              >
                <span className="mx-8 flex-shrink-0">🎉 BUY 3 PRODUCTS GET CHEAPEST FREE 🎉</span>
                <span className="mx-8 flex-shrink-0">🔥 LIMITED TIME OFFER 🔥</span>
                <span className="mx-8 flex-shrink-0">⚡ SAVE MORE TODAY ⚡</span>
                <span className="mx-8 flex-shrink-0">🎉 BUY 3 PRODUCTS GET CHEAPEST FREE 🎉</span>
                <span className="mx-8 flex-shrink-0">🔥 LIMITED TIME OFFER 🔥</span>
                <span className="mx-8 flex-shrink-0">⚡ SAVE MORE TODAY ⚡</span>
              </div>
              
              <style>
                {`
                  @keyframes marquee {
                    0% {
                      transform: translateX(0%);
                    }
                    100% {
                      transform: translateX(-50%);
                    }
                  }
                `}
              </style>
            </div>
          )}
          
          <div className="py-3 pb-safe">
            {/* Top row - Quick info */}
            <div className="flex items-center justify-between mb-2">
            </div>
            
            {/* Checkout button - Touch optimized */}
            <div className="px-4">
              <button
                onClick={handleCheckoutNavigation}
                style={{ backgroundColor: getButtonColor() }}
                className="w-full text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2 min-h-[48px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Checkout Now • ₹{totalPrice.toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Size Selection Modal */}
      {showSizeModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Select Size</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1"
                  >
                    <span>Size Chart</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowSizeModal({ show: false, product: {} })}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(showSizeModal.product?.size || ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"]).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      const updatedCart = cartProducts.map((p) => {
                        if (p._id === showSizeModal.product._id) {
                          return { ...p, size };
                        }
                        return p;
                      });
                      handleSetCartProducts(updatedCart);
                      setSelectedProduct(updatedCart);
                      setShowSizeModal({ show: false, product: {} });
                    }}
                    className={`flex items-center justify-center h-10 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                      showSizeModal.product.size === size
                        ? "bg-blue-500 text-white border-transparent"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowSizeModal({ show: false, product: {} })}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const updatedCart = cartProducts.map((p) => {
                      if (p._id === showSizeModal.product._id) {
                        return { ...p, selectedSize: p.size };
                      }
                      return p;
                    });
                    handleSetCartProducts(updatedCart);
                    setSelectedProduct(updatedCart);
                    setShowSizeModal({ show: false, product: {} });
                  }}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Quantity Selection Modal */}
      {showQuantityModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-2xl shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Select Quantity</h3>
                <button
                  onClick={() => setShowQuantityModal({ show: false, product: {} })}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 text-sm">Available Stock: <span className="font-semibold">{showQuantityModal.product?.stock || 10}</span></span>
              </div>

              <div className="flex items-center justify-between border-t border-b py-2">
                <span className="text-gray-700 text-sm">Current Quantity</span>
                <span className="text-gray-900 font-semibold">
                  {modalQuantity}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    if (modalQuantity > 1) {
                      setModalQuantity(modalQuantity - 1);
                    }
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-gray-200 disabled:opacity-50"
                  disabled={modalQuantity <= 1}
                >
                  <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                  Decrease
                </button>
                
                <button
                  onClick={() => {
                    const maxStock = showQuantityModal.product?.stock || 10;
                    if (modalQuantity < maxStock) {
                      setModalQuantity(modalQuantity + 1);
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                  disabled={modalQuantity >= (showQuantityModal.product?.stock || 10)}
                >
                  <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                  </svg>
                  Increase
                </button>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowQuantityModal({ show: false, product: {} });
                    setModalQuantity(1);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Apply the modal quantity to the actual cart
                    const updatedCart = cartProducts.map((p) => {
                      if (p._id === showQuantityModal.product._id) {
                        return { ...p, quantity: modalQuantity };
                      }
                      return p;
                    });
                    handleSetCartProducts(updatedCart);
                    setSelectedProduct(updatedCart);
                    setShowQuantityModal({ show: false, product: {} });
                    setModalQuantity(1);
                  }}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Size Chart Modal */}
      <SizeChart
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        category="unisex"
      />
    </div>
  );
};

export default Cart;
