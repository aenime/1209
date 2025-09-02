import React from "react";

const OrderSummary = ({ 
  checkoutTotals, 
  selectedProduct, 
  isEligibleForOffers 
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Shipping Method */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Shipping Method</h2>
        </div>
        <div className="px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <input
                type="radio"
                checked
                readOnly
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Standard Shipping</div>
                <div className="text-xs sm:text-sm text-gray-600">5-8 business days</div>
              </div>
            </div>
            <div className="text-sm font-medium text-green-600">FREE</div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
        </div>
        <div className="px-4 sm:px-6 py-6 space-y-3 sm:space-y-4">
          {/* Items */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Subtotal ({selectedProduct?.length || 0} item{selectedProduct?.length !== 1 ? 's' : ''})
            </span>
            <span className="font-medium text-gray-900">
              ₹{checkoutTotals.originalTotal.toLocaleString()}
            </span>
          </div>

          {/* Discount - only show for eligible users */}
          {isEligibleForOffers && checkoutTotals.originalTotal > checkoutTotals.offerTotal && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-green-600">
                -₹{(checkoutTotals.originalTotal - checkoutTotals.offerTotal).toLocaleString()}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-green-600">FREE</span>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-3 sm:pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{checkoutTotals.finalTotal.toLocaleString()}
              </span>
            </div>
            {/* Savings badge - only for eligible users */}
            {isEligibleForOffers && checkoutTotals.originalTotal > checkoutTotals.offerTotal && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  You saved ₹{(checkoutTotals.originalTotal - checkoutTotals.offerTotal).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Items in Your Order</h2>
        </div>
        <div className="px-4 sm:px-6 py-6">
          {selectedProduct?.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {selectedProduct.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name || `Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">Item {index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.name || `Product ${index + 1}`}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Qty: {item.quantity || 1}
                    </div>
                    {item.variant && (
                      <div className="text-xs text-gray-500">
                        {item.variant}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900 flex-shrink-0">
                    ₹{(item.price || Math.floor(checkoutTotals.finalTotal / selectedProduct.length)).toLocaleString()}
                  </div>
                </div>
              ))}
              {selectedProduct.length > 3 && (
                <div className="text-sm text-gray-500 pt-2 border-t">
                  + {selectedProduct.length - 3} more items
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-sm">No items in cart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
