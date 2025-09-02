import React, { useState } from 'react';

const EnhancedDeliveryStatus = ({ 
  pinCode, 
  onPinCodeChange, 
  className = "", 
  productDetails = {},
  showProductDetailsSection = false, // Controls when to show product details section
  selectedSize = null // Pass selected size to conditionally show product details
}) => {
  const [showProductDetails, setShowProductDetails] = useState(false); // Default to false, will show after size selection

  return (
    <div className={`space-y-4 ${className}`}>
      
      

      {/* Product Details Section - Show only after size selection */}
      {selectedSize && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <button
            onClick={() => setShowProductDetails(!showProductDetails)}
            className="w-full flex items-center justify-between text-left hover:bg-green-100/50 transition-colors duration-200 rounded-xl p-2 -m-2"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">Product Details</h3>
                <p className="text-sm text-gray-600">View contents and specifications</p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showProductDetails ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProductDetails && (
            <div className="mt-6 space-y-4">
              {/* Product Details HTML Content */}
              {productDetails.htmlContent && (
                <div className="bg-white rounded-lg p-4
                 border border-gray-200">
                  <div
                    className="prose prose-sm max-w-none text-gray-700 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border [&_img]:border-gray-200 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-700 [&_ul]:text-gray-700 [&_ol]:text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: productDetails.htmlContent,
                    }}
                  />
                </div>
              )}

              

              {/* What's in the Box */}
              {productDetails.contents && productDetails.contents.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    What's in the Box
                  </h4>
                  <ul className="space-y-2">
                    {productDetails.contents.map((item, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Specifications */}
              {productDetails.specifications && Object.keys(productDetails.specifications).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(productDetails.specifications).map(([key, value], index) => (
                      <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {productDetails.features && productDetails.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {productDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <svg className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Default content if no product details provided */}
              {(!productDetails.htmlContent && !productDetails.contents && !productDetails.specifications && !productDetails.features) && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Product details will be displayed here</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedDeliveryStatus;
