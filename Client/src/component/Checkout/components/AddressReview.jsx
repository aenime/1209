import React from "react";

const AddressReview = ({ 
  address, 
  onEdit, 
  showMergedView = false 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {showMergedView ? '✅ Shipping Address' : 'Shipping address'}
        </h2>
        <button
          onClick={onEdit}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {showMergedView ? 'Edit Address' : 'Edit'}
        </button>
      </div>
      
      <div className="px-4 sm:px-6 py-6">
        {address ? (
          <div className="text-gray-900">
            <div className="font-medium text-base mb-2">
              {address.firstName} {address.lastName}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{address.address1}</div>
              {address.address2 && <div>{address.address2}</div>}
              {address.landmark && (
                <div className="flex items-center text-xs text-blue-600">
                  📍 {address.landmark}
                </div>
              )}
              <div>{address.city}, {address.state} {address.pincode}</div>
              <div>India</div>
              <div className="pt-2 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91 {address.mobile}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm">No address provided</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressReview;
