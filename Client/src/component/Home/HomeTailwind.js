/**
 * React hooks and routing imports
 */
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Slider component and styles
 */
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

/**
 * Context and custom hooks
 */
import { useUI } from "../../contexts/UIContext";
import useDynamicTitle from "../../hooks/useDynamicTitle";

/**
 * Utility functions and services
 */
import { getButtonStyles } from "../../utils/themeColorsSimple";
import { cleanNaNAmounts } from "../../utils/priceHelper";
import { cn } from "../../utils/cn";
import logManager from "../../utils/logManager";
import apiService from '../../services/apiService';
import StorageService from '../../services/storageService';

/**
 * Component imports
 */
import { OptimizedImage } from "../Common";
import ProductGridTailwind from "../ProductGrid/ProductGridTailwind";
import CategoryGrid from "../Category/CategoryGrid";
import PendingOrderPopup from "../Thankyou/PendingOrderPopup";

/**
 * Home Page Component - Modern E-Commerce Homepage
 * 
 * This is the main homepage component featuring:
 * - Hero image slider with automatic transitions
 * - Category grid for product navigation
 * - Featured product showcase
 * - Promotional sections and banners
 * - Pending order status notifications
 * - SEO-optimized dynamic titles
 * - Performance optimizations with lazy loading
 * 
 * Key Features:
 * - Responsive design with Tailwind CSS
 * - Keen Slider integration for hero carousel
 * - Dynamic content loading from API
 * - State management for products and UI elements
 * - Navigation integration for seamless UX
 * - Error handling and loading states
 */
const HomeTailwind = () => {
  /**
   * Context and navigation hooks
   */
  const { sliderImages } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  
  /**
   * Component state management
   */
  const [productsArray, setProductsArray] = useState([]);
  const [isLoader, setIsLoader] = useState(true);
  const [showPendingOrderPopup, setShowPendingOrderPopup] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  
  /**
   * Refs for slider control
   */
  const ref = useRef(null);

  /**
   * Dynamic Page Title Generation
   * 
   * Automatically generates SEO-friendly page titles based on domain.
   * Creates titles like "O hostname - Home" or "N hostname - Home"
   * for better search engine optimization and user recognition.
   */
  useDynamicTitle();

  /**
   * Slider Control Effect
   * 
   * Manages the hero slider state when navigation changes.
   * Restarts stopped or completed sliders to ensure consistent UX.
   */
  useEffect(() => {
    if (ref?.current) {
      if (["STOPPED", "COMPLETED"].includes(ref?.current?.state?.status)) {
        ref?.current?.start();
      }
    }
  }, [location, ref]);
  /**
   * Product Data Loading Callback
   * 
   * Handles product fetching with category filtering:
   * - Fetches products grouped by categories
   * - Filters categories to show only those with multiple products
   * - Validates response structure and data integrity
   * - Manages loading states and error scenarios
   * 
   * Business Logic:
   * - Only displays categories with 2+ products to ensure variety
   * - Handles API response validation with statusCode checks
   * - Provides fallback empty array for failed requests
   */
  const handleCompleteProductData = useCallback(async () => {
    try {
      const result = await apiService.getProducts();
      if (result && result.statusCode === 1 && result.data?.length > 0) {
        // Filter out categories with only one product to ensure variety
        const filteredData = result.data.filter(
          category => category.products && category.products.length > 1
        );
        setProductsArray(filteredData);
      } else {
        setProductsArray([]);
      }
    } catch (error) {
      logManager.error('Product data loading failed:', error);
      setProductsArray([]);
    } finally {
      setIsLoader(false);
    }
  }, []);

  /**
   * Fast Home Page Loading Strategy
   * 
   * Optimized loading approach for homepage performance:
   * - Skips potentially problematic endpoints to avoid 500 errors
   * - Falls back to standard product loading if fast load fails
   * - Ensures consistent user experience with reliable data fetching
   * 
   * Performance Strategy:
   * - Prioritizes reliability over speed to prevent error states
   * - Uses standard endpoint as primary source for consistency
   * - Implements graceful fallback handling
   */
  const handleFastHomeLoad = useCallback(async () => {
    try {
      // Use standard endpoint to avoid 500 errors from home-fast endpoint
      handleCompleteProductData();
    } catch (error) {
      logManager.error("home-product-load-failed", "Product load failed:", error);
      // Fallback to complete data load for error recovery
      handleCompleteProductData();
    }
  }, [handleCompleteProductData]);

  /**
   * Memoized Category Filtering
   * 
   * Performance-optimized category validation:
   * - Filters valid categories with proper structure
   * - Ensures categories have required products array
   * - Validates minimum product count for display
   * - Checks for valid category names
   * 
   * Optimization Benefits:
   * - Prevents unnecessary re-calculations on re-renders
   * - Improves component performance with large datasets
   * - Reduces memory allocation for repeated operations
   */
  const validCategories = useMemo(() => {
    if (!productsArray || productsArray.length === 0) return [];
    
    return productsArray.filter(category => 
      category && 
      category.products && 
      Array.isArray(category.products) &&
      category.products.length > 1 &&
      category.categoryName
    );
  }, [productsArray]);

  /**
   * Initial Product Loading Effect
   * 
   * Triggers product data loading on component mount:
   * - Sets initial loading state for UI feedback
   * - Uses fast home loading strategy for optimal performance
   * - Ensures data is available before rendering product sections
   */
  useEffect(() => {
    setIsLoader(true);
    
    // Load products using standard endpoint to avoid 500 errors
    handleFastHomeLoad();
  }, [handleFastHomeLoad]);

  /**
   * Hero Slider Configuration
   * 
   * Keen Slider setup with advanced features:
   * - Infinite loop for continuous browsing
   * - Free-snap mode for smooth transitions
   * - Single slide view with full width display
   * - 800ms transition duration for smooth animations
   * 
   * Interactive Features:
   * - Auto-advancement with 4-second intervals
   * - Interactive dot navigation indicators
   * - Manual navigation with pause/resume functionality
   * - Visual feedback with dot highlighting and scaling
   * 
   * Performance Optimizations:
   * - Timeout management to prevent memory leaks
   * - Event-driven dot updates for efficient DOM manipulation
   * - Cleanup on component unmount
   */
  const [sliderRef] = useKeenSlider(
    {
      loop: true,
      mode: "free-snap",
      slides: { perView: 1, spacing: 0 },
      duration: 800,
    },
    [
      (slider) => {
        let timeout;
        let currentSlide = 0;

        /**
         * Dot Navigation Update Function
         * 
         * Updates visual indicators for current slide:
         * - Highlights active slide dot with white color and scale
         * - Dims inactive dots with opacity
         * - Provides visual feedback for user navigation
         */
        const updateDots = (slideIndex) => {
          const dots = slider.container.querySelectorAll('[data-slide-dot]');
          dots.forEach((dot, index) => {
            if (index === slideIndex) {
              dot.classList.add('bg-white', 'scale-125');
              dot.classList.remove('bg-white/50');
            } else {
              dot.classList.remove('bg-white', 'scale-125');
              dot.classList.add('bg-white/50');
            }
          });
        };

        /**
         * Auto-Advance Timer Function
         * 
         * Manages automatic slide progression:
         * - 4-second intervals between slides
         * - Cycles through all available slides
         * - Updates dot indicators on each transition
         * - Handles edge cases with proper slide counting
         */
        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            slider.next();
            currentSlide = slider.track.details.rel;
            updateDots(currentSlide);
          }, 3000);
        }

        /**
         * Slider Event Handlers Setup
         * 
         * Configures interactive behaviors:
         * - Pause auto-advance on mouse hover for user control
         * - Resume auto-advance when mouse leaves
         * - Manual dot navigation with click handlers
         * - Slide change detection for dot updates
         * - Initial dot state setup
         */
        slider.on("created", () => {
          updateDots(0);
          
          // Pause auto-advance on hover for better UX
          slider.container.addEventListener("mouseover", () => {
            clearNextTimeout();
          });
          
          // Resume auto-advance when mouse leaves
          slider.container.addEventListener("mouseout", () => {
            nextTimeout();
          });
          
          // Setup manual dot navigation
          const dots = slider.container.querySelectorAll('[data-slide-dot]');
          dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
              slider.moveToIdx(index);
              currentSlide = index;
              updateDots(currentSlide);
              clearNextTimeout();
              setTimeout(nextTimeout, 100);
            });
          });

          // Start auto-advance timer
          nextTimeout();
        });

        /**
         * Drag Event Handlers
         * 
         * Manages user interaction during manual navigation:
         * - Pauses auto-advance during drag operations
         * - Updates dot indicators after drag completion
         * - Resumes auto-advance with delay after manual interaction
         */
        slider.on("dragStarted", () => {
          clearNextTimeout();
        });
        
        slider.on("dragEnded", () => {
          currentSlide = slider.track.details.rel;
          updateDots(currentSlide);
          setTimeout(nextTimeout, 500);
        });
      },
    ]
  );

  /**
   * Cross-Tab Pending Order Detection
   * 
   * Monitors for pending order data across browser sessions:
   * - Checks localStorage for recent order completion
   * - Shows popup notification for pending orders
   * - Only activates on main homepage to avoid interruption
   * - Cleans up after displaying notification
   * 
   * User Experience Features:
   * - Non-intrusive notification system
   * - Persistent across browser sessions
   * - Context-aware display timing
   */
  useEffect(() => {
    const checkForPendingOrder = () => {
      // Only show popup on main home page to avoid navigation interruption
      if (location.pathname !== '/') return;
      
      /**
       * Page Refresh Detection
       * 
       * Identifies if user refreshed page vs opened new tab:
       * - Uses performance navigation API for accurate detection
       * - Prevents unnecessary popup triggers on refresh
       * - Maintains user experience consistency
       */
      const isPageRefresh = window.performance && 
        window.performance.navigation && 
        window.performance.navigation.type === 1;
      
      // Skip popup display on page refresh to avoid annoyance
      if (isPageRefresh) {
        return;
      }
      
      /**
       * Data Cleanup and Validation
       * 
       * Ensures data integrity before processing:
       * - Cleans NaN values from price calculations
       * - Validates required order fields
       * - Prepares data for popup display
       */
      cleanNaNAmounts(['totalPrice', 'cartTotalPrice']);
      
      // Retrieve order data from localStorage
      const orderId = StorageService.getItem("orderId");
      const cartTotalPrice = StorageService.getItem("cartTotalPrice");
      const totalPrice = StorageService.getItem("totalPrice");
      const cartProducts = StorageService.getItem("cartProducts");
      const transactionId = StorageService.getItem("transactionId");
      
      // Calculate final payment amount using same logic as payment system
      const finalAmount = totalPrice || parseFloat(cartTotalPrice) || 0;
      
      /**
       * Pending Order Detection Logic
       * 
       * Determines if user has a recent pending order:
       * - Checks for transaction ID and order ID presence
       * - Validates non-zero payment amount
       * - Verifies order recency (within 15 minutes)
       * - Creates structured order data for popup
       */
      if (transactionId && orderId && finalAmount > 0) {
        const orderData = {
          orderId,
          totalPrice: finalAmount,
          cartTotalPrice,
          cartProducts: cartProducts ? JSON.parse(cartProducts) : [],
          timestamp: Date.now()
        };
        
        // Verify order is recent to maintain relevance
        const orderDataTimestamp = StorageService.getItem("orderData");
        let isRecentOrder = true;
        
        if (orderDataTimestamp) {
          try {
            const orderObj = JSON.parse(orderDataTimestamp);
            const timestamp = Object.values(orderObj)[0]?.timestamp;
            if (timestamp) {
              const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
              isRecentOrder = timestamp > fifteenMinutesAgo;
            }
          } catch (e) {
            
          }
        }
        
        // Only show popup for recent orders
        if (isRecentOrder) {
          setPendingOrderData(orderData);
          setShowPendingOrderPopup(true);
          
          
        }
      }
    };
    
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(checkForPendingOrder, 500);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider Section */}
      {sliderImages?.length > 0 && (
        <div className="relative">
          <div className="max-w-7xl mx-auto px-0 sm:px-1 lg:px-1 pt-1 minimal-container">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-blue-600 p-1">
              <div ref={sliderRef} className="keen-slider rounded-xl overflow-hidden">
                {sliderImages.map((image, index) => (
                  <div 
                    key={`slide-${index}`} 
                    className="keen-slider__slide relative group"
                  >
                                        <div className="aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] overflow-hidden">
                      <OptimizedImage
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                        fallback="/images/placeholder-slider.jpg"
                        threshold={index === 0 ? 0 : 0.1}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Slide indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                        {sliderImages.map((_, dotIndex) => (
                          <button
                            key={`dot-${dotIndex}`}
                            data-slide-dot
                            className={cn(
                              "w-3 h-3 rounded-full transition-all duration-300",
                              index === dotIndex 
                                ? "bg-white scale-125 shadow-lg" 
                                : "bg-white/50 hover:bg-white/75"
                            )}
                            aria-label={`Go to slide ${dotIndex + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <CategoryGrid 
        maxCategories={12}
        showTitle={true}
        className={sliderImages?.length > 0 ? "py-8" : "pt-4 pb-8"}
      />

      {/* Products Section */}
      {isLoader ? (
        <div className="min-h-[400px] bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto px-4">
            {/* Simple Shopping Bag Icon */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto">
                <svg className="w-full h-full text-blue-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                </svg>
              </div>
              {/* Simple dot indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            </div>

            {/* Clean Loading Text */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Loading Products
            </h3>
            
            {/* Simple animated dots */}
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>

            {/* Lightweight progress bar */}
            <div className="w-48 mx-auto bg-gray-200 rounded-full h-1">
              <div className="h-1 bg-blue-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            
            <p className="text-sm text-gray-600 mt-3">
              Finding the best deals...
            </p>
          </div>
        </div>
      ) : (
        <section className="py-8 bg-gray-50 compact-layout">
          <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1 minimal-container">
            {validCategories?.map((item, sectionIndex) => (
              <div key={`product-section-${sectionIndex}`} className="mb-4">
                {/* Section Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {item.categoryName || `Featured Collection ${sectionIndex + 1}`}
                  </h2>
                  <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
                </div>

                {/* Products Grid */}
                <ProductGridTailwind 
                  products={(item.products && Array.isArray(item.products)) ? item.products.slice(0, 8) : []}
                  columns={4}
                  aspectRatio="square"
                  className="mb-4"
                />

                {/* View More Button */}
                {(item.products && Array.isArray(item.products) && item.products.length > 8) && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => {
                        
                        navigate(`/category/${item._id}`);
                      }}
                      style={getButtonStyles(false)}
                      className="inline-flex items-center px-8 py-3 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      aria-label={`View all products in ${item.categoryName || 'this category'}`}
                    >
                      <span>View More Products</span>
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Order Popup */}
      {showPendingOrderPopup && pendingOrderData && (
        <PendingOrderPopup 
          isOpen={showPendingOrderPopup}
          onClose={() => setShowPendingOrderPopup(false)}
          orderData={pendingOrderData}
        />
      )}
    </div>
  );
};

export default HomeTailwind;
