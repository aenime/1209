/**
 * React hooks and context imports
 */
import { createContext, useContext, useState, useEffect } from "react";

/**
 * Authentication Context for global auth state management
 */
const AuthContextProvide = createContext();

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value with auth methods and state
 */
const useAuth = () => useContext(AuthContextProvide);

/**
 * Authentication Context Provider Component
 * 
 * Manages global authentication state including:
 * - User authentication status
 * - User profile data
 * - Login/logout functionality
 * - Session persistence in localStorage
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to wrap
 */
const AuthContext = ({ children }) => {
  /**
   * Authentication state variables
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  /**
   * Login function to authenticate user
   * 
   * @param {Object} userData - User profile data from authentication
   */
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  /**
   * Logout function to clear authentication state
   * Removes all auth data from state and localStorage
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  };

  /**
   * Check for existing authentication session on component mount
   * Restores auth state from localStorage if valid session exists
   */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedAuth = localStorage.getItem("isAuthenticated");
    
    if (savedUser && savedAuth === "true") {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        logout();
      }
    }
  }, []);

  /**
   * Authentication Context Provider
   * 
   * Wraps children in a container with max-width constraint
   * and provides auth context to all child components
   */
  return (
    <AuthContextProvide.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      <div className="p-0 mx-auto max-w-container">
        {children}
      </div>
    </AuthContextProvide.Provider>
  );
};

export { useAuth, AuthContext };
