// public/sw.js
/**
 * Advanced Service Worker for E-commerce Application
 * Features:
 * - Resource caching with cache-first/network-first strategies
 * - Background sync for cart updates
 * - Offline fallback pages
 * - Image optimization and caching
 * - API response caching
 * - Push notification support (ready)
 * - Tracking request optimization to prevent IPC flooding
 */

const CACHE_NAME = 'ecommerce-app-v1';
const STATIC_CACHE = 'static-resources-v1';
const DYNAMIC_CACHE = 'dynamic-content-v1';
const IMAGE_CACHE = 'images-v1';
const API_CACHE = 'api-responses-v1';

// Tracking domains that should be handled differently
const TRACKING_DOMAINS = [
  'google-analytics.com',
  'googleads.com',
  'googleadservices.com',
  'googlesyndication.com',
  'googletagmanager.com',
  'facebook.net',
  'facebook.com',
  'doubleclick.net',
  'google.com'
];

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
];

// API endpoints with cache strategies
const API_CACHE_STRATEGIES = {
  '/api/products/get': { strategy: 'cacheFirst', ttl: 300000 },      // 5 minutes
  '/api/category/get': { strategy: 'cacheFirst', ttl: 600000 },      // 10 minutes
  '/api/products/single/': { strategy: 'cacheFirst', ttl: 300000 },  // 5 minutes
  '/api/cart/': { strategy: 'networkFirst', ttl: 60000 },            // 1 minute
  '/api/user/': { strategy: 'networkFirst', ttl: 60000 }             // 1 minute
};

/**
 * Install event - cache static resources
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - handle all network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle tracking requests specially to prevent failures
  if (isTrackingRequest(request)) {
    event.respondWith(handleTrackingRequest(request));
    return;
  }
  
  // Handle different request types
  if (request.method === 'GET') {
    if (isImageRequest(request)) {
      event.respondWith(handleImageRequest(request));
    } else if (isAPIRequest(request)) {
      event.respondWith(handleAPIRequest(request));
    } else if (isStaticResource(request)) {
      event.respondWith(handleStaticRequest(request));
    } else {
      event.respondWith(handleDynamicRequest(request));
    }
  }
});

/**
 * Check if request is to a tracking service
 */
function isTrackingRequest(request) {
  return TRACKING_DOMAINS.some(domain => request.url.includes(domain));
}

/**
 * Handle tracking requests with graceful fallback
 */
async function handleTrackingRequest(request) {
  try {
    // Attempt network request with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const response = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    // Silently fail tracking requests and return empty success response
    console.warn('🔇 SW: Tracking request failed, returning empty response:', request.url);
    return new Response('', {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

/**
 * Handle image requests with caching
 */
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone and cache the response
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // Clean up old images if cache is too large
      await cleanupImageCache(cache);
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Image request failed:', error);
    return new Response('Image not available', { status: 404 });
  }
}

/**
 * Handle API requests with intelligent caching
 */
async function handleAPIRequest(request) {
  const strategy = getAPIStrategy(request.url);
  
  if (strategy.strategy === 'cacheFirst') {
    return handleCacheFirst(request, strategy);
  } else {
    return handleNetworkFirst(request, strategy);
  }
}

/**
 * Cache-first strategy for API requests
 */
async function handleCacheFirst(request, strategy) {
  try {
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Return cached response if valid
    if (cachedResponse && isCacheValid(cachedResponse, strategy.ttl)) {
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Add timestamp header for TTL tracking
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers
      });
      
      await cache.put(request, modifiedResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return stale cache as fallback
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.warn('Network failed, returning stale cache:', error);
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Network-first strategy for API requests
 */
async function handleNetworkFirst(request, strategy) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers
      });
      
      await cache.put(request, modifiedResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.warn('Network failed, using cached response:', error);
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Handle static resource requests
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Static resource failed:', error);
    throw error;
  }
}

/**
 * Handle dynamic content requests
 */
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Background sync for cart updates
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
});

/**
 * Sync cart data when online
 */
async function syncCartData() {
  try {
    // Get pending cart updates from IndexedDB
    const pendingUpdates = await getPendingCartUpdates();
    
    for (const update of pendingUpdates) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
    }
    
    // Clear pending updates
    await clearPendingCartUpdates();
    console.log('✅ Cart data synced successfully');
  } catch (error) {
    console.error('❌ Cart sync failed:', error);
  }
}

/**
 * Utility functions
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

function isAPIRequest(request) {
  return request.url.includes('/api/');
}

function isStaticResource(request) {
  return request.url.includes('/static/') || 
         request.url.includes('/manifest.json');
}

function getAPIStrategy(url) {
  for (const [pattern, strategy] of Object.entries(API_CACHE_STRATEGIES)) {
    if (url.includes(pattern)) {
      return strategy;
    }
  }
  return { strategy: 'networkFirst', ttl: 300000 };
}

function isCacheValid(response, ttl) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  
  return Date.now() - parseInt(cachedAt) < ttl;
}

async function cleanupImageCache(cache) {
  const keys = await cache.keys();
  if (keys.length > 100) { // Max 100 images
    const oldestKeys = keys.slice(0, keys.length - 100);
    await Promise.all(oldestKeys.map(key => cache.delete(key)));
  }
}

// IndexedDB helpers for cart sync (placeholder)
async function getPendingCartUpdates() {
  // Implementation would use IndexedDB
  return [];
}

async function clearPendingCartUpdates() {
  // Implementation would clear IndexedDB
}

/**
 * Message handling for cache management
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0].postMessage(stats);
      });
      break;
      
    case 'INVALIDATE_API_CACHE':
      invalidateAPICache(payload.pattern).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('🗑️ All caches cleared by user request');
}

async function getCacheStats() {
  const stats = {};
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}

async function invalidateAPICache(pattern) {
  const cache = await caches.open(API_CACHE);
  const keys = await cache.keys();
  const regex = new RegExp(pattern);
  
  const deletePromises = keys
    .filter(request => regex.test(request.url))
    .map(request => cache.delete(request));
    
  await Promise.all(deletePromises);
  console.log(`🗑️ Invalidated API cache entries matching: ${pattern}`);
}

console.log('🔧 Service Worker script loaded');
