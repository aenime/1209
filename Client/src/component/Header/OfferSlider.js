import React from "react";
import { getSecondaryThemeColor } from "../../utils/themeColorsSimple";
import { useOffer } from "../../contexts/OfferContext";

const OfferSlider = () => {
  // Offer system integration - hide fake urgency in non-offer view
  const { isEligibleForOffers } = useOffer();
  
  // Don't render any fake promotional messages in non-offer view
  if (!isEligibleForOffers) {
    return null;
  }
  
  // Get dynamic secondary color for contrast
  const secondaryColor = getSecondaryThemeColor();
  
  // Urgency messages for Indian e-commerce
  const urgencyMessages = [
    "🔥 FLASH SALE: Extra 60% OFF | Only 2 Hours Left! ⏰",
    "⚡ HURRY UP! Free Delivery + COD Available | Limited Time! 🚚",
    "🎯 BIG SAVINGS ALERT: Upto 80% OFF | Ending Soon! 💰",
    "🔔 LAST CHANCE: Buy 3 Products Get Cheapest FREE | Limited Time Only! 🛍️",
    "⭐ MEGA DEAL: Flat ₹500 OFF on orders above ₹1999 | Today Only! 🎉",
    "🚀 TRENDING NOW: Extra 40% OFF + Free Shipping | Grab Fast! 📦",
    "💥 SUPER SAVER: Upto 70% OFF + Instant Cashback | Limited Stock! 💳",
    "🎊 FESTIVE OFFER: Buy More Save More | Ends at Midnight! 🌙",
    "⚡ LIGHTNING DEAL: Extra 50% OFF | Only Few Hours Left! ⚡",
    "🔥 HOT SELLING: Upto 90% OFF + Free COD | Hurry Limited Time! 🏃‍♂️"
  ];

  return (
    <div className="text-white py-2 text-sm font-medium overflow-hidden" style={{ backgroundColor: secondaryColor }}>
      <div 
        className="flex whitespace-nowrap"
        style={{
          animation: 'marquee 60s linear infinite',
        }}
      >
        {/* First set of messages */}
        {urgencyMessages.map((message, index) => (
          <span key={`first-${index}`} className="mx-8 flex-shrink-0">
            {message}
          </span>
        ))}
        {/* Duplicate set for seamless loop */}
        {urgencyMessages.map((message, index) => (
          <span key={`second-${index}`} className="mx-8 flex-shrink-0">
            {message}
          </span>
        ))}
      </div>
      
      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default OfferSlider;
