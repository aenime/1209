import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LocationContext = createContext();

export const useAppLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useAppLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [previousPath, setPreviousPath] = useState(null);

  useEffect(() => {
    setPreviousPath(currentPath);
    setCurrentPath(location.pathname);
  }, [location.pathname, currentPath]);

  const value = {
    currentPath,
    previousPath,
    location,
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
