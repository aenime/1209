import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Import offer system for cart items
import { useOffer } from '../../contexts/OfferContext';

const CartItem = React.memo(({
  product,
  isSelected = false,
  onToggleSelect,
  onRemove,
  onUpdateQuantity,
  onUpdateSize,
  showSizeSelector,
  showQuantitySelector
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Offer system integration
  const { isEligibleForOffers } = useOffer();
  
  // Calculate pricing based on offer eligibility
  const pricing = React.useMemo(() => {
    if (!product) return { displayPrice: 0, showDiscount: false, originalPrice: 0 };
    
    const originalPrice = product.price || 0;
    const discountedPrice = product.discount || product.price || 0;
    
    // In non-offer view, always show original price and hide discounts
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
    
    // In offer view, show discounted prices if available
    return {
      displayPrice: discountedPrice,
      originalPrice: originalPrice,
      showDiscount: originalPrice > discountedPrice,
      discountAmount: originalPrice - discountedPrice,
      discountPercentage: originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0,
      priceClass: 'offer-price'
    };
  }, [product, isEligibleForOffers]);

  // Optimized event handlers with useCallback
  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(product);
    }
  }, [product, onRemove]);

  const handleToggleSelect = useCallback(() => {
    if (onToggleSelect) {
      onToggleSelect(product);
    }
  }, [product, onToggleSelect]);

  const handleProductClick = useCallback(() => {
    navigate(`/single-product/${product._id}`);
  }, [navigate, product._id]);

  return (
    <div className={`flex bg-white rounded-lg border transition-all duration-200 active:scale-[0.98] ${
      isSelected 
        ? 'border-blue-400 shadow-sm bg-blue-50' 
        : 'border-gray-200'
    }`}>
      {/* Checkbox */}
      <div className="flex items-start p-3">
        <label className="relative cursor-pointer group/checkbox">
          <input
            type="checkbox"
            className="sr-only"
            checked={isSelected}
            onChange={handleToggleSelect}
          />
          <div className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
            isSelected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 group-hover/checkbox:border-blue-400'
          }`}>
            {isSelected && (
              <svg className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </label>
      </div>

      {/* Product Image */}
      <div 
        className="relative flex-shrink-0 w-16 h-16 m-3 cursor-pointer"
        onClick={handleProductClick}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={product?.images?.[0] || product?.image}
          alt={product?.title}
          className={`w-full h-full object-contain rounded transition-all duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 p-3 flex flex-col min-w-0">
        {/* Title and Remove Button */}
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors flex-1 mr-2"
            onClick={handleProductClick}
          >
            {product?.title}
          </h3>
          
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            title="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Size and Quantity - Mobile Optimized */}
        <div className="flex items-center space-x-4 mb-2">
          <div className="flex items-center text-xs">
            <span className="text-gray-600 mr-1">Size:</span>          <button
            onClick={showSizeSelector}
            className="bg-gray-100 hover:bg-blue-50 active:bg-blue-100 border border-gray-200 px-3 py-1.5 rounded text-xs font-medium text-gray-700 hover:text-blue-700 transition-all touch-target"
          >
            {product?.selectSize || 'M'}
          </button>
          </div>

          <div className="flex items-center text-xs">
            <span className="text-gray-600 mr-1">Qty:</span>          <button
            onClick={showQuantitySelector}
            className="bg-gray-100 hover:bg-blue-50 active:bg-blue-100 border border-gray-200 px-3 py-1.5 rounded text-xs font-medium text-gray-700 hover:text-blue-700 transition-all touch-target"
          >
            {product?.quantity || 1}
          </button>
          </div>
        </div>

        {/* Price - Simple Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            {pricing.showDiscount ? (
              // Show discounted price with strikethrough
              <>
                <span className="text-base font-bold text-red-600">
                  ₹{(pricing.displayPrice * (product?.quantity || 1)).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ₹{(pricing.originalPrice * (product?.quantity || 1)).toLocaleString()}
                </span>
              </>
            ) : (
              // Show only price
              <span className="text-base font-bold text-gray-900">
                ₹{(pricing.displayPrice * (product?.quantity || 1)).toLocaleString()}
              </span>
            )}
          </div>
          
          {pricing.showDiscount && pricing.discountPercentage > 0 && (
            <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
              {pricing.discountPercentage}% OFF
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.product._id === nextProps.product._id &&
    prevProps.product.quantity === nextProps.product.quantity &&
    prevProps.isSelected === nextProps.isSelected
  );
});

export default CartItem;