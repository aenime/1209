import React from "react";

const CheckoutButton = ({ 
  onClick, 
  disabled = false, 
  loading = false, 
  children, 
  variant = "primary",
  fullWidth = true,
  sticky = false,
  total
}) => {
  const baseClasses = "flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-400",
    dark: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700 disabled:bg-gray-400"
  };

  const ButtonContent = () => (
    <>
      {loading && (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      )}
      <span className="text-sm sm:text-base">{children}</span>
      {total && (
        <span className="text-sm sm:text-base font-bold">
          ₹{total.toLocaleString()}
        </span>
      )}
    </>
  );

  if (sticky) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 safe-area-inset-bottom">
        <div className="max-w-md mx-auto">
          {total && (
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-lg">₹{total.toLocaleString()}</span>
            </div>
          )}
          <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`w-full ${baseClasses} ${variantClasses[variant]}`}
          >
            <ButtonContent />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${fullWidth ? 'w-full' : ''} ${baseClasses} ${variantClasses[variant]}`}
    >
      <ButtonContent />
    </button>
  );
};

export default CheckoutButton;
