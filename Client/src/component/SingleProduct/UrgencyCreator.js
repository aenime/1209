import React, { useState, useEffect } from 'react';
import { useOffer } from '../../contexts/OfferContext';

const UrgencyCreator = React.memo(({ onActionTaken, className = "" }) => {
  // Offer system integration - hide fake urgency in non-offer view
  const { isEligibleForOffers } = useOffer();
  
  const [viewers, setViewers] = useState(32); // Set to 32 as requested
  const [recentOrders, setRecentOrders] = useState(8); // Set to 8 as requested
  const [stockLevel] = useState(18); // Set to 18 as requested
  const [priceJump, setPriceJump] = useState(false);
  const [flashSale, setFlashSale] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes

  useEffect(() => {
    // Don't run effects if not eligible for offers
    if (!isEligibleForOffers) return;
    
    // Update viewers every 15-30 seconds
    const viewerInterval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        return Math.max(10, Math.min(60, prev + change));
      });
    }, Math.random() * 15000 + 15000);

    // Update recent orders every 45-90 seconds
    const orderInterval = setInterval(() => {
      setRecentOrders(prev => {
        const newOrders = Math.floor(Math.random() * 3) + 1;
        return prev + newOrders;
      });
    }, Math.random() * 45000 + 45000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setFlashSale(false);
          setPriceJump(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(orderInterval);
      clearInterval(countdownInterval);
    };
  }, [isEligibleForOffers]);
  
  // Don't render any fake urgency in non-offer view
  if (!isEligibleForOffers) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Compact Price Jump Warning */}
      {priceJump && (
        <div className="bg-red-500 rounded-lg p-3 text-white flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="text-lg">⚠️</div>
            <div>
              <h4 className="font-bold text-sm">PRICE INCREASED!</h4>
              <p className="text-xs opacity-90">Don't miss future deals</p>
            </div>
          </div>
          <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded">ACT NOW</div>
        </div>
      )}

      {/* Compact Single-Row Exclusive Online Deal - Mobile Optimized */}
      <div className="relative bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-3 overflow-hidden shadow-lg">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50"></div>
        
        {/* Single row content */}
        <div className="relative z-10 flex items-center justify-between text-white">
          {/* Left: Title and icon */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-lg animate-pulse">🎯</span>
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wide leading-none">
                EXCLUSIVE ONLINE DEAL
              </h4>
              <p className="text-xs opacity-90 font-medium leading-none mt-0.5">
                Limited time only
              </p>
            </div>
          </div>
          
          {/* Right: Offers and status */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="bg-white/20 px-2 py-1 rounded-md font-bold">🛍️ Buy 3 Get 1 FREE</span>
              <span className="bg-white/20 px-2 py-1 rounded-md font-bold">✨ Extra 10% OFF</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/25 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
              <span className="font-bold text-xs">LIVE</span>
            </div>
          </div>
        </div>
        
        {/* Subtle border animation */}
        <div className="absolute inset-0 rounded-xl border border-white/30 animate-pulse"></div>
      </div>

      
      {/* Live Activity Indicators - 3 Column Layout */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Viewers Count */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 sm:p-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
              <div className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs font-bold">
                LIVE
              </div>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
              👀 {viewers} people viewing this right now
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 sm:p-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
              🛒 {recentOrders} orders in last hour
            </div>
            <div className="text-xs text-gray-500 mt-0.5">High demand product</div>
          </div>
        </div>

        {/* Stock Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-2 sm:p-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
              ⚠️ Only {stockLevel} left in stock
            </div>
            <div className="px-1 py-0.5 bg-red-100 text-red-800 rounded text-xs font-bold mt-1">
              LOW STOCK
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Mobile-First Social Proof */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 shadow-lg">
        <div className="text-white">
          {/* Top section with avatars and ratings */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-3">
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-3 border-white flex items-center justify-center text-xs sm:text-sm text-white font-bold shadow-lg">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full border-3 border-white flex items-center justify-center text-xs text-white font-bold shadow-lg">
                  +{viewers - 3}
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm sm:text-base font-bold">Active Shoppers</div>
                <div className="text-xs opacity-90">Viewing right now</div>
              </div>
            </div>
            
            {/* Rating section */}
            <div className="flex flex-col sm:items-end">
              <div className="flex items-center space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm sm:text-base">⭐</span>
                ))}
              </div>
              <div className="text-xs sm:text-sm font-semibold">4.8/5 • 1,247 reviews</div>
            </div>
          </div>
          
          {/* Recent purchase notification */}
          <div className="bg-white/15 rounded-xl p-3 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  <span className="font-bold text-yellow-300">प्रिया शर्मा</span> from दिल्ली
                </p>
                <p className="text-xs opacity-90">just purchased this item 2 minutes ago</p>
              </div>
              <div className="text-lg">🛍️</div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
});

export default UrgencyCreator;
