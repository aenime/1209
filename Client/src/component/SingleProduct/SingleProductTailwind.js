/**
 * React Core and Navigation Imports
 */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

/**
 * Slider Library
 */
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

/**
 * Context Hooks and Custom Hooks
 */
import { useCart } from "../../contexts/CartContext";
import { useProduct } from "../../contexts/ProductContext";
import { useOffer } from "../../contexts/OfferContext";
import useDynamicTitle from "../../hooks/useDynamicTitle";

/**
 * Component Imports
 */
import { OptimizedImage } from "../Common";
import SkeletonLoader from "../SkeletonLoader";
import QualityAssurance from "./QualityAssurance";
import UrgencyCreator from "./UrgencyCreator";
import DynamicActionButtons from "./DynamicActionButtons";
import FlashSaleTimer from "./FlashSaleTimer";
import ProductDetails from "./ProductDetails";
import SizeChart from "../SizeChart/SizeChart";
import ProductCardTailwind from "../ProductCard/ProductCardTailwind";

/**
 * Utility Functions and Configuration
 */
import { isSizeEnabled } from "../../utils/envConfig";
import { cn } from "../../utils/cn";
import trackingManager from "../../utils/trackingManager";
import { logViewContent } from "../../utils/enhancedTrackingIntegration";
import priceHelper, { getTrackingPrice } from "../../utils/priceHelper";
import { getPrimaryThemeColor, getSecondaryThemeColor, adjustBrightness } from "../../utils/themeColorsSimple";
import { getPaymentOptions } from "../../utils/offerManager";

/**
 * API Configuration and Assets
 */
import API_BASE_URL from "../../config/api";
import safePaymentIcon from "../../assets/image/safe-payment-icon.svg";

/**
 * Thumbnail Plugin for Product Image Slider
 * 
 * Creates synchronized thumbnail navigation for main product images:
 * - Manages active state for currently viewed image
 * - Handles click events for thumbnail navigation
 * - Synchronizes main slider with thumbnail slider
 * - Provides visual feedback for current image selection
 * 
 * Features:
 * - Auto-updates active thumbnail based on main slider position
 * - Click-to-navigate functionality
 * - Smooth synchronization between sliders
 * - Responsive thumbnail grid layout
 * 
 * @param {Object} mainRef - Reference to the main image slider
 * @returns {Function} Keen Slider plugin function
 */
function ThumbnailPlugin(mainRef) {
  return (slider) => {
    /**
     * Remove Active State from All Thumbnails
     * 
     * Clears the active class from all thumbnail slides
     * to prepare for new active state assignment.
     */
    function removeActive() {
      slider.slides.forEach((slide) => {
        slide.classList.remove("active");
      });
    }

    /**
     * Add Active State to Specific Thumbnail
     * 
     * Applies active styling to the thumbnail at the given index
     * to indicate which image is currently being viewed.
     * 
     * @param {number} idx - Index of the thumbnail to activate
     */
    function addActive(idx) {
      slider.slides[idx].classList.add("active");
    }

    /**
     * Add Click Event Handlers to Thumbnails
     * 
     * Attaches click listeners to each thumbnail that navigate
     * the main slider to the corresponding image.
     */
    function addClickEvents() {
      slider.slides.forEach((slide, idx) => {
        slide.addEventListener("click", () => {
          if (mainRef.current) mainRef.current.moveToIdx(idx);
        });
      });
    }

    /**
     * Initialize Plugin on Slider Creation
     * 
     * Sets up the initial state and event handlers:
     * - Activates the first thumbnail
     * - Adds click event handlers
     * - Synchronizes with main slider animation events
     */
    slider.on("created", () => {
      if (!mainRef.current) return;
      addActive(slider.track.details.rel);
      addClickEvents();
      mainRef.current.on("animationStarted", (main) => {
        removeActive();
        const next = main.animator.targetIdx || 0;
        addActive(main.track.absToRel(next));
        slider.moveToIdx(Math.min(slider.track.details.maxIdx, next));
      });
    });
  };
}

/* Main Product Component */
const SingleProductTailwind = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef();

  // Offer system integration
  const { showOffer, isOfferEligible } = useOffer();

  // State for product tracking
  const [hasTracked, setHasTracked] = useState({});
  // State Management
  const [selectSize, setSelectSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [urgencyLevel] = useState("high"); // For dynamic action buttons
  const relatedProductsRef = useRef(null);

  // Cart Context
  const {
    addOrUpdateCartProduct,
    cartProducts
  } = useCart();

  // Product Context  
  const {
    setSingleProduct,
    singleProduct,
    setRelatedProducts,
  } = useProduct();

  // Initialize state with singleProduct
  const [singleData, setSingleData] = useState(singleProduct || {});
  const [reletedProduct, setReletedProduct] = useState([]);

  // Dynamic title with product name
  const productTitle = singleData?.productName 
    ? `${singleData.productName}` 
    : null;
  useDynamicTitle(productTitle);

  // Get dynamic colors
  const primaryColor = getPrimaryThemeColor();
  const secondaryColor = getSecondaryThemeColor();

  // Comprehensive size options from XS to 5XL
  const comprehensiveSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  
  // Use product-specific sizes if available, otherwise use comprehensive sizes
  const availableSizes = singleData?.size?.length > 0 ? singleData.size : comprehensiveSizes;

  // Enhanced Slider Configurations for Auto-Sizing
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      mode: "snap",
      origin: "center",
      slides: { perView: 1 },
    },
    []
  );

  const [thumbnailRef] = useKeenSlider(
    {
      initial: 0,
      slides: {
        perView: "auto",
        spacing: 12,
      },
      breakpoints: {
        "(max-width: 640px)": {
          slides: {
            perView: "auto",
            spacing: 8,
          },
        },
        "(min-width: 1024px)": {
          slides: {
            perView: "auto",
            spacing: 16,
          },
        },
      },
    },
    [ThumbnailPlugin(instanceRef)]
  );

  // Handlers
  const handlePinCodeChange = (event) => {
    const { value } = event.target;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPinCode(value);
      
      // Auto-check delivery when user enters 6 digits
      if (value.length === 6) {
        setIsCheckingPincode(true);
        // Simulate API call
        setTimeout(() => {
          setDeliveryInfo({
            available: true,
            estimatedDays: Math.floor(Math.random() * 3) + 2,
            codAvailable: Math.random() > 0.3
          });
          setIsCheckingPincode(false);
        }, 1000);
      } else {
        // Clear delivery info if less than 6 digits
        setDeliveryInfo(null);
      }
    }
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < (singleData?.stock || 10)) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
    } else if (type === 'decrease' && quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    // Use the enhanced cart function for consistent quantity handling
    addOrUpdateCartProduct(singleData, quantity, selectSize);
    
    // Set payment amount for this product with quantity
    const finalPrice = pricing.displayPrice * quantity;
    priceHelper.setPaymentAmount(finalPrice);
    
    // Redirect directly to address page
    navigate('/address');
  };

  // Offer-aware pricing calculation
  const pricing = React.useMemo(() => {
    if (!singleData) return { displayPrice: 0, originalPrice: 0, showDiscount: false };
    
    const originalPrice = singleData.price || 0;
    const discountedPrice = singleData.discount || singleData.price || 0;
    
    // In non-offer view, always show original price and hide discounts
    if (!isOfferEligible) {
      return {
        displayPrice: originalPrice,
        originalPrice: originalPrice,
        showDiscount: false,
        discountAmount: 0,
        discountPercentage: 0,
        priceClass: 'non-offer-price'
      };
    }
    
    // In offer view, show discounted prices if available
    return {
      displayPrice: discountedPrice,
      originalPrice: originalPrice,
      showDiscount: originalPrice > discountedPrice,
      discountAmount: originalPrice - discountedPrice,
      discountPercentage: originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0,
      priceClass: 'offer-price'
    };
  }, [singleData, isOfferEligible]);

  // Payment options based on offer eligibility
  const paymentOptions = React.useMemo(() => {
    return getPaymentOptions(showOffer);
  }, [showOffer]);

  // Effects
  useEffect(() => {
    if (ref?.current) {
      if (["STOPPED", "COMPLETED"].includes(ref?.current?.state?.status)) {
        ref?.current?.start();
      }
    }
  }, [location, ref]);

  // Reset quantity when switching products
  useEffect(() => {
    if (singleData?._id) {
      setQuantity(1);
    }
  }, [singleData?._id]);

  // Reset states when route/id changes
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  // Main useEffect for loading product data
  useEffect(() => {
    if (!singleProduct || singleProduct._id !== id) {
      setIsLoading(true);
    }
    
    // Check if we've already tracked this product view
    if (hasTracked[id]) {
      return; // Skip if already tracked
    }
    
    axios
      .get(`${API_BASE_URL}/api/products/${id}`)
      .then((res) => {
        const productData = res?.data?.product;
        // Add default stock if not present for demo purposes
        const productWithStock = {
          ...productData,
          stock: productData?.stock || Math.floor(Math.random() * 20) + 15 // Random stock between 15-35
        };
        
        setSingleData(productWithStock);
        setSingleProduct(productWithStock);
        setReletedProduct(res?.data?.relatedProducts);
        setRelatedProducts(res?.data?.relatedProducts || []);
        setIsLoading(false);
        
        // Track product view
        if (productData) {
          const trackingPrice = getTrackingPrice(productData);
          
          // Mark as tracked to prevent duplicates
          setHasTracked(prev => ({...prev, [id]: true}));
          
          logViewContent({
            product_id: productData._id || productData.id,
            product_name: productData.name || productData.title,
            category: productData.category || 'General',
            value: trackingPrice,
            currency: 'INR'
          }).catch(error => {
            console.error('❌ Enhanced view content tracking failed:', error);
            // Fallback to direct tracking manager call
            trackingManager.trackViewContent({
              product_id: productData._id || productData.id,
              product_name: productData.name || productData.title,
              category: productData.category || 'General',
              value: trackingPrice,
              currency: 'INR'
            });
          });
        }
      })
      .catch((error) => {
        console.error('Error loading product:', error);
        setIsLoading(false);
      });
  }, [id, hasTracked, singleProduct, setSingleProduct, setRelatedProducts]);

  // Component render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <SkeletonLoader isSinglePage />
          </div>
        ) : (
          <div className="bg-white">
            {/* Product Container */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
              
              {/* Image Gallery - Left Column */}
              <div className="w-full">
                <div className="relative overflow-hidden bg-gray-50 flex items-center justify-center aspect-product-square sm:aspect-product-portrait lg:aspect-product-square rounded-xl">
                  {singleData?.images && (
                    <div ref={sliderRef} className="keen-slider h-full w-full rounded-xl">
                      {(Array.isArray(singleData.images) ? singleData.images : [singleData.images]).map((item, index) => (
                        <div key={`slide-${index}`} className="keen-slider__slide h-full flex items-center justify-center">
                          <OptimizedImage
                            src={item}
                            alt={`Product ${index + 1}`}
                            loading={index === 0 ? "eager" : "lazy"}
                            className="w-auto h-auto max-w-full max-h-full object-contain hover:scale-105 transition-all duration-300"
                            fallback="/images/placeholder-product.jpg"
                            threshold={index === 0 ? 0 : 0.1}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Thumbnail Gallery */}
                {singleData?.images && Array.isArray(singleData.images) && singleData.images.length > 1 && (
                  <div className="mt-4">
                    <div ref={thumbnailRef} className="keen-slider">
                      {singleData.images.map((img, index) => (
                        <div
                          key={`thumb-${index}`}
                          className="keen-slider__slide cursor-pointer transition-all duration-300 hover:opacity-80 [&.active]:ring-2 [&.active]:ring-blue-500 [&.active]:ring-offset-2 flex-shrink-0 bg-transparent flex items-center justify-center"
                          style={{ height: '120px', width: 'auto', minWidth: '80px' }}
                        >
                          <OptimizedImage
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            loading="lazy"
                            className="h-full w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-105"
                            style={{ maxHeight: '120px' }}
                            fallback="/images/placeholder-product.jpg"
                            threshold={0.2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info - Right Column */}
              <div className="mt-6 lg:mt-0">
                <div className="space-y-6">
                  
                  {/* Title and Rating */}
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                      {singleData?.description}
                    </h1>

                    {/* Rating Section */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={`star-${i}`}
                            className={cn(
                              i < Math.floor(singleData?.rating || 0) ? "fas text-green-600" : "far text-gray-300",
                              "fa-star text-sm"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {singleData?.rating?.toFixed(1)} • 2,594 Ratings & 6,500 Reviews
                      </span>
                    </div>

                    {/* Trusted Seller Badge */}
                    <div className="mt-3 inline-flex items-center rounded-lg px-3 py-2 border" style={{ backgroundColor: primaryColor + '1A', borderColor: primaryColor + '40' }}>
                      <img
                        src={safePaymentIcon}
                        height="20"
                        alt="Trusted Seller"
                        className="h-5 w-5 mr-2"
                      />
                      <div>
                        <span className="text-sm font-semibold" style={{ color: primaryColor }}>Verified Seller</span>
                        <div className="text-xs" style={{ color: primaryColor + 'CC' }}>Trusted & Secure</div>
                      </div>
                    </div>
                  </div>

                  {/* Price Section - Offer Aware */}
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: secondaryColor + '1A', borderColor: secondaryColor + '40' }}>
                    {isOfferEligible && pricing.showDiscount ? (
                      // Offer Mode - All price components in one row
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <svg width="20" height="20" viewBox="0 0 12 12" fill={secondaryColor}>
                            <path d="M6.73461 1V8.46236L9.5535 5.63352L10.5876 6.65767L5.99384 11.2415L1.41003 6.65767L2.42424 5.63352L5.25307 8.46236V1H6.73461Z" />
                          </svg>
                          <span className="text-lg font-semibold text-red-600">{pricing.discountPercentage}% off</span>
                        </div>
                        <span className="text-3xl font-bold text-green-600">₹{pricing.displayPrice}</span>
                        <span className="text-lg text-black-500 line-through">₹{pricing.originalPrice}</span>
                      </div>
                    ) : (
                      // Non-Offer Mode - Show only original price
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-3xl font-bold text-gray-900">₹{pricing.displayPrice}</span>
                        {paymentOptions.cod && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            COD Available
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Size Selection */}
                  {isSizeEnabled() && availableSizes?.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-900">
                          Size
                        </span>
                        <button 
                          onClick={() => setShowSizeChart(true)}
                          className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                        >
                          <span>Chart</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes?.map((item) => (
                          <button
                            key={`size-${item}`}
                            onClick={() => setSelectSize(item)}
                            className={cn(
                              "min-w-[32px] h-[32px] rounded-md flex items-center justify-center px-2 font-medium text-xs transition-all duration-200",
                              "border relative hover:shadow-sm",
                              selectSize === item 
                                ? "border-transparent text-white" 
                                : "border-gray-300 text-gray-700 hover:border-gray-400"
                            )}
                            style={selectSize === item ? {
                              backgroundColor: primaryColor,
                              borderColor: primaryColor
                            } : {}}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compact Single Row Quantity Selector */}
                  <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {/* Quantity Label and Controls in One Row */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Qty:</span>
                      
                      {/* Compact Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-md bg-white">
                        <button
                          onClick={() => handleQuantityChange('decrease')}
                          disabled={quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-l-md"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          </svg>
                        </button>
                        
                        <div className="w-10 h-7 flex items-center justify-center border-x border-gray-300 bg-white">
                          <span className="font-medium text-gray-900 text-sm">{quantity}</span>
                        </div>
                        
                        <button
                          onClick={() => handleQuantityChange('increase')}
                          disabled={quantity >= (singleData?.stock || 10)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-r-md"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Compact Stock Status */}
                      <div className="text-xs">
                        {(singleData?.stock || 0) > 10 ? (
                          <span className="text-green-600 font-medium">✓ In Stock</span>
                        ) : (singleData?.stock || 0) > 0 ? (
                          <span className="text-orange-600 font-medium">⚠ {singleData?.stock} left</span>
                        ) : (
                          <span className="text-red-600 font-medium">✗ Out of Stock</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Total Price in Same Row */}
                    <div className="text-right">
                      <div className="text-sm font-semibold" style={{ color: primaryColor }}>
                        ₹{(pricing.displayPrice * quantity).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>

                  {/* Flash Sale Timer Section - Responsive Width */}
                  <div className="flash-sale-section mb-4 
                    w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] 
                    lg:w-full lg:relative lg:left-0 lg:right-0 lg:ml-0 lg:mr-0">
                    <FlashSaleTimer 
                      maxMinutes={9}
                      compact={true}
                      onTimeExpired={() => {
                        console.log('Flash sale expired');
                        // Could trigger price increase or special offer removal
                      }}
                    />
                  </div>

                  {/* Unified Action Buttons Section */}
                  <div className="mt-6" data-main-action-buttons>
                    <div className="flex gap-3 flex-wrap">
                      {/* Add to Cart Button */}
                      <button
                        onClick={() => {
                          const result = addOrUpdateCartProduct(singleData, quantity, selectSize);
                          if (result.action === 'updated') navigate("/cart");
                        }}
                        className="
                          flex-1 h-14 rounded-xl font-semibold text-base
                          flex items-center justify-center space-x-2
                          transition-all duration-300 transform
                          hover:shadow-xl hover:scale-105 active:scale-95
                          border-0 relative overflow-hidden group
                          min-w-[150px]
                        "
                        style={{
                          backgroundColor: cartProducts?.find(o => o._id === singleData._id) ? '#10b981' : primaryColor,
                          color: '#ffffff',
                          boxShadow: cartProducts?.find(o => o._id === singleData._id) 
                            ? '0 4px 20px rgba(16, 185, 129, 0.3)' 
                            : `0 4px 20px ${primaryColor}30`
                        }}
                        onMouseEnter={(e) => {
                          const isInCart = cartProducts?.find(o => o._id === singleData._id);
                          if (isInCart) {
                            e.target.style.backgroundColor = '#059669'; // green-600
                            e.target.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.5)';
                          } else {
                            e.target.style.backgroundColor = adjustBrightness(primaryColor, -15);
                            e.target.style.boxShadow = `0 8px 30px ${primaryColor}50`;
                          }
                          e.target.style.transform = 'scale(1.05) translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          const isInCart = cartProducts?.find(o => o._id === singleData._id);
                          e.target.style.backgroundColor = isInCart ? '#10b981' : primaryColor;
                          e.target.style.boxShadow = isInCart 
                            ? '0 4px 20px rgba(16, 185, 129, 0.3)' 
                            : `0 4px 20px ${primaryColor}30`;
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12 group-hover:animate-pulse"></div>
                        {cartProducts?.find(o => o._id === singleData._id) ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span>GO TO CART</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L7 13m0 0L3 3m4 10v6a1 1 0 001 1h12a1 1 0 001-1v-6M7 13h10" />
                            </svg>
                            <span>ADD TO CART</span>
                          </>
                        )}
                      </button>

                      {/* Buy Now Button - Always Green */}
                      <button
                        onClick={handleBuyNow}
                        className="
                          flex-1 h-14 rounded-xl font-semibold text-white text-base
                          flex items-center justify-center space-x-2
                          transition-all duration-300 transform
                          hover:shadow-xl hover:scale-105 active:scale-95
                          relative overflow-hidden group
                          min-w-[150px]
                        "
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05) translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.6)';
                          e.target.style.background = 'linear-gradient(135deg, #059669, #047857)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.4)';
                          e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12"></div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>BUY NOW</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </button>
                    </div>
                  </div>

                  {/* Simple Details Section - Delivery, Returns & Price Guarantee */}
                  {selectSize && (
                    <ProductDetails 
                      singleData={singleData}
                    />
                  )}

                  {/* Pincode Checker */}
                  <div className="pb-6">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Title with Icon */}
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Check Delivery & Service</span>
                      </div>
                      
                      {/* Pincode Input with Loading Indicator */}
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={pinCode}
                          onChange={handlePinCodeChange}
                          placeholder="Enter 6-digit pincode"
                          maxLength="6"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                        {isCheckingPincode && (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {deliveryInfo && pinCode.length === 6 && !isCheckingPincode && (
                          <div className="w-5 h-5 text-green-500">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Delivery Information */}
                    {deliveryInfo && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 text-green-500 mt-0.5">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-800">
                              Delivery Available
                            </h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-green-700">
                                <span className="font-medium">Estimated Delivery:</span> {deliveryInfo.estimatedDays} days
                              </p>
                              {deliveryInfo.codAvailable && (
                                <p className="text-sm text-green-700">
                                  <span className="font-medium">Cash on Delivery:</span> Available
                                </p>
                              )}
                              <p className="text-sm text-green-700">
                                <span className="font-medium">Free Delivery:</span> On orders above ₹499
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Urgency Creator */}
                  <UrgencyCreator product={singleData} />
                </div>
              </div>
            </div>

            {/* Related Products - Redesigned with Pure Tailwind */}
            <div ref={relatedProductsRef} className="mt-12">
              <div className="bg-slate-50 py-4 sm:py-8 shadow-lg border border-slate-200">
                {/* Mobile-Optimized Header Section */}
                <div className="text-center mb-4 sm:mb-6 px-4">
                  
                  {/* Compact Icon for Mobile */}
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Ultra-Compact Mobile Header */}
                  <div className="text-center mb-4 px-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                      You Might Also 
                      <span className="text-pink-600">Love</span>
                      <span className="ml-1 text-base">💖</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Handpicked for you
                    </p>
                  </div>
                </div>

                {/* Mobile-Optimized Products Grid */}
                <div className="grid grid-cols-2 gap-1 sm:gap-2 px-2 sm:px-4">
                  {reletedProduct.slice(0, 8).map(
                    (item) => item._id !== id && (
                      <div key={item._id} className="group">
                        <ProductCardTailwind
                          item={item}
                          className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        />
                      </div>
                    )
                  )}
                </div>

                {/* View All Button */}
                {reletedProduct.length > 8 && (
                  <div className="text-center mt-8">
                    <button 
                      onClick={() => {
                        // Show all related products by expanding the grid
                        const categoryName = singleData?.category || 'products';
                        navigate(`/category/${encodeURIComponent(categoryName)}`);
                      }}
                      className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-8 rounded-2xl border-2 border-gray-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      style={{
                        '--hover-border-color': 'var(--primary-color)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'rgb(229, 231, 235)'; // border-gray-200
                      }}
                    >
                      View All Related Products
                      <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Quality Assurance Section - Below Product Details */}
                <div className="mt-8">
                  <QualityAssurance product={singleData} />
                </div>
              </div>
            </div>

            {/* Dynamic Action Buttons - Replaces old fixed buttons */}
            <DynamicActionButtons 
              product={{ ...singleData, selectSize, quantity }}
              urgencyLevel={urgencyLevel}
              relatedProductsRef={relatedProductsRef}
            />
          </div>
        )}
      </div>

      {/* Size Chart Modal */}
      <SizeChart
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        category={singleData?.category || 'unisex'}
      />
    </div>
  );
};

export default SingleProductTailwind;
