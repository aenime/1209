import React, { useState, useEffect } from 'react';
import { useOffer } from '../../contexts/OfferContext';

const FlashSaleTimer = ({ 
  maxMinutes = 9, 
  onTimeExpired, 
  className = "",
  showIcon = true,
  showProgress = true,
  compact = false 
}) => {
  // Offer system integration - hide fake urgency in non-offer view
  const { isEligibleForOffers } = useOffer();
  
  // Initialize timer with random time between 3-9 minutes
  const getInitialTime = () => {
    const savedTime = localStorage.getItem('flashSaleTimerEnd');
    const lastResetTime = localStorage.getItem('flashSaleTimerLastReset');
    const now = Date.now();
    
    // Reset timer if it's been more than 2 hours since last reset
    const twoHours = 2 * 60 * 60 * 1000;
    if (lastResetTime && (now - parseInt(lastResetTime)) > twoHours) {
      localStorage.removeItem('flashSaleTimerEnd');
      localStorage.removeItem('flashSaleTimerDisabled');
      localStorage.setItem('flashSaleTimerLastReset', now.toString());
    }
    
    // Check if timer was recently disabled (within last 30 minutes)
    const isTimerDisabled = localStorage.getItem('flashSaleTimerDisabled');
    const timerDisabledTime = localStorage.getItem('flashSaleTimerDisabledTime');
    
    if (isTimerDisabled === 'true' && timerDisabledTime) {
      const thirtyMinutes = 30 * 60 * 1000;
      if ((now - parseInt(timerDisabledTime)) < thirtyMinutes) {
        return -1; // Don't show timer for 30 minutes after expiry
      } else {
        // Re-enable timer after 30 minutes
        localStorage.removeItem('flashSaleTimerDisabled');
        localStorage.removeItem('flashSaleTimerDisabledTime');
      }
    }
    
    if (savedTime) {
      const endTime = parseInt(savedTime);
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      if (remaining > 0) {
        return remaining;
      }
    }
    
    // Create new timer - random time between 3-9 minutes
    const randomMinutes = Math.floor(Math.random() * 7) + 3; // 3-9 minutes
    const timeInSeconds = randomMinutes * 60;
    const endTime = now + (timeInSeconds * 1000);
    localStorage.setItem('flashSaleTimerEnd', endTime.toString());
    if (!lastResetTime) {
      localStorage.setItem('flashSaleTimerLastReset', now.toString());
    }
    return timeInSeconds;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isExpired, setIsExpired] = useState(false);

  // Timer effect - must be called before any conditional returns
  useEffect(() => {
    // Don't run timer effects if not eligible for offers
    if (!isEligibleForOffers) return;
    
    let timer;
    
    if (timeLeft !== -1 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 0) {
            if (!isExpired) {
              setIsExpired(true);
              localStorage.setItem('flashSaleTimerDisabled', 'true');
              localStorage.setItem('flashSaleTimerDisabledTime', Date.now().toString());
              if (onTimeExpired) onTimeExpired();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, isExpired, onTimeExpired, isEligibleForOffers]);
  
  // Don't render any fake timers in non-offer view
  if (!isEligibleForOffers) {
    return null;
  }

  // Color gradation based on time remaining
  const getTimerColors = () => {
    if (timeLeft <= 60) {
      // Critical - Red with pulse animation
      return {
        solidColor: 'bg-red-600',
        background: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-800',
        icon: 'text-red-600',
        pulse: true,
        urgencyLevel: 'critical'
      };
    } else if (timeLeft <= 180) {
      // High urgency - Orange solid
      return {
        solidColor: 'bg-orange-500',
        background: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-800',
        icon: 'text-orange-600',
        pulse: false,
        urgencyLevel: 'high'
      };
    } else if (timeLeft <= 300) {
      // Medium urgency - Yellow solid
      return {
        solidColor: 'bg-yellow-500',
        background: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        icon: 'text-yellow-600',
        pulse: false,
        urgencyLevel: 'medium'
      };
    } else {
      // Low urgency - Blue solid
      return {
        solidColor: 'bg-blue-500',
        background: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        pulse: false,
        urgencyLevel: 'low'
      };
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get urgency message based on time left
  const getUrgencyMessage = () => {
    if (timeLeft <= 60) return "⚡ ENDS IN SECONDS!";
    if (timeLeft <= 180) return "🔥 ALMOST OVER!";
    if (timeLeft <= 300) return "⏰ LIMITED TIME!";
    return "💥 FLASH SALE ACTIVE";
  };



  // Don't render if disabled
  if (timeLeft === -1 || isExpired) {
    return null;
  }

  const colors = getTimerColors();
  const progressPercentage = ((maxMinutes * 60 - timeLeft) / (maxMinutes * 60)) * 100;

  // Compact one-line version - Mobile Optimized
  if (compact) {
    return (
      <div className={`flex items-center justify-between bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2.5 w-full ${colors.pulse ? 'animate-pulse' : ''} ${className}`}>
        {/* Left side - Flash sale message */}
        <div className="flex items-center space-x-2 flex-shrink min-w-0">
          {showIcon && (
            <svg className="w-4 h-4 animate-bounce flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm block leading-tight">💥 FLASH SALE ACTIVE</span>
            <span className="text-xs opacity-90 block leading-tight hidden sm:inline">Special pricing ends soon</span>
            <span className="text-xs opacity-90 block leading-tight sm:hidden">Ends soon</span>
          </div>
        </div>
        
        {/* Right side - Timer and progress */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {showProgress && (
            <div className="w-12 sm:w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          )}
          <div className="text-right">
            <span className="font-mono font-bold text-sm sm:text-base block leading-tight">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs opacity-75 hidden sm:block">time left</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${colors.background} ${colors.border} border-2 p-4 ${colors.pulse ? 'animate-pulse' : ''} ${className}`}>
      {/* Solid background overlay */}
      <div className={`absolute inset-0 ${colors.solidColor} opacity-10 animate-pulse`}></div>
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Header with icon and message */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {showIcon && (
              <div className={`w-8 h-8 ${colors.pulse ? 'animate-bounce' : 'animate-pulse'} ${colors.icon} flex items-center justify-center`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div>
              <h4 className={`font-bold text-sm ${colors.text}`}>
                {getUrgencyMessage()}
              </h4>
              <p className={`text-xs opacity-75 ${colors.text}`}>
                Special pricing ends soon
              </p>
            </div>
          </div>
          
          {/* Timer display */}
          <div className="text-right">
            <div className={`text-xl font-bold font-mono ${colors.text} ${colors.pulse ? 'animate-pulse' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            <div className={`text-xs opacity-75 ${colors.text}`}>
              Time Left
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="relative">
            <div className={`w-full h-2 bg-white/50 rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${colors.solidColor} transition-all duration-1000 ease-linear relative`}
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress percentage text */}
            <div className={`text-center mt-1 text-xs font-medium ${colors.text} opacity-75`}>
              {Math.round(progressPercentage)}% elapsed
            </div>
          </div>
        )}

        {/* Additional urgency indicators for critical time */}
        {colors.urgencyLevel === 'critical' && (
          <div className="mt-3 flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
            <span className="text-xs font-bold text-red-800 animate-pulse">
              ACT NOW!
            </span>
          </div>
        )}

        {/* Social proof elements for high urgency */}
        {colors.urgencyLevel === 'high' && (
          <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
            <div className="bg-white/50 px-2 py-1 rounded-full">
              <span className={`font-medium ${colors.text}`}>🔥 Hot Deal</span>
            </div>
            <div className="bg-white/50 px-2 py-1 rounded-full">
              <span className={`font-medium ${colors.text}`}>⚡ Limited Stock</span>
            </div>
          </div>
        )}
      </div>

      {/* Animated border effect for critical urgency */}
      {colors.urgencyLevel === 'critical' && (
        <div className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping"></div>
      )}
    </div>
  );
};

export default FlashSaleTimer;
