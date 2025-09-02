/**
 * Simplified theme color utilities
 * This replaces the complex theme utilities with a simpler implementation
 */

import envConfig from './envConfig';

// Dynamic color getters using environment variables
export const getPrimaryThemeColor = () => envConfig.get('REACT_APP_KEY_COLOR') || '#ffffffff';
export const getSecondaryThemeColor = () => envConfig.get('REACT_APP_S_COLOR') || '#ffffffff';

// Legacy compatibility functions
export const getButtonColor = () => getPrimaryThemeColor();
export const getNavColor = () => getPrimaryThemeColor();
export const getSubtitleColor = () => getSecondaryThemeColor();
export const getAddressButtonColor = () => envConfig.get('REACT_APP_ADDRESS_BUTTON_COLOR') || getPrimaryThemeColor();

// Style generators
export const getButtonStyles = (isClicked = false) => ({
  backgroundColor: isClicked ? '#10b981' : getPrimaryThemeColor(), // green-500 when clicked, otherwise environment color
  color: '#ffffff',
  hoverBg: isClicked ? '#059669' : adjustBrightness(getPrimaryThemeColor(), -15), // green-600 when clicked
});

export const getNavStyles = () => ({
  backgroundColor: getPrimaryThemeColor(),
  color: '#ffffff',
  hoverBg: adjustBrightness(getPrimaryThemeColor(), -15),
});

export const getSubtitleStyles = () => ({
  color: getSecondaryThemeColor(),
  hoverColor: adjustBrightness(getSecondaryThemeColor(), -15),
});

// Helper function to adjust color brightness
export const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// Track initialization state
let isInitialized = false;

// Default function for theme initialization (no-op)
export const initializeColorSystem = () => {
  if (isInitialized) return;
  
  // Theme system initialized - no console output needed in production
  isInitialized = true;
};

// Default export
const themeUtils = {
  getPrimaryThemeColor,
  getSecondaryThemeColor,
  getButtonColor,
  getNavColor,
  getSubtitleColor,
  getAddressButtonColor,
  getButtonStyles,
  getNavStyles,
  getSubtitleStyles,
  adjustBrightness,
  initializeColorSystem
};

export default themeUtils;
