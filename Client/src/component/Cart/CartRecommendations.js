import React from 'react';
import ProductGridTailwind from '../ProductGrid/ProductGridTailwind';
import { getSecondaryThemeColor } from '../../utils/themeColorsSimple';

const CartRecommendations = React.memo(({ 
  recommendations = [], 
  onAddToCart, 
  currentCartItems = [],
  isLoading = false, // Add isLoading prop
  themColor = getSecondaryThemeColor() // Dynamic theme color
}) => {

  // Only use actual recommendations, no fallback to sample data
  const displayRecommendations = recommendations || [];
  
  // Filter out items already in cart
  const filteredRecommendations = displayRecommendations.filter(
    item => !currentCartItems.some(cartItem => cartItem._id === item._id)
  );

  // Show loading state or return null if no recommendations
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">You might also like</h3>
              <p className="text-sm text-gray-600">Finding recommendations for you...</p>
            </div>
          </div>
        </div>
        <ProductGridTailwind 
          products={[]}
          columns={4}
          aspectRatio="square"
          loading={true}
          className="mb-4"
        />
      </div>
    );
  }

  if (filteredRecommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mt-4">
      {/* Header - Same as Home Page Style */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          You might also like
        </h2>
        <p className="text-sm text-gray-600 mb-3 max-w-lg mx-auto">
          Curated picks just for you
        </p>
        <div className="w-16 h-0.5 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      {/* Products Grid - Show only 2 products */}
      <ProductGridTailwind 
        products={filteredRecommendations.slice(0, 4)}
        columns={4}
        aspectRatio="square"
        className="mb-4"
      />

      {/* Trust Indicators - Compact */}
      <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-green-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs font-medium">Verified Products</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-medium">Secure Checkout</span>
        </div>
        <div className="flex items-center space-x-2 text-purple-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-medium">Fast Delivery</span>
        </div>
      </div>
    </div>
  );
});

export default CartRecommendations;
