/**
 * React core imports
 */
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

/**
 * Application routing and navigation
 */
import OptimizedRouter from "./Router/OptimizedRouter";

/**
 * Navigation throttle protection (fix for Facebook Pixel IPC flooding)
 */
import NavigationThrottleProtection from "./utils/navigationThrottleProtection";
import NavigationErrorBoundary from "./components/NavigationErrorBoundary";

/**
 * Global state management contexts for the entire application
 */
import { CartContext } from "./contexts/CartContext";
import { ProductContext } from "./contexts/ProductContext";
import { WishlistContext } from "./contexts/WishlistContext";
import { UIContext } from "./contexts/UIContext";
import { OfferProvider } from "./contexts/OfferContext";
import { AuthContext } from "./contexts/AuthContext";

/**
 * Theme and styling utilities
 */
import { initializeColorSystem } from "./utils/themeColorsSimple";
import { initializeDynamicTheme } from "./utils/dynamicColors";

/**
 * Analytics and tracking utilities
 */
import trackingManager from "./utils/trackingManager";

/**
 * Data validation and environment configuration utilities
 */
import { cleanNaNAmounts } from "./utils/priceHelper";
import logManager from "./utils/logManager";
import envConfig from "./utils/envConfig";
import networkMonitor from "./utils/networkMonitor";

/**
 * Error suppression for tracking scripts to keep console clean
 */
import "./utils/trackingErrorSuppressor";

/**
 * Main App Component
 * 
 * This is the root component of the e-commerce application that:
 * - Initializes all global contexts for state management
 * - Sets up environment configuration and tracking
 * - Configures theme and color systems
 * - Provides clean error handling for the entire app
 * 
 * Context hierarchy (outer to inner):
 * OfferProvider -> AuthContext -> UIContext -> ProductContext -> WishlistContext -> CartContext
 */
function App() {
    /**
     * App Initialization Effect
     * 
     * Runs once when the component mounts to set up:
     * 1. Network monitoring for connectivity tracking
     * 2. Data validation and cleanup
     * 3. Environment configuration loading
     * 4. Theme and color system initialization
     * 5. Analytics and tracking setup
     */
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Step 1: Initialize network monitoring for connection tracking
                networkMonitor.init();
                
                // Step 2: Clean any invalid price values from localStorage
                cleanNaNAmounts(['totalPrice', 'cartTotalPrice']);
                
                // Step 3: Initialize environment configuration asynchronously
                envConfig.init().then(() => {
                    // Step 4: Initialize theme systems after config is loaded
                    initializeColorSystem();
                    initializeDynamicTheme();
                    
                    // Step 5: Initialize navigation throttle protection (BEFORE analytics)
                    NavigationThrottleProtection.apply();
                    
                    // Step 6: Initialize analytics tracking after all config is ready
                    trackingManager.initialize().then(() => {
                        // Step 7: Verify tracking scripts are loaded (delayed check)
                        setTimeout(() => {
                            networkMonitor.checkTrackingScripts();
                        }, 2000);
                        
                    }).catch(error => {
                        // Tracking initialization failed but app continues
                        logManager.error('tracking-init-failed', 'Tracking initialization failed:', error);
                    });
                }).catch(error => {
                    // Environment config failed, use fallback initialization
                    logManager.error('env-config-failed', 'Environment config failed, using fallbacks:', error);
                    initializeColorSystem();
                    initializeDynamicTheme();
                });
                
            } catch (error) {
                // Critical initialization error, log and continue with minimal setup
                logManager.error('app-init-failed', '❌ App initialization failed:', error);
                initializeColorSystem();
                initializeDynamicTheme();
            }
        };
        
        // Run initialization in background without blocking render
        initializeApp();
    }, []);

    /**
     * App Component JSX Structure
     * 
     * The component tree is wrapped in HelmetProvider for SEO management
     * and structured with nested context providers for global state.
     * 
     * The context nesting order is important:
     * - OfferProvider: Handles offer eligibility and pricing rules
     * - AuthContext: Manages user authentication state
     * - UIContext: Controls UI state like modals, loading states
     * - ProductContext: Manages product data and categories
     * - WishlistContext: Handles wishlist functionality
     * - CartContext: Manages shopping cart state and calculations
     */
    return (
        <HelmetProvider>
            <NavigationErrorBoundary>
                <div className="App w-full max-w-none">
                    <OfferProvider>
                        <AuthContext>
                            <UIContext>
                                <ProductContext>
                                    <WishlistContext>
                                        <CartContext>
                                            <OptimizedRouter />
                                        </CartContext>
                                    </WishlistContext>
                                </ProductContext>
                            </UIContext>
                        </AuthContext>
                    </OfferProvider>
                </div>
            </NavigationErrorBoundary>
        </HelmetProvider>
    );
}

export default App;
