import React from 'react';
import { cn } from '../utils/cn';
import envConfig from '../utils/envConfig';

const LogoText = ({ 
  className = '',
  size = 'medium',
  isScrolled = false,
  onClick,
  ...props 
}) => {
  // Get logo text and tagline from environment config
  // Uses REACT_APP_FAM for text logo, domain name if FAM is blank
  const logoText = envConfig.get('REACT_APP_FAM');
  const logoTagline = envConfig.get('REACT_APP_BRAND_TAGLINE') || 'SHOP ONLINE';

  // Size variants
  const sizeClasses = {
    small: 'text-lg sm:text-xl',
    medium: 'text-xl sm:text-2xl',
    large: 'text-2xl sm:text-3xl',
    xlarge: 'text-3xl sm:text-4xl'
  };

  return (
    <div 
      className={cn(
        "cursor-pointer select-none transition-all duration-300 hover:scale-105",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div 
        className={cn(
          "font-black tracking-tight leading-none font-logo",
          sizeClasses[size],
          isScrolled 
            ? "text-gray-900" 
            : "text-white drop-shadow-lg"
        )}
        style={{
          backgroundImage: isScrolled 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: isScrolled ? 'transparent' : 'inherit'
        }}
      >
        {logoText}
      </div>
      
      {/* Optional tagline */}
      <div 
        className={cn(
          "text-xs sm:text-sm font-medium tracking-wide opacity-80 mt-0.5 font-brand",
          isScrolled ? "text-gray-600" : "text-white/90"
        )}
      >
        {logoTagline}
      </div>
    </div>
  );
};

export default LogoText;
