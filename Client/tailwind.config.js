/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Custom font families for logo and branding
      fontFamily: {
        'logo': ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        'brand': ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Optimized animations (only essential ones)
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-bounce': 'scale-bounce 0.3s ease-in-out',
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'cart-bounce': 'cart-bounce 1s ease-in-out',
        'pulse-glow': 'pulse-glow 2s infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'logo-pulse': 'logo-pulse 0.6s ease-in-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'zoom-in-95': 'zoom-in-95 0.3s ease-out',
        // Marquee animations for news ticker
        'marquee': 'marquee 20s linear infinite',
        'marquee-slide': 'marquee-slide 15s linear infinite',
        // Shimmer effect
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      // Optimized keyframes (only essential ones)
      keyframes: {
        'scale-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'cart-bounce': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6)' },
        },
        'slide-in-right': {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'logo-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'slide-in-from-bottom': {
          'from': { transform: 'translateY(100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'zoom-in-95': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
        // Marquee keyframes
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-slide': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        // Shimmer effect
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      // Essential spacing only
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Product-specific aspect ratios
      aspectRatio: {
        'product-square': '1 / 1',
        'product-portrait': '2 / 3',
        'product-landscape': '3 / 2',
      },
      
      // Essential grid templates
      gridTemplateColumns: {
        'product-2': 'repeat(2, minmax(0, 1fr))',
        'product-3': 'repeat(3, minmax(0, 1fr))',
        'product-4': 'repeat(4, minmax(0, 1fr))',
        'product-6': 'repeat(6, minmax(0, 1fr))',
      },
      
      // Essential box shadows only
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-focus': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'button-primary': '0 4px 14px 0 rgb(0 0 0 / 0.2)',
        'modal': '0 20px 60px 0 rgb(0 0 0 / 0.3)',
      },
      
      // Essential border radius values
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
      },
      
      // Text shadow utilities using drop-shadow
      dropShadow: {
        'text-sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'text': '0 2px 4px rgba(0, 0, 0, 0.4)',
        'text-lg': '0 4px 8px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
