import React from 'react';

const ProductDetails = ({ singleData }) => {
  if (!singleData) return null;

  return (
    <div className="border-t border-gray-200 pt-2">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-400 rounded-2xl p-2 md:p-2">
        

        {/* Content - Always visible */}
        <div className="space-y-3 md:space-y-4">
          {/* Dynamic Product Information from Database */}
          {(singleData?.productDetails || singleData?.features || singleData?.specifications || singleData?.description_long) && (
            <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Product Information
              </h4>

              {/* Product Description - HTML Content */}
              {singleData?.productDetails && (
                <div className="mb-4">
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border [&_img]:border-gray-200 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-gray-900 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-gray-900 [&_p]:text-sm [&_p]:text-gray-700 [&_ul]:text-sm [&_ul]:text-gray-700 [&_ol]:text-sm [&_ol]:text-gray-700 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{
                      __html: singleData.productDetails
                    }}
                  />
                </div>
              )}

              {/* Long Description - HTML Content */}
              {singleData?.description_long && (
                <div className="mb-4">
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border [&_img]:border-gray-200 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-gray-900 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-gray-900 [&_p]:text-sm [&_p]:text-gray-700 [&_ul]:text-sm [&_ul]:text-gray-700 [&_ol]:text-sm [&_ol]:text-gray-700 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{
                      __html: singleData.description_long
                    }}
                  />
                </div>
              )}

              {/* Database Specifications - HTML Support */}
              {singleData?.specifications && Object.keys(singleData.specifications).length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Specifications</h5>
                  <div className="space-y-1">
                    {Object.entries(singleData.specifications).map(([key, value], index) => (
                      <div key={index} className="flex justify-between items-start py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-xs md:text-sm text-gray-600 font-medium capitalize flex-1 mr-2">
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                        </span>
                        <div 
                          className="text-xs md:text-sm text-gray-800 text-right flex-1 prose prose-sm max-w-none [&_p]:text-xs [&_p]:md:text-sm [&_p]:text-gray-800 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600"
                          dangerouslySetInnerHTML={{
                            __html: typeof value === 'string' ? value : String(value)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Database Features - HTML Support */}
              {singleData?.features && Array.isArray(singleData.features) && singleData.features.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Key Features</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {singleData.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-xs md:text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                        <svg className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div 
                          className="leading-relaxed prose prose-sm max-w-none [&_p]:text-xs [&_p]:md:text-sm [&_p]:text-gray-600 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600"
                          dangerouslySetInnerHTML={{
                            __html: typeof feature === 'string' ? feature : String(feature)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Database Material/Brand Info */}
              {(singleData?.material || singleData?.brand || singleData?.model || singleData?.color) && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Product Details</h5>
                  <div className="space-y-1">
                    {singleData?.brand && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-xs md:text-sm text-gray-600 font-medium">Brand</span>
                        <span className="text-xs md:text-sm text-gray-800">{singleData.brand}</span>
                      </div>
                    )}
                    {singleData?.model && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-xs md:text-sm text-gray-600 font-medium">Model</span>
                        <span className="text-xs md:text-sm text-gray-800">{singleData.model}</span>
                      </div>
                    )}
                    {singleData?.material && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-xs md:text-sm text-gray-600 font-medium">Material</span>
                        <span className="text-xs md:text-sm text-gray-800">{singleData.material}</span>
                      </div>
                    )}
                    {singleData?.color && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-xs md:text-sm text-gray-600 font-medium">Color</span>
                        <span className="text-xs md:text-sm text-gray-800">{singleData.color}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional HTML Content Fields from Database */}
              {singleData?.htmlContent && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Additional Information</h5>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border [&_img]:border-gray-200 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-gray-900 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-gray-900 [&_p]:text-sm [&_p]:text-gray-700 [&_ul]:text-sm [&_ul]:text-gray-700 [&_ol]:text-sm [&_ol]:text-gray-700 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{
                      __html: singleData.htmlContent
                    }}
                  />
                </div>
              )}

              {/* Technical Specifications in HTML */}
              {singleData?.tech_specs && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Technical Specifications</h5>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-200 [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:p-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_td]:border [&_td]:border-gray-200 [&_td]:p-2 [&_td]:text-sm [&_p]:text-sm [&_p]:text-gray-700 [&_ul]:text-sm [&_ul]:text-gray-700 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{
                      __html: singleData.tech_specs
                    }}
                  />
                </div>
              )}

              {/* Product Highlights in HTML */}
              {singleData?.highlights && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-800 mb-2">Product Highlights</h5>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:border [&_img]:border-gray-200 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-gray-900 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-gray-900 [&_p]:text-sm [&_p]:text-gray-700 [&_ul]:text-sm [&_ul]:text-gray-700 [&_ol]:text-sm [&_ol]:text-gray-700 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_em]:italic [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{
                      __html: singleData.highlights
                    }}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Delivery Information */}
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Delivery Information
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                <span className="text-xs md:text-sm text-gray-600 font-medium">Delivery Time</span>
                <span className="text-xs md:text-sm text-gray-800 font-medium">2-5 Business Days</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                <span className="text-xs md:text-sm text-gray-600 font-medium">Free Delivery</span>
                <span className="text-xs md:text-sm text-green-600 font-medium">Above ₹499</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                <span className="text-xs md:text-sm text-gray-600 font-medium">Same Day Delivery</span>
                <span className="text-xs md:text-sm text-blue-600 font-medium">Available in Metro Cities</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs md:text-sm text-gray-600 font-medium">COD Available</span>
                <span className="text-xs md:text-sm text-green-600 font-medium">✓ Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Returns & Exchange Policy */}
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Returns & Exchange
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center text-xs md:text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">7 Days Easy Returns</span>
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">Free Size Exchange</span>
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">No Questions Asked</span>
              </div>
              <div className="flex items-center text-xs md:text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">Instant Refund</span>
              </div>
            </div>
          </div>

          {/* Price Guarantee */}
          <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Price Guarantee
            </h4>
            <div className="space-y-2">
              <div className="flex items-start text-xs md:text-sm text-gray-600 p-2 bg-orange-50 rounded-lg">
                <svg className="w-3 h-3 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-gray-800">Best Price Guarantee</p>
                  <p className="leading-relaxed">Found it cheaper elsewhere? We'll match the price!</p>
                </div>
              </div>
              <div className="flex items-start text-xs md:text-sm text-gray-600 p-2 bg-green-50 rounded-lg">
                <svg className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="font-medium text-gray-800">Price Protection</p>
                  <p className="leading-relaxed">Price drops after purchase? Get refund of difference!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Need Help with Your Order?</p>
                <p className="text-xs opacity-90">Get instant support from our experts</p>
              </div>
              <button className="bg-white text-green-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                Chat Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
