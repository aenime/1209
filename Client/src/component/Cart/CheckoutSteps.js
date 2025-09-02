// Enhanced Checkout Steps Component for Cart Page
import React from 'react';

const CheckoutSteps = React.memo(({ 
  currentStep = 1, 
  totalItems = 0, 
  totalPrice = 0, 
  onProceedToCheckout,
  showProgressBar = true 
}) => {
  const steps = [
    {
      id: 1,
      title: "Cart Review",
      subtitle: "Review your items",
      icon: "🛒",
      description: "Check products, quantities, and remove unwanted items"
    },
    {
      id: 2,
      title: "Address Details",
      subtitle: "Delivery information",
      icon: "📍",
      description: "Enter your delivery address and contact details"
    },
    {
      id: 3,
      title: "Payment",
      subtitle: "Secure payment",
      icon: "💳",
      description: "Choose payment method and complete your order"
    }
  ];

  return (
    <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-blue-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Checkout Process
            </h2>
            <p className="text-blue-100 text-sm">
              {totalItems} item{totalItems !== 1 ? 's' : ''} • ₹{totalPrice.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {currentStep}/3
            </div>
            <div className="text-xs text-blue-100 uppercase tracking-wide">
              Steps Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgressBar && (
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                    currentStep >= step.id 
                      ? 'bg-orange-400 shadow-lg' 
                      : 'bg-white/20'
                  }`}>
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      currentStep > step.id 
                        ? 'bg-green-400 w-full' 
                        : currentStep === step.id 
                        ? 'bg-blue-100 w-1/2 animate-pulse' 
                        : 'w-0'
                    }`}></div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentStep > step.id 
                        ? 'bg-green-400 scale-110' 
                        : currentStep === step.id 
                        ? 'bg-yellow-400 animate-bounce' 
                        : 'bg-white/30'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Steps Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`group relative p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                currentStep === step.id
                  ? 'bg-blue-50 border-2 border-blue-200 shadow-lg scale-105'
                  : currentStep > step.id
                  ? 'bg-green-50 border-2 border-green-200 shadow-md'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-200 hover:shadow-md'
              }`}
            >
              {/* Step Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-2xl transition-all duration-300 ${
                currentStep === step.id
                  ? 'bg-blue-500 scale-110 animate-pulse'
                  : currentStep > step.id
                  ? 'bg-green-500'
                  : 'bg-gray-300 group-hover:bg-blue-100'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={currentStep === step.id ? 'text-white' : 'text-gray-600'}>
                    {step.icon}
                  </span>
                )}
              </div>

              {/* Step Content */}
              <div>
                <h3 className={`font-semibold mb-1 transition-colors ${
                  currentStep === step.id
                    ? 'text-blue-900'
                    : currentStep > step.id
                    ? 'text-green-900'
                    : 'text-gray-700 group-hover:text-blue-700'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm font-medium mb-2 transition-colors ${
                  currentStep === step.id
                    ? 'text-blue-600'
                    : currentStep > step.id
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}>
                  {step.subtitle}
                </p>
                <p className={`text-xs leading-relaxed transition-colors ${
                  currentStep === step.id
                    ? 'text-blue-700'
                    : currentStep > step.id
                    ? 'text-green-700'
                    : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>

              {/* Active Step Indicator */}
              {currentStep === step.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full animate-ping"></div>
                  <div className="absolute top-0 w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              )}

              {/* Completed Step Badge */}
              {currentStep > step.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        {currentStep === 1 && onProceedToCheckout && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">
                  Ready to proceed?
                </h4>
                <p className="text-sm text-amber-700">
                  Complete your order in just 2 more steps
                </p>
              </div>
              <button
                onClick={onProceedToCheckout}
                className="group bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  Continue
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Features Footer */}
      <div className="bg-gray-50 border-t border-gray-100 p-4">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">SSL Secured</span>
          </div>
          <div className="flex items-center text-blue-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Safe Payment</span>
          </div>
          <div className="flex items-center text-purple-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium">Money Back Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CheckoutSteps;
