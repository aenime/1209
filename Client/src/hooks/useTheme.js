import { useEffect, useState, useCallback } from 'react';
import { 
  getCurrentTheme, 
  updateThemeColor, 
  initializeColorSystem,
  getPrimaryThemeColor,
  getAppColorPalette
} from '../utils/themeUtils';

// Custom React hook for theme management
export const useTheme = () => {
  const [theme, setTheme] = useState(getCurrentTheme());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the color system on component mount
  useEffect(() => {
    initializeColorSystem();
    setTheme(getCurrentTheme());
    setIsInitialized(true);
  }, []);

  // Listen for theme color changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      setTheme(getCurrentTheme());
    };

    window.addEventListener('themeColorChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeColorChanged', handleThemeChange);
    };
  }, []);

  // Function to change theme color
  const changeThemeColor = useCallback((newColor) => {
    const newPalette = updateThemeColor(newColor);
    setTheme(getCurrentTheme());
    return newPalette;
  }, []);

  // Function to get current primary color
  const getPrimaryColor = useCallback(() => {
    return getPrimaryThemeColor();
  }, []);

  // Function to get current palette
  const getPalette = useCallback(() => {
    return getAppColorPalette();
  }, []);

  return {
    theme,
    isInitialized,
    changeThemeColor,
    getPrimaryColor,
    getPalette,
    primaryColor: theme.primaryColor,
    palette: theme.palette,
    schemeInfo: theme.schemeInfo,
    accessibility: theme.accessibility,
    isDarkMode: theme.isDarkMode
  };
};

export default useTheme;
