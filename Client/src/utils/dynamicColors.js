/**
 * Dynamic Color Utility for Tailwind CSS
 * Converts environment colors to inline styles and CSS custom properties
 */

import { getPrimaryThemeColor, getSecondaryThemeColor } from './themeColorsSimple';

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Helper function to adjust color brightness
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// Generate dynamic style object for primary color elements
export const getDynamicPrimaryStyles = (variant = 'default') => {
  const primary = getPrimaryThemeColor();
  const darker = adjustBrightness(primary, -15);
  const lighter = adjustBrightness(primary, 15);

  const baseStyles = {
    '--primary-color': primary,
    '--primary-hover': darker,
    '--primary-light': lighter,
  };

  switch (variant) {
    case 'button':
      return {
        ...baseStyles,
        backgroundColor: primary,
        color: '#ffffff',
        borderColor: primary,
      };
    case 'border':
      return {
        ...baseStyles,
        borderColor: primary,
      };
    case 'text':
      return {
        ...baseStyles,
        color: primary,
      };
    case 'background':
      return {
        ...baseStyles,
        backgroundColor: primary,
      };
    default:
      return baseStyles;
  }
};

// Generate dynamic style object for secondary color elements
export const getDynamicSecondaryStyles = (variant = 'default') => {
  const secondary = getSecondaryThemeColor();
  const darker = adjustBrightness(secondary, -15);
  const lighter = adjustBrightness(secondary, 15);

  const baseStyles = {
    '--secondary-color': secondary,
    '--secondary-hover': darker,
    '--secondary-light': lighter,
  };

  switch (variant) {
    case 'button':
      return {
        ...baseStyles,
        backgroundColor: secondary,
        color: '#ffffff',
        borderColor: secondary,
      };
    case 'border':
      return {
        ...baseStyles,
        borderColor: secondary,
      };
    case 'text':
      return {
        ...baseStyles,
        color: secondary,
      };
    case 'background':
      return {
        ...baseStyles,
        backgroundColor: secondary,
      };
    default:
      return baseStyles;
  }
};

// Generate Tailwind-compatible style string for dynamic colors
export const getDynamicTailwindStyles = () => {
  const primary = getPrimaryThemeColor();
  const secondary = getSecondaryThemeColor();
  
  return `
    .bg-primary-dynamic { background-color: ${primary} !important; }
    .bg-secondary-dynamic { background-color: ${secondary} !important; }
    .text-primary-dynamic { color: ${primary} !important; }
    .text-secondary-dynamic { color: ${secondary} !important; }
    .border-primary-dynamic { border-color: ${primary} !important; }
    .border-secondary-dynamic { border-color: ${secondary} !important; }
    .hover\\:bg-primary-dynamic:hover { background-color: ${adjustBrightness(primary, -15)} !important; }
    .hover\\:bg-secondary-dynamic:hover { background-color: ${adjustBrightness(secondary, -15)} !important; }
    .ring-primary-dynamic { --tw-ring-color: ${primary} !important; }
    .ring-secondary-dynamic { --tw-ring-color: ${secondary} !important; }
  `;
};

// Initialize dynamic styles in the document head
export const injectDynamicStyles = () => {
  // Remove existing dynamic styles
  const existingStyles = document.getElementById('dynamic-theme-styles');
  if (existingStyles) {
    existingStyles.remove();
  }

  // Create and inject new dynamic styles
  const styleElement = document.createElement('style');
  styleElement.id = 'dynamic-theme-styles';
  styleElement.textContent = getDynamicTailwindStyles();
  document.head.appendChild(styleElement);
};

// CSS Custom Properties for use in CSS files
export const getDynamicCSSProperties = () => ({
  '--app-primary': getPrimaryThemeColor(),
  '--app-secondary': getSecondaryThemeColor(),
  '--app-primary-hover': adjustBrightness(getPrimaryThemeColor(), -15),
  '--app-secondary-hover': adjustBrightness(getSecondaryThemeColor(), -15),
  '--app-primary-light': adjustBrightness(getPrimaryThemeColor(), 15),
  '--app-secondary-light': adjustBrightness(getSecondaryThemeColor(), 15),
});

// Apply dynamic CSS properties to the root element
export const applyDynamicCSSProperties = () => {
  const root = document.documentElement;
  const properties = getDynamicCSSProperties();
  
  Object.entries(properties).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// Initialize all dynamic styling
export const initializeDynamicTheme = () => {
  injectDynamicStyles();
  applyDynamicCSSProperties();
};

// Export individual functions for named imports
export { getPrimaryThemeColor, getSecondaryThemeColor } from './themeColorsSimple';

const dynamicColorsUtils = {
  getDynamicPrimaryStyles,
  getDynamicSecondaryStyles,
  getDynamicTailwindStyles,
  injectDynamicStyles,
  getDynamicCSSProperties,
  applyDynamicCSSProperties,
  initializeDynamicTheme,
  hexToRgb,
  adjustBrightness,
  getPrimaryThemeColor,
  getSecondaryThemeColor
};

export default dynamicColorsUtils;
