import React from "react";

const CheckoutHeader = ({ 
  title = "Checkout", 
  step, 
  totalSteps = 3, 
  onBack, 
  showBackButton = true 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center min-w-0 flex-1">
            {showBackButton && (
              <button 
                onClick={onBack}
                className="mr-3 sm:mr-4 p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {step && totalSteps && (
                <div className="text-xs text-gray-500 mt-0.5">
                  Step {step} of {totalSteps}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress indicators on larger screens */}
          {step && totalSteps && (
            <div className="hidden sm:flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index + 1 <= step
                      ? 'bg-blue-600'
                      : index + 1 === step + 1
                      ? 'bg-blue-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Progress bar on mobile */}
        {step && totalSteps && (
          <div className="sm:hidden pb-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{step}/{totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutHeader;
