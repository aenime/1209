// services/advancedApiService.js
/**
 * Advanced API Service with sophisticated caching strategies
 * Features:
 * - Multi-tier caching (memory + localStorage)
 * - TTL-based cache strategies per endpoint type
 * - Cache invalidation and refresh
 * - Request deduplication
 * - Cache statistics and monitoring
 * - Background cache warming
 * - Offline support preparation
 */

// Global error handler for cache operations
const handleCacheError = (operation, error, instance) => {
  console.warn(`Cache ${operation} failed:`, error);
  
  // If it's a critical error, reset the cache system
  if (error.message && (
    error.message.includes('ttl') ||
    error.message.includes('strategy') ||
    error.message.includes('undefined')
  )) {
    console.warn('Critical cache error detected, performing emergency reset');
    if (instance && typeof instance.emergencyReset === 'function') {
      instance.emergencyReset();
    }
  }
};

class AdvancedApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || '';
    
    // Multi-tier cache system
    this.memoryCache = new Map();           // Fast in-memory cache
    this.persistentCache = new Map();       // LocalStorage-backed cache
    this.pendingRequests = new Map();       // Request deduplication
    
    // Cache strategies with different TTL per endpoint type
    this.cacheStrategies = {
      products: { 
        ttl: 300000,        // 5 minutes
        persistent: true,    // Save to localStorage
        priority: 'high',    // High priority for retention
        maxSize: 1000       // Max items in cache
      },
      categories: { 
        ttl: 600000,        // 10 minutes
        persistent: true, 
        priority: 'high',
        maxSize: 100
      },
      user: { 
        ttl: 60000,         // 1 minute
        persistent: false,   // Memory only
        priority: 'medium',
        maxSize: 50
      },
      cart: { 
        ttl: 180000,        // 3 minutes
        persistent: true,
        priority: 'high',
        maxSize: 10
      },
      search: { 
        ttl: 120000,        // 2 minutes
        persistent: false,
        priority: 'low',
        maxSize: 200
      },
      static: { 
        ttl: 3600000,       // 1 hour
        persistent: true,
        priority: 'high',
        maxSize: 50
      },
      default: { 
        ttl: 300000,        // 5 minutes default
        persistent: false,
        priority: 'low',
        maxSize: 100
      }
    };

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      requests: 0,
      cacheSize: 0,
      lastCleanup: Date.now()
    };

    // Initialize persistent cache from localStorage
    this.initializePersistentCache();
    
    // Set up periodic cleanup
    this.setupCacheCleanup();
    
    // Clear any corrupted cache data on startup
    this.validateAndCleanCaches();
  }

  /**
   * Validate and clean corrupted cache entries on startup
   */
  validateAndCleanCaches() {
    try {
      let removed = 0;
      
      // Validate memory cache
      for (const [key, entry] of Array.from(this.memoryCache.entries())) {
        if (!this.isValidCacheEntry(entry)) {
          this.memoryCache.delete(key);
          removed++;
        }
      }
      
      // Validate persistent cache
      for (const [key, entry] of Array.from(this.persistentCache.entries())) {
        if (!this.isValidCacheEntry(entry)) {
          this.persistentCache.delete(key);
          removed++;
        }
      }
      
      if (removed > 0) {
        this.savePersistentCache();
        console.log(`🔧 Removed ${removed} corrupted cache entries on startup`);
      }
    } catch (error) {
      console.warn('Cache validation failed, clearing all caches:', error);
      this.clearAllCaches();
    }
  }

  /**
   * Check if a cache entry is valid
   */
  isValidCacheEntry(entry) {
    return (
      entry &&
      typeof entry === 'object' &&
      entry.data !== undefined &&
      entry.timestamp &&
      typeof entry.timestamp === 'number' &&
      entry.strategy &&
      typeof entry.strategy === 'string' &&
      this.cacheStrategies[entry.strategy]
    );
  }

  /**
   * Initialize persistent cache from localStorage
   */
  initializePersistentCache() {
    try {
      const persistentData = localStorage.getItem('apiCache');
      if (persistentData) {
        const parsed = JSON.parse(persistentData);
        
        // Validate the parsed data structure
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, value]) => {
            // Validate cache entry structure
            if (value && 
                typeof value === 'object' && 
                value.data !== undefined && 
                value.timestamp && 
                value.strategy &&
                typeof value.timestamp === 'number') {
              this.persistentCache.set(key, value);
            }
          });
          console.log(`🔄 Restored ${this.persistentCache.size} cached items from storage`);
        }
      }
    } catch (error) {
      console.warn('Failed to restore cache from localStorage:', error);
      // Clear corrupted cache data
      localStorage.removeItem('apiCache');
    }
  }

  /**
   * Save persistent cache to localStorage
   */
  savePersistentCache() {
    try {
      const persistentData = {};
      this.persistentCache.forEach((value, key) => {
        persistentData[key] = value;
      });
      localStorage.setItem('apiCache', JSON.stringify(persistentData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Determine cache strategy for endpoint
   */
  getCacheStrategy(endpoint) {
    // Add safety check for endpoint
    if (!endpoint || typeof endpoint !== 'string') {
      return { ...this.cacheStrategies.default, type: 'default' };
    }
    
    for (const [key, strategy] of Object.entries(this.cacheStrategies)) {
      if (key !== 'default' && endpoint.includes(key)) {
        return { ...strategy, type: key };
      }
    }
    
    // Always return default strategy as fallback
    return { ...this.cacheStrategies.default, type: 'default' };
  }

  /**
   * Generate cache key with strategy-aware hashing
   */
  generateCacheKey(endpoint, options = {}) {
    const { body, headers, ...otherOptions } = options;
    const keyData = {
      endpoint,
      method: options.method || 'GET',
      body: body ? JSON.stringify(body) : null,
      query: otherOptions
    };
    return `${btoa(JSON.stringify(keyData)).slice(0, 32)}-${endpoint.split('/').pop()}`;
  }

  /**
   * Get cached data with strategy awareness
   */
  getCachedData(cacheKey, strategy) {
    this.stats.requests++;

    // Check memory cache first
    if (this.memoryCache.has(cacheKey)) {
      const cached = this.memoryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < strategy.ttl) {
        this.stats.hits++;
        cached.lastAccessed = Date.now();
        return cached.data;
      } else {
        this.memoryCache.delete(cacheKey);
      }
    }

    // Check persistent cache if strategy allows
    if (strategy.persistent && this.persistentCache.has(cacheKey)) {
      const cached = this.persistentCache.get(cacheKey);
      if (Date.now() - cached.timestamp < strategy.ttl) {
        this.stats.hits++;
        cached.lastAccessed = Date.now();
        // Promote to memory cache
        this.memoryCache.set(cacheKey, cached);
        return cached.data;
      } else {
        this.persistentCache.delete(cacheKey);
      }
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set cached data with strategy awareness
   */
  setCachedData(cacheKey, data, strategy) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      strategy: strategy.type,
      size: JSON.stringify(data).length
    };

    // Always cache in memory
    this.memoryCache.set(cacheKey, cacheEntry);

    // Cache persistently if strategy allows
    if (strategy.persistent) {
      this.persistentCache.set(cacheKey, cacheEntry);
      this.savePersistentCache();
    }

    // Enforce cache size limits
    this.enforceCacheLimits(strategy);
  }

  /**
   * Enforce cache size limits per strategy
   */
  enforceCacheLimits(strategy) {
    // Add safety check for strategy
    if (!strategy || !strategy.type || !strategy.maxSize) {
      return;
    }
    
    const memoryEntries = Array.from(this.memoryCache.entries())
      .filter(([key, entry]) => entry && entry.strategy === strategy.type)
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    if (memoryEntries.length > strategy.maxSize) {
      const toRemove = memoryEntries.slice(0, memoryEntries.length - strategy.maxSize);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }

    if (strategy.persistent) {
      const persistentEntries = Array.from(this.persistentCache.entries())
        .filter(([key, entry]) => entry && entry.strategy === strategy.type)
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      if (persistentEntries.length > strategy.maxSize) {
        const toRemove = persistentEntries.slice(0, persistentEntries.length - strategy.maxSize);
        toRemove.forEach(([key]) => this.persistentCache.delete(key));
        this.savePersistentCache();
      }
    }
  }

  /**
   * Main request method with advanced caching
   */
  async request(endpoint, options = {}) {
    const strategy = this.getCacheStrategy(endpoint);
    const cacheKey = this.generateCacheKey(endpoint, options);
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey, strategy);
    if (cachedData) {
      return cachedData;
    }

    // Check for pending request (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Make new request
    const requestPromise = this.makeRequest(endpoint, options);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      this.setCachedData(cacheKey, result, strategy);
      return result;
    } catch (error) {
      // On error, try to return stale cache if available
      const staleData = this.getStaleData(cacheKey);
      if (staleData) {
        console.warn(`🔄 Returning stale data for ${endpoint}:`, error);
        return staleData;
      }
      throw error;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Get stale data as fallback
   */
  getStaleData(cacheKey) {
    const memoryEntry = this.memoryCache.get(cacheKey);
    if (memoryEntry) return memoryEntry.data;
    
    const persistentEntry = this.persistentCache.get(cacheKey);
    if (persistentEntry) return persistentEntry.data;
    
    return null;
  }

  /**
   * Make HTTP request with enhanced error handling
   */
  async makeRequest(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: options.credentials || 'include', // Ensure cookies are included
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  /**
   * Preload critical data
   */
  async preloadCriticalData() {
    const criticalEndpoints = [
      '/api/products/get',
      '/api/category/get'
    ];

    console.log('🚀 Preloading critical data...');
    
    const preloadPromises = criticalEndpoints.map(endpoint => 
      this.request(endpoint).catch(error => 
        console.warn(`Failed to preload ${endpoint}:`, error)
      )
    );

    await Promise.allSettled(preloadPromises);
    console.log('✅ Critical data preloading complete');
  }

  /**
   * Invalidate cache by pattern
   */
  invalidateCache(pattern) {
    const regex = new RegExp(pattern);
    let removed = 0;

    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    // Clear from persistent cache
    for (const key of this.persistentCache.keys()) {
      if (regex.test(key)) {
        this.persistentCache.delete(key);
        removed++;
      }
    }

    this.savePersistentCache();
    console.log(`🗑️ Invalidated ${removed} cache entries matching: ${pattern}`);
  }

  /**
   * Refresh specific endpoint
   */
  async refreshCache(endpoint, options = {}) {
    const cacheKey = this.generateCacheKey(endpoint, options);
    
    // Remove from cache
    this.memoryCache.delete(cacheKey);
    this.persistentCache.delete(cacheKey);
    
    // Fetch fresh data
    return this.request(endpoint, options);
  }

  /**
   * Setup periodic cache cleanup
   */
  setupCacheCleanup() {
    // Add error handling to prevent cleanup from breaking the app
    setInterval(() => {
      try {
        this.cleanupExpiredCache();
      } catch (error) {
        handleCacheError('cleanup', error, this);
      }
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache() {
    try {
      const now = Date.now();
      let removed = 0;

      // Clean memory cache with enhanced error handling
      for (const [key, entry] of Array.from(this.memoryCache.entries())) {
        try {
          // Add safety checks for entry structure
          if (!entry || typeof entry !== 'object') {
            this.memoryCache.delete(key);
            removed++;
            continue;
          }

          if (!entry.strategy || !entry.timestamp || typeof entry.timestamp !== 'number') {
            this.memoryCache.delete(key);
            removed++;
            continue;
          }
          
          const strategy = this.cacheStrategies[entry.strategy];
          if (!strategy) {
            // Use default strategy if entry strategy is invalid
            if (this.cacheStrategies.default && this.cacheStrategies.default.ttl) {
              if (now - entry.timestamp > this.cacheStrategies.default.ttl) {
                this.memoryCache.delete(key);
                removed++;
              }
            } else {
              // If no default strategy, remove the entry
              this.memoryCache.delete(key);
              removed++;
            }
            continue;
          }

          if (!strategy.ttl || typeof strategy.ttl !== 'number') {
            // Invalid strategy, remove entry
            this.memoryCache.delete(key);
            removed++;
            continue;
          }
          
          if (now - entry.timestamp > strategy.ttl) {
            this.memoryCache.delete(key);
            removed++;
          }
        } catch (entryError) {
          // If any error with this entry, remove it
          this.memoryCache.delete(key);
          removed++;
        }
      }

      // Clean persistent cache with enhanced error handling
      for (const [key, entry] of Array.from(this.persistentCache.entries())) {
        try {
          // Add safety checks for entry structure
          if (!entry || typeof entry !== 'object') {
            this.persistentCache.delete(key);
            removed++;
            continue;
          }

          if (!entry.strategy || !entry.timestamp || typeof entry.timestamp !== 'number') {
            this.persistentCache.delete(key);
            removed++;
            continue;
          }
          
          const strategy = this.cacheStrategies[entry.strategy];
          if (!strategy) {
            // Use default strategy if entry strategy is invalid
            if (this.cacheStrategies.default && this.cacheStrategies.default.ttl) {
              if (now - entry.timestamp > this.cacheStrategies.default.ttl) {
                this.persistentCache.delete(key);
                removed++;
              }
            } else {
              // If no default strategy, remove the entry
              this.persistentCache.delete(key);
              removed++;
            }
            continue;
          }

          if (!strategy.ttl || typeof strategy.ttl !== 'number') {
            // Invalid strategy, remove entry
            this.persistentCache.delete(key);
            removed++;
            continue;
          }
          
          if (now - entry.timestamp > strategy.ttl) {
            this.persistentCache.delete(key);
            removed++;
          }
        } catch (entryError) {
          // If any error with this entry, remove it
          this.persistentCache.delete(key);
          removed++;
        }
      }

      if (removed > 0) {
        this.savePersistentCache();
        console.log(`🧹 Cleaned up ${removed} expired cache entries`);
      }

      this.stats.lastCleanup = now;
    } catch (error) {
      console.warn('Cache cleanup encountered an error:', error);
      // If cleanup completely fails, clear all caches to prevent further errors
      this.clearAllCaches();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.requests > 0 ? (this.stats.hits / this.stats.requests * 100).toFixed(2) + '%' : '0%',
      memoryCacheSize: this.memoryCache.size,
      persistentCacheSize: this.persistentCache.size,
      strategies: Object.keys(this.cacheStrategies)
    };
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    try {
      this.memoryCache.clear();
      this.persistentCache.clear();
      localStorage.removeItem('apiCache');
      this.stats = { hits: 0, misses: 0, requests: 0, cacheSize: 0, lastCleanup: Date.now() };
      console.log('🗑️ All caches cleared');
    } catch (error) {
      console.warn('Error clearing caches:', error);
      // Force clear localStorage even if other operations fail
      try {
        localStorage.removeItem('apiCache');
      } catch (storageError) {
        console.warn('Could not clear localStorage:', storageError);
      }
    }
  }

  /**
   * Emergency cache reset - use when cache system is corrupted
   */
  emergencyReset() {
    try {
      // Force clear everything
      this.memoryCache = new Map();
      this.persistentCache = new Map();
      this.pendingRequests = new Map();
      
      // Clear localStorage
      localStorage.removeItem('apiCache');
      
      // Reset stats
      this.stats = { hits: 0, misses: 0, requests: 0, cacheSize: 0, lastCleanup: Date.now() };
      
      console.log('🚨 Emergency cache reset completed');
    } catch (error) {
      console.error('Emergency reset failed:', error);
    }
  }

  // Enhanced API methods with caching strategies
  async getProducts() { return this.request('/api/products/get'); }
  async getProduct(id) { return this.request(`/api/products/single/${id}`); }
  async getCategory(id) { return this.request(`/api/category/${id}`); }
  async getCategories() { return this.request('/api/category/get'); }
  async searchProducts(query) { return this.request(`/api/products/search?q=${encodeURIComponent(query)}`); }
  async getUserData() { return this.request('/api/user/profile'); }
  async getCart() { return this.request('/api/cart/get'); }
}

// Create enhanced service instance
const advancedApiService = new AdvancedApiService();

// Auto-preload critical data in production
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    advancedApiService.preloadCriticalData();
  });
}

export default advancedApiService;
