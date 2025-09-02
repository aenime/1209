// Enhanced Cart Summary Component
import React, { useState } from 'react';
import { getSecondaryThemeColor } from '../../utils/themeColorsSimple';

const CartSummary = ({ 
  selectedProduct = [], 
  totalPrice = 0, 
  totalMRP = 0, 
  totalDiscount = 0, 
  totalExtraDiscount = 0,
  onProceedToCheckout,
  themColor = getSecondaryThemeColor(), // Dynamic theme color
  isEligibleForOffers = false,
  isBot = false,
  isMobile = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Fee calculations
  // const deliveryCharges = 0; // Free delivery
  // const platformFee = 0; // No platform fee
  const savedAmount = totalDiscount + totalExtraDiscount + 40; // Including delivery savings



  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Mobile Header */}
      <div 
        className="p-3 sm:p-6"
        style={{
          background: `linear-gradient(135deg, ${themColor} 0%, ${getSecondaryThemeColor()} 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold text-white">Bill Details</h3>
              <p className="text-xs text-white/80">
                {selectedProduct.length} item{selectedProduct.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg sm:text-2xl font-bold text-white">
              ₹{totalPrice.toLocaleString()}
            </div>
            <div className="text-xs text-white/80">Total</div>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="p-3 sm:p-6">
        <div className="space-y-3">
          {/* Basic Details */}
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              Price ({selectedProduct.length} item{selectedProduct.length !== 1 ? 's' : ''})
            </span>
            <span className="text-sm font-semibold text-gray-900">
              ₹{(isEligibleForOffers ? totalMRP : totalPrice).toLocaleString()}
            </span>
          </div>

          {/* Price breakdown - only show discount if eligible for offers */}
          {isEligibleForOffers && totalDiscount > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Discount</span>
              <span className="text-sm font-semibold text-green-600">
                -₹{totalDiscount.toLocaleString()}
              </span>
            </div>
          )}

          {isEligibleForOffers && totalExtraDiscount > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">Special Offer (Buy 3 Get Cheapest Free)</span>
              <span className="text-sm font-semibold text-green-600">
                -₹{totalExtraDiscount.toLocaleString()}
              </span>
            </div>
          )}

          {/* Delivery Charges - Compact Mobile Design */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Delivery</span>
              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                FREE
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-400 line-through text-xs">₹40</span>
              <span className="text-sm font-semibold text-green-600">FREE</span>
            </div>
          </div>

          {/* Expandable Details - Mobile Optimized */}
          <div className="border-t border-gray-100 pt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-2 hover:opacity-80 font-medium transition-opacity"
              style={{ color: themColor }}
            >
              <span className="text-sm">{showDetails ? 'Hide' : 'Show'} breakdown</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDetails && (
              <div className="space-y-2 bg-gray-50 rounded-lg p-3 mt-2 animate-fadeIn">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Packaging Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Total Savings</span>
                    <span className="text-green-600 font-bold">₹{savedAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Total Section - Mobile Optimized */}
          <div className="border-t-2 border-gray-200 pt-3 mt-4">
            <div 
              className="rounded-lg p-3"
              style={{ backgroundColor: `${themColor}15` }} // 15% opacity of theme color
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span 
                  className="text-xl font-bold"
                  style={{ color: themColor }}
                >
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
              {/* Only show savings for eligible users */}
              {isEligibleForOffers && savedAmount > 0 && (
                <div className="flex items-center justify-center mt-2">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Saved ₹{savedAmount.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Mobile Trust Indicators */}
        <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
          <div className="flex items-center" style={{ color: getSecondaryThemeColor() }}>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Secure</span>
          </div>
          <div className="flex items-center" style={{ color: themColor }}>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="font-medium">Fast Delivery</span>
          </div>
          <div className="flex items-center" style={{ color: getSecondaryThemeColor() }}>
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">Easy Returns</span>
          </div>
        </div>
      </div>

      {/* Bottom Banner - only show for eligible users */}
      {isEligibleForOffers && (
        <div className="bg-green-50 border-t border-green-100 p-4">
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700 font-medium">
              Congratulations! You qualified for FREE delivery
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummary;
