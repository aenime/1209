import React, { useState } from 'react';
import { getSecondaryThemeColor } from '../../utils/themeColorsSimple';
import { useOffer } from '../../contexts/OfferContext';

const FrequentlyBoughtTogether = ({ 
  mainProduct = null,
  suggestedProducts = [],
  onAddToCart,
  themColor = getSecondaryThemeColor() // Dynamic theme color
}) => {
  const [selectedItems, setSelectedItems] = useState(new Set([0])); // Main product always selected
  const { isEligibleForOffers } = useOffer();
  
  // Hide FrequentlyBoughtTogether component in non-offer view
  if (!isEligibleForOffers) {
    return null;
  }
  
  // Helper function to calculate pricing for individual products
  // Simple product pricing function without complex offer logic
  const getProductPricing = (product) => {
    if (!product) return { displayPrice: 0, originalPrice: 0, showDiscount: false };
    
    const originalPrice = product.price || 0;
    const discountedPrice = product.discount || product.price || 0;
    
    return {
      displayPrice: discountedPrice,
      originalPrice: originalPrice,
      showDiscount: originalPrice > discountedPrice,
      discountAmount: originalPrice - discountedPrice
    };
  };
  
  // Helper function to ensure image URL is properly formatted
  const getImageUrl = (product) => {
    let imageUrl = null;
    
    // Try to get image from different possible properties
    if (product?.images && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (product?.image) {
      imageUrl = product.image;
    } else if (product?.thumbnail) {
      imageUrl = product.thumbnail;
    } else if (product?.imageUrl) {
      imageUrl = product.imageUrl;
    }
    
    // If no image found, return placeholder
    if (!imageUrl) return "/api/placeholder/100/100";
    
    // Format URL if needed
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return imageUrl;
    return `/${imageUrl}`;
  };
  
  // Calculate simple total pricing
  const calculateTotalPricing = () => {
    let totalOriginalPrice = 0;
    let totalDisplayPrice = 0;

    [...selectedItems].forEach(index => {
      const product = index === 0 ? mainProduct : suggestedProducts[index-1];
      if (product) {
        const pricing = getProductPricing(product);
        totalOriginalPrice += pricing.originalPrice;
        totalDisplayPrice += pricing.displayPrice;
      }
    });

    return {
      totalOriginalPrice,
      totalDisplayPrice,
      totalSavings: totalOriginalPrice - totalDisplayPrice
    };
  };

  const pricingData = calculateTotalPricing();
  const savingsPercentage = pricingData.totalOriginalPrice > 0 ? 
    Math.round((pricingData.totalSavings / pricingData.totalOriginalPrice) * 100) : 0;
  
  // Toggle selection of a product
  const toggleProductSelection = (index) => {
    const newSelections = new Set(selectedItems);
    
    if (index === 0) return; // Can't deselect main product
    
    if (newSelections.has(index)) {
      newSelections.delete(index);
    } else {
      newSelections.add(index);
    }
    
    setSelectedItems(newSelections);
  };
  
  // Add all selected items to cart
  const addAllToCart = () => {
    const productsToAdd = [...selectedItems].map(index => {
      return index === 0 ? null : suggestedProducts[index-1]; // Skip main product as it's already in cart
    }).filter(Boolean); // Remove null (main product)
    
    if (onAddToCart && productsToAdd.length > 0) {
      onAddToCart(productsToAdd);
    }
  };

  // Check if we have valid data to display
  if (!mainProduct) {
    
    return null;
  }
  
  if (!suggestedProducts || suggestedProducts.length === 0) {
    
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Frequently Bought Together</h3>
            {isEligibleForOffers && savingsPercentage > 0 ? (
              <p className="text-sm text-gray-500">Buy 3 products and get the cheapest one free!</p>
            ) : (
              <p className="text-sm text-gray-500">Bundle these products together</p>
            )}
          </div>
        </div>
        
        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
          Bundle Deal
        </div>
      </div>

      {/* Products */}
      <div className="space-y-4">
        {/* Main product (already in cart) */}
        <div className="flex items-center space-x-3 pb-4 border-b border-dashed border-gray-200">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={true} 
              disabled
              className="w-5 h-5 rounded border-2 border-gray-300 checked:bg-blue-500 checked:border-transparent transition-all duration-200"
            />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">1</span>
            </span>
          </div>
          
          <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
            <img 
              src={getImageUrl(mainProduct)} 
              alt={mainProduct?.title || "Product"} 
              className="w-full h-full object-contain p-1" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/api/placeholder/100/100";
              }}
            />
          </div>
          
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
              {mainProduct?.title || "Current Product"}
              <span className="ml-2 text-green-500 text-xs inline-block">In Cart</span>
            </h4>
            
            <div className="flex items-baseline mt-1 space-x-2">
              <span className="text-sm font-bold">
                ₹{getProductPricing(mainProduct).displayPrice.toLocaleString()}
              </span>
              {isEligibleForOffers && getProductPricing(mainProduct).showDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{getProductPricing(mainProduct).originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Plus icon between products */}
        <div className="flex justify-center -my-2">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>

        {/* Suggested products */}
        {suggestedProducts.map((product, index) => {
          const itemIndex = index + 1; // +1 because main product is at index 0
          const isSelected = selectedItems.has(itemIndex);
          
          return (
            <div key={product?._id || index} className="flex items-center space-x-3">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleProductSelection(itemIndex)}
                  className="w-5 h-5 rounded border-2 border-gray-300 checked:bg-blue-500 checked:border-transparent transition-all duration-200 cursor-pointer"
                />
                {isSelected && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{itemIndex + 1}</span>
                  </span>
                )}
              </div>
              
              <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                <img 
                  src={getImageUrl(product)} 
                  alt={product?.title || `Suggested Product ${index + 1}`} 
                  className="w-full h-full object-contain p-1" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/100/100";
                  }}
                />
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                  {product?.title || `Suggested Product ${index + 1}`}
                </h4>
                
                <div className="flex items-baseline mt-1 space-x-2">
                  <span className="text-sm font-bold">
                    ₹{getProductPricing(product).displayPrice.toLocaleString()}
                  </span>
                  {getProductPricing(product).showDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{getProductPricing(product).originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total and Add to Cart */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Bundle Total:</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-lg font-bold text-gray-900">₹{pricingData.totalDisplayPrice.toLocaleString()}</span>
              {pricingData.totalSavings > 0 && (
                <span className="text-sm text-gray-400 line-through">₹{pricingData.totalOriginalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          
          {pricingData.totalSavings > 0 && (
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg">
              <p className="text-xs font-medium">You Save</p>
              <p className="text-sm font-bold">₹{pricingData.totalSavings.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={addAllToCart}
          style={{ backgroundColor: themColor }}
          className="w-full py-3 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          disabled={[...selectedItems].length <= 1} // Disable if only main product is selected
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add Bundle to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default FrequentlyBoughtTogether;
