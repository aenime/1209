import { useEffect, useState, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { useParams } from "react-router-dom";
import apiService from '../../services/apiService';
import { useProduct } from "../../contexts/ProductContext";
import ProductGridTailwind from "../ProductGrid/ProductGridTailwind";
import useDynamicTitle from "../../hooks/useDynamicTitle";


// Response validation helper


const CategoryPageTailwind = () => {
    const { id } = useParams();
    const [productsArray, setProductsArray] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [isLoader, setIsLoader] = useState(true); // Start with loading to prevent flash
    const [categoryInfo, setCategoryInfo] = useState(null);
    const [error, setError] = useState(null);
    const { setCategory } = useProduct();

    // Dynamic title with category name
    const categoryTitle = categoryInfo?.name 
        ? `${categoryInfo.name} Products` 
        : id && id !== 'all' 
            ? `Category Products`
            : null;
    useDynamicTitle(categoryTitle);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const ITEMS_PER_PAGE = 10;

    // Enhanced error handling
    const handleError = (error, context) => {
        setError(error.message || `Failed to load ${context}`);
        setIsLoader(false);
        setIsLoadingMore(false);
    };

    // Reset pagination state when category changes
    const resetPagination = useCallback(() => {
        setCurrentPage(1);
        setProductsArray([]);
        setHasMore(true);
        setTotalData(0);
        setError(null);
        setIsLoader(true); // Ensure loading state is set during reset
    }, []);

    // Validate and process product data


    // Fetch category information with improved validation
    useEffect(() => {
        const fetchCategoryInfo = async () => {
            // If no id or id is 'all', set up for all products view
            if (!id || id === 'all') {
                setCategory({ name: 'All Products', description: 'Browse all available products' });
                setCategoryInfo({ name: 'All Products', description: 'Browse all available products' });
                return;
            }
            
            try {
                const result = await apiService.getCategory(id);
                if (!result || result.statusCode !== 1 || !result.data) {
                    throw new Error('Failed to fetch category');
                }
                setCategory(result.data);
                setCategoryInfo(result.data);

            } catch (error) {
                handleError(error, 'category');
                setCategory({});
                setCategoryInfo(null);
            }
        };

        fetchCategoryInfo();
    }, [id, setCategory]);

    // Fetch products with pagination
    const fetchProducts = useCallback(async (page = 1, isLoadMore = false) => {
        try {
            if (!isLoadMore) {
                setIsLoader(true);
                setError(null);
            } else {
                setIsLoadingMore(true);
            }

            
            let url = `/api/products/get?limit=${ITEMS_PER_PAGE}&page=${page}`;
            if (id && id !== 'all') {
                url += `&category=${id}`;
            }

            const result = await apiService.request(url);
            if (!result || result.statusCode !== 1 || !result.data) {
                if (!isLoadMore) {
                    setProductsArray([]);
                    setTotalData(0);
                }
                setHasMore(false);
                return;
            }
            let newProducts = [];
            let total = 0;
            if (Array.isArray(result.data)) {
                if (result.data.length > 0 && result.data[0] && !result.data[0].hasOwnProperty('products')) {
                    const isProductArray = result.data[0].hasOwnProperty('productName') || 
                                          result.data[0].hasOwnProperty('name') ||
                                          result.data[0].hasOwnProperty('title');
                    if (isProductArray) {
                        newProducts = result.data;
                        total = result.total || result.data.length;
                    }
                } else if (result.data.length > 0 && result.data[0] && result.data[0].hasOwnProperty('products')) {
                    if (id && id !== 'all') {
                        const categoryData = result.data.find(cat => cat._id === id);
                        if (categoryData && Array.isArray(categoryData.products)) {
                            newProducts = categoryData.products;
                            total = categoryData.products.length;
                            const startIndex = (page - 1) * ITEMS_PER_PAGE;
                            const endIndex = startIndex + ITEMS_PER_PAGE;
                            newProducts = categoryData.products.slice(startIndex, endIndex);
                        }
                    } else {
                        const allProducts = [];
                        result.data.forEach(cat => {
                            if (cat.products && Array.isArray(cat.products)) {
                                allProducts.push(...cat.products);
                            }
                        });
                        total = allProducts.length;
                        const startIndex = (page - 1) * ITEMS_PER_PAGE;
                        const endIndex = startIndex + ITEMS_PER_PAGE;
                        newProducts = allProducts.slice(startIndex, endIndex);
                    }
                }
            } else if (result.data.products && Array.isArray(result.data.products)) {
                total = result.data.products.length;
                const startIndex = (page - 1) * ITEMS_PER_PAGE;
                const endIndex = startIndex + ITEMS_PER_PAGE;
                newProducts = result.data.products.slice(startIndex, endIndex);
            }
            if (isLoadMore) {
                // Use DocumentFragment approach for smooth updates
                flushSync(() => {
                    setProductsArray(prevProducts => {
                        const existingIds = new Set(prevProducts.map(p => p._id));
                        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p._id));
                        
                        // Create smooth transition by preserving existing structure
                        return [...prevProducts, ...uniqueNewProducts];
                    });
                });
            } else {
                // Initial load
                flushSync(() => {
                    setProductsArray(newProducts);
                });
                setTotalData(total);
            }
            const totalLoadedProducts = isLoadMore ? productsArray.length + newProducts.length : newProducts.length;
            const calculatedHasMore = totalLoadedProducts < total;
            setHasMore(calculatedHasMore);
        } catch (error) {
            handleError(error, 'products');
            if (!isLoadMore) {
                setProductsArray([]);
                setTotalData(0);
            }
            setHasMore(false);
        } finally {
            // Use requestAnimationFrame to ensure smooth DOM updates
            requestAnimationFrame(() => {
                setIsLoader(false);
                setIsLoadingMore(false);
            });
        }
    }, [id, ITEMS_PER_PAGE]);

    // Load more products function with stable rendering
    const loadMoreProducts = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchProducts(nextPage, true);
        }
    }, [currentPage, isLoadingMore, hasMore, fetchProducts]);

    // Reset and load initial products when category changes
    useEffect(() => {
        resetPagination();
        fetchProducts(1, false);
    }, [id, fetchProducts, resetPagination]);

    // Optimized infinite scroll with requestAnimationFrame
    useEffect(() => {
        let rafId = null;
        let isScrolling = false;
        
        const handleScroll = () => {
            if (isScrolling) return;
            isScrolling = true;
            
            if (rafId) cancelAnimationFrame(rafId);
            
            rafId = requestAnimationFrame(() => {
                // Only check if we should load more, don't make visual changes
                if (isLoadingMore || !hasMore) {
                    isScrolling = false;
                    return;
                }
                
                const scrollPosition = window.innerHeight + window.scrollY;
                const documentHeight = document.documentElement.offsetHeight;
                const triggerPoint = documentHeight - 800; // Load before end
                
                if (scrollPosition >= triggerPoint) {
                    loadMoreProducts();
                }
                
                isScrolling = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isLoadingMore, hasMore, loadMoreProducts]);

    // Memoized filtering of valid products for performance optimization
    const filteredProducts = useMemo(() => {
        if (!productsArray || productsArray.length === 0) return [];
        
        return productsArray.filter(product => {
            // Filter out invalid products
            return product && 
                   product.title && 
                   (product.price || product.discount) &&
                   product._id;
        });
    }, [productsArray]);



    // Render loading state
    if (isLoader) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1 minimal-container">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="animate-pulse bg-white p-4 rounded-lg shadow">
                                <div className="bg-gray-300 h-48 rounded-md mb-4"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-1">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-1 minimal-container">
                {/* Category Header */}
                {categoryInfo && (
                    <div className="mb-6 px-2 pt-4">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {categoryInfo.name}
                            {totalData > 0 && (
                                <span className="ml-2 text-lg font-normal text-gray-600">
                                    ({productsArray.length} of {totalData} products)
                                </span>
                            )}
                        </h1>
                        {categoryInfo.description && (
                            <p className="text-gray-600">{categoryInfo.description}</p>
                        )}
                    </div>
                )}

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <>
                        <div 
                            id="products-grid"
                            className="mb-8 transition-none category-grid"
                        >
                            <ProductGridTailwind 
                                products={filteredProducts}
                                columns={4} 
                                category={categoryInfo}
                                fitMode="contain"
                                className="product-grid-stable transition-none"
                                isLoadingMore={isLoadingMore}
                                loading={isLoader}
                            />
                        </div>                        {/* Non-intrusive loading indicator */}
                        {isLoadingMore && (
                            <div className="loading-indicator fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
                                <div className="bg-gray-900 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-2">
                                    <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Loading more...</span>
                                </div>
                            </div>
                        )}

                        {/* Scroll Progress Indicator (optional) */}
                        {hasMore && !isLoadingMore && productsArray.length > 0 && (
                            <div className="text-center mt-6 py-4">
                                <div className="inline-flex items-center text-gray-500 text-sm">
                                    <svg className="w-4 h-4 mr-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                    More products will load automatically as you scroll
                                </div>
                            </div>
                        )}

                        {/* End of Products Message */}
                        {!hasMore && productsArray.length > ITEMS_PER_PAGE && (
                            <div className="text-center mt-8 py-6">
                                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-600 font-medium">
                                        You've seen all {productsArray.length} products
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mt-2">
                                    Thanks for browsing! Check back later for new products.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12 px-2">
                        <h2 className="text-2xl font-semibold text-gray-600">
                            {(!id || id === 'all') 
                                ? 'No products available' 
                                : 'No products found in this category'
                            }
                        </h2>
                        {(!id || id === 'all') ? (
                            <p className="text-gray-500 mt-2">
                                Please check back later for new products.
                            </p>
                        ) : (
                            <p className="text-gray-500 mt-2">
                                Try browsing other categories or check back later.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPageTailwind;