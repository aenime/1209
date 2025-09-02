// Urgency Timer Component for Cart Page
import React, { useState, useEffect } from 'react';
import { useOffer } from '../../contexts/OfferContext';

const UrgencyTimer = ({ 
  initialMinutes = 7, 
  showStockAlert = true, 
  lowStockCount = 3,
  className = ""
}) => {
  // Offer system integration - hide fake urgency in non-offer view
  const { isEligibleForOffers } = useOffer();
  
  const [timeLeft, setTimeLeft] = useState(() => {
    // Get the expiration time from localStorage
    const expirationTime = localStorage.getItem("cartExpirationTime");
    
    if (expirationTime) {
      // Calculate remaining seconds from expiration time
      const remaining = Math.max(0, Math.floor((parseInt(expirationTime, 10) - new Date().getTime()) / 1000));
      return remaining;
    } else {
      // Fallback to initialMinutes if no expiration time exists
      return initialMinutes * 60;
    }
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Don't run timer effects if not eligible for offers
    if (!isEligibleForOffers || !isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      // Get fresh expiration time on each tick for accuracy
      const expirationTime = localStorage.getItem("cartExpirationTime");
      
      if (expirationTime) {
        // Calculate remaining seconds from current time to expiration
        const remaining = Math.max(0, Math.floor((parseInt(expirationTime, 10) - new Date().getTime()) / 1000));
        
        if (remaining <= 0) {
          setIsActive(false);
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
        }
      } else {
        // Fallback countdown logic if no expiration time exists
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isEligibleForOffers, timeLeft]);

  // Don't render any fake urgency in non-offer view
  if (!isEligibleForOffers) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft <= 180; // Last 3 minutes 
  const isCritical = timeLeft <= 60; // Last 1 minute

  if (timeLeft <= 0) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-700 font-semibold">Time expired! Cart items may no longer be reserved.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${
      isCritical 
        ? 'bg-red-50 border-red-300 animate-pulse' 
        : isUrgent 
        ? 'bg-orange-50 border-orange-300' 
        : 'bg-blue-50 border-blue-300'
    } border rounded-xl p-4 ${className}`}>
      
      {/* Timer Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
            isCritical 
              ? 'bg-red-500 animate-bounce' 
              : isUrgent 
              ? 'bg-orange-500 animate-pulse' 
              : 'bg-blue-500'
          }`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className={`font-bold ${
              isCritical 
                ? 'text-red-800' 
                : isUrgent 
                ? 'text-orange-800' 
                : 'text-blue-800'
            }`}>
              {isCritical 
                ? '⚡ Almost Gone!' 
                : isUrgent 
                ? '🔥 Limited Time!' 
                : '⏰ Reserved for You (7 min)'
              }
            </h4>
            <p className={`text-sm ${
              isCritical 
                ? 'text-red-700' 
                : isUrgent 
                ? 'text-orange-700' 
                : 'text-blue-700'
            }`}>
              {isCritical 
                ? 'Complete your order now to secure your items!' 
                : isUrgent 
                ? 'Hurry! Your cart items are reserved for limited time.' 
                : 'Items reserved in your cart for 7 minutes only.'
              }
            </p>
          </div>
        </div>

        {/* Countdown Display */}
        <div className="text-center">
          <div className={`text-2xl font-bold font-mono ${
            isCritical 
              ? 'text-red-800' 
              : isUrgent 
              ? 'text-orange-800' 
              : 'text-blue-800'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className={`text-xs font-medium ${
            isCritical 
              ? 'text-red-600' 
              : isUrgent 
              ? 'text-orange-600' 
              : 'text-blue-600'
          }`}>
            Minutes Left
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className={`w-full h-2 rounded-full ${
          isCritical 
            ? 'bg-red-200' 
            : isUrgent 
            ? 'bg-orange-200' 
            : 'bg-blue-200'
        }`}>
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isCritical 
                ? 'bg-red-500' 
                : isUrgent 
                ? 'bg-orange-500' 
                : 'bg-blue-500'
            }`}
            style={{ width: `${(timeLeft / (initialMinutes * 60)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Stock Alert */}
      {showStockAlert && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-gray-700 font-medium">
              Only {lowStockCount} left in stock
            </span>
          </div>
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Secured in your cart</span>
          </div>
        </div>
      )}

      {/* Popular Choice Badge */}
      <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
          👥 21 people viewing this
        </div>
        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
          ⭐ Bestseller
        </div>
        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
          🚚 Free delivery
        </div>
      </div>
    </div>
  );
};

export default UrgencyTimer;
