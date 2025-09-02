/**
 * React Core and Navigation Imports
 */
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Context Hooks
 */
import { useWishlist } from "../../contexts/WishlistContext";
import { useProduct } from "../../contexts/ProductContext";
import { useOffer } from "../../contexts/OfferContext";

/**
 * Utility Functions and Components
 */
import { cn } from "../../utils/cn";
import { getProductImageConfig } from "../../utils/aspectRatioHelper";
import { CardAddToCartButton } from "../AddToCartButton";
import { OptimizedImage } from "../Common";

/**
 * Assets
 */
import safePaymentIcon from "../../assets/image/safe-payment-icon.svg";

/**
 * Product Card Component - Modern E-Commerce Product Display
 * 
 * Reusable product card featuring:
 * - Responsive image display with optimized loading
 * - Dynamic pricing with offer-based calculations
 * - Wishlist functionality with visual feedback
 * - Add to cart integration
 * - Stable review count generation
 * - Trust indicators and safety badges
 * - Hover effects and interactive elements
 * - Flexible aspect ratio support
 * 
 * Key Features:
 * - Offer-aware pricing display (shows/hides discounts based on eligibility)
 * - Stable review count that updates gradually to maintain credibility
 * - Memoized performance optimizations
 * - Seamless navigation to product details
 * - Visual wishlist state management
 * - Responsive design for all screen sizes
 * 
 * Props:
 * - item/product: Product data object (flexible prop naming)
 * - className: Additional CSS classes for customization
 * - aspectRatio: Image aspect ratio configuration (auto-detected from category or manual override)
 * - fitMode: Image fit mode ('contain' for minimal padding, 'cover' for full coverage)
 */
const ProductCardTailwind = React.memo(({ 
  item, 
  product, 
  className = "", 
  aspectRatio, 
  fitMode,
  categoryAspectRatio,
  ...props 
}) => {
  /**
   * Navigation and Context Hooks
   */
  const navigate = useNavigate();
  const { handleSetWhiteListProducts } = useWishlist();
  const { setSingleProduct } = useProduct();
  const { isEligibleForOffers } = useOffer();

  /**
   * Product Data Normalization
   * 
   * Supports both 'item' and 'product' props for backward compatibility
   * and flexible usage across different components.
   */
  const productData = item || product;

  /**
   * Local Component State
   * 
   * Manages wishlist visual feedback:
   * - isHeartFilled: Controls heart icon appearance
   * - Starts as false (white/outline), becomes true (pink/filled) when clicked
   */
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  
  /**
   * Stable Review Count Generation
   * 
   * Creates consistent review counts that change gradually:
   * - Uses product ID as seed for consistency
   * - Updates every 2.5 minutes to maintain credibility
   * - Generates counts between 100-5000 for realistic appearance
   * - Prevents rapid fluctuations that would seem artificial
   * 
   * Algorithm:
   * 1. Creates time-based intervals (2.5 minutes)
   * 2. Combines product ID hash with time interval
   * 3. Uses seeded random generation for consistency
   * 4. Maps to realistic review count range
   */
  const stableReviewCount = useMemo(() => {
    if (!productData?._id) return 100;
    
    // Create time intervals of 2.5 minutes for gradual changes
    const timeInterval = Math.floor(Date.now() / (150000)); // 150000ms = 2.5 minutes
    const productSeed = productData._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = productSeed + timeInterval;
    
    // Seeded random number generator for consistency
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Generate stable review count between 100-5000
    return Math.floor(seededRandom(seed) * 4901) + 100;
  }, [productData?._id]);
  
  /**
   * Dynamic Pricing Calculation
   * 
   * Calculates display pricing based on offer eligibility:
   * - Non-offer view: Shows original price only, hides discounts
   * - Offer view: Shows discounted price with strikethrough original
   * - Handles missing price data gracefully
   * - Provides percentage discount calculations
   * 
   * Business Logic:
   * - Maintains price consistency across offer states
   * - Prevents confusion with conditional discount display
   * - Ensures pricing transparency for users
   */
  const pricing = useMemo(() => {
    if (!productData) return { displayPrice: 0, originalPrice: 0, showDiscount: false };
    
    const originalPrice = productData.price || 0;
    const discountedPrice = productData.discount || productData.price || 0;
    
    // Non-offer view: Show original price only, hide discounts
    if (!isEligibleForOffers) {
      return {
        displayPrice: originalPrice,
        originalPrice: originalPrice,
        showDiscount: false,
        discountAmount: 0,
        discountPercentage: 0,
        priceClass: 'non-offer-price'
      };
    }
    
    // Offer view: Show discounted prices if available
    return {
      displayPrice: discountedPrice,
      originalPrice: originalPrice,
      showDiscount: originalPrice > discountedPrice,
      discountAmount: originalPrice - discountedPrice,
      discountPercentage: originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0,
      priceClass: 'offer-price'
    };
  }, [productData, isEligibleForOffers]);

  /**
   * Image Configuration for Consistent Aspect Ratios
   * 
   * Automatically determines the optimal image configuration based on:
   * - Product category (auto-detected from product.category)
   * - Manual overrides via props (aspectRatio, fitMode, categoryAspectRatio)
   * - Fallback to default square aspect ratio
   * 
   * This system provides:
   * - Consistent aspect ratios per category to minimize padding
   * - Pure CSS solution using Tailwind utilities
   * - Performance optimized with memoization
   * - Support for both numeric ratios and predefined configurations
   */
  const imageConfig = useMemo(() => {
    // Handle manual override via categoryAspectRatio prop (numeric value)
    if (typeof categoryAspectRatio === 'number') {
      return {
        aspectRatio: categoryAspectRatio,
        tailwindClass: `aspect-[${categoryAspectRatio}]`,
        objectFitClass: fitMode === 'cover' ? 'object-cover' : 'object-contain',
        containerStyle: { aspectRatio: String(categoryAspectRatio) },
        fitMode: fitMode || 'contain'
      };
    }
    
    // Handle legacy string aspectRatio prop
    if (aspectRatio) {
      const legacyRatios = {
        'square': { aspectRatio: 1, tailwindClass: 'aspect-square' },
        'portrait': { aspectRatio: 0.8, tailwindClass: 'aspect-[4/5]' },
        'landscape': { aspectRatio: 1.333, tailwindClass: 'aspect-[4/3]' }
      };
      
      const config = legacyRatios[aspectRatio] || legacyRatios.square;
      return {
        ...config,
        objectFitClass: fitMode === 'cover' ? 'object-cover' : 'object-contain',
        containerStyle: { aspectRatio: String(config.aspectRatio) },
        fitMode: fitMode || 'contain'
      };
    }
    
    // Use category-based configuration (recommended approach)
    const config = getProductImageConfig(productData, { fitMode });
    return config;
  }, [productData, aspectRatio, fitMode, categoryAspectRatio]);

  // Early return if no product data (after all hooks)
  if (!productData) {
    
    return null;
  }

  const handleRedirect = () => {
    if (!productData?._id) return;
    setSingleProduct(productData);
    navigate(`/single-product/${productData._id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    // Toggle local heart state
    setIsHeartFilled(!isHeartFilled);
    
    // Also call the original wishlist function if it exists
    if (productData && handleSetWhiteListProducts) {
      handleSetWhiteListProducts(productData);
    }
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400 text-sm">★</span>
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 text-sm">★</span>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-sm">★</span>
      );
    }

    return stars;
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col",
          "cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-gray-300"
        )}
        style={{
          '--primary-color': 'var(--primary-color)',
          '--secondary-color': 'var(--secondary-color)'
        }}
        onClick={handleRedirect}
      >
        {/* Image Container with Consistent Aspect Ratio */}
        <div 
          className={cn(
            "relative overflow-hidden bg-gray-50",
            imageConfig.tailwindClass
          )}
          style={imageConfig.containerStyle}
        >
          <OptimizedImage
            src={Array.isArray(productData?.images) ? productData?.images?.[0] : productData?.images || ""}
            alt={productData?.title || "Product"}
            loading="lazy"
            className={cn(
              "absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-[1.02]",
              imageConfig.objectFitClass,
              "object-center"
            )}
            threshold={0.1}
            fallback="/images/placeholder-product.jpg"
          />
          
          {/* Wishlist Button */}
          <button 
            className={cn(
              "absolute top-1 right-1 p-1 rounded-sm",
              "transition-all duration-200 hover:scale-102",
              "focus:outline-none focus:ring-1"
            )}
            style={{
              '--focus-ring-color': 'var(--primary-color)'
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 1px var(--primary-color)`;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
            }}
            onClick={handleWishlistClick}
            aria-label={isHeartFilled ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartIcon filled={isHeartFilled} />
          </button>

          {/* Discount Badge - Only show in offer mode */}
          {isEligibleForOffers && pricing.showDiscount && pricing.discountPercentage > 0 && (
            <div 
              className="absolute top-1 left-1 text-white text-xs font-semibold px-1 py-0 rounded-sm flex items-center gap-1" 
              style={{ 
                backgroundColor: 'var(--primary-color)',
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'
              }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6.73461 1V8.46236L9.5535 5.63352L10.5876 6.65767L5.99384 11.2415L1.41003 6.65767L2.42424 5.63352L5.25307 8.46236V1H6.73461Z" />
              </svg>
              {pricing.discountPercentage}% off
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-1 flex flex-col flex-1 card-content">
          {/* Product Title */}
          <h3 
            className={cn(
              "text-sm font-medium text-gray-900 mb-1 line-clamp-2",
              "transition-colors duration-200"
            )}
            style={{
              '--hover-color': 'var(--primary-color)'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'rgb(17, 24, 39)'; // text-gray-900
            }}
          >
            {productData?.title || "Product Title"}
          </h3>

          {/* Price Section - Offer Aware */}
          <div className="mb-1">
            <div className="flex items-center gap-1 mb-1">
              {isEligibleForOffers && pricing.showDiscount ? (
                // Offer Mode - Show discounted price with strikethrough original
                <>
                  <span className="text-lg font-bold text-green-600">
                    ₹{pricing.displayPrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{pricing.originalPrice}
                  </span>
                  {pricing.discountPercentage > 0 && (
                    <span className="bg-green-700 text-white px-1 py-0.5 rounded text-xs font-bold ml-1">
                      {pricing.discountPercentage}% OFF
                    </span>
                  )}
                </>
              ) : (
                // Non-Offer Mode or No Discount - Show only regular price
                <span className="text-lg font-bold text-gray-900">
                  ₹{pricing.displayPrice}
                </span>
              )}
            </div>
          </div>

          {/* Rating Section */}
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <div className="flex items-center">
                {renderStars(productData?.rating || 0)}
              </div>
              <span className="text-xs text-gray-500 ml-1 truncate">
                {isEligibleForOffers ? 
                  `(${stableReviewCount})` : 
                  productData?.reviewCount ? `(${productData.reviewCount})` : ''
                }
              </span>
            </div>
            
            {/* Trusted Seller Badge - Fixed positioning */}
            <div className="flex-shrink-0 flex items-center bg-green-50 border border-green-200 px-1 py-0.5 rounded-sm min-w-0">
              <img 
                src={safePaymentIcon}
                alt="Trusted Seller"
                className="h-2.5 w-2.5 mr-0.5 flex-shrink-0"
              />
              <span className="text-[9px] font-medium text-green-700 whitespace-nowrap">Trusted</span>
            </div>
          </div>

          {/* Add to Cart Button - Reduced spacing */}
          <div className="mt-1">
            <CardAddToCartButton 
              product={productData}
              className="w-full text-[13px]"
              size="small"
            />
          </div>

          {/* Delivery Info - Reduced spacing */}
          <div className="text-xs text-green-600 font-medium mt-1 text-center pb-1">
            🚚 Free delivery
          </div>
        </div>
      </div>
    </div>
  );
});

// HeartIcon component with better styling
const HeartIcon = ({ filled = false }) => {
  return (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      className="transition-colors duration-200"
    >
      <path 
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={filled ? "#ec4899" : "#ffffff"}
        stroke="#000000"
        strokeWidth="2"
      />
    </svg>
  );
};

export default React.memo(ProductCardTailwind);
