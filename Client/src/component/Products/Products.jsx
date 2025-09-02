import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're in admin context
  const isAdminContext = location.pathname.startsWith('/myadmin');
  
  // State management
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Form states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Form data
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    images: [''],
    isActive: true
  });
  
  const [categoryForm, setCategoryForm] = useState({
    categoryName: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch functions
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Add showAll=true parameter to get all products for management
  const result = await apiService.request('/api/products/get?showAll=true');
      
      if (result.statusCode === 1 && result.data) {
        // Handle category-wise response structure
        if (Array.isArray(result.data) && result.data.length > 0 && result.data[0].products) {
          const allProducts = result.data.flatMap(category => category.products || []);
          setProducts(allProducts);
        } 
        // Handle direct products array (when showAll=true)
        else if (Array.isArray(result.data)) {
          setProducts(result.data);
        } 
        // Handle single product object wrapped in data
        else if (result.data && typeof result.data === 'object') {
          setProducts([result.data]);
        }
        else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
  const result = await apiService.getCategories();
      
      if (result.statusCode === 1 && Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    }
  };

  // CRUD operations for products
  const addProduct = async (productData) => {
    try {
      const result = await apiService.request('/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([productData]),
      });
      if (result && result.statusCode === 1) {
        fetchProducts();
        setShowProductModal(false);
        resetProductForm();
        alert('Product added successfully!');
      } else {
        throw new Error('Failed to add product');
      }
    } catch (err) {
      alert('Error adding product: ' + err.message);
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      // Note: You'll need to add update endpoint to backend
      const result = await apiService.request(`/api/products/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (result && result.statusCode === 1) {
        fetchProducts();
        setShowProductModal(false);
        resetProductForm();
        alert('Product updated successfully!');
      } else {
        throw new Error('Failed to update product');
      }
    } catch (err) {
      alert('Error updating product: ' + err.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Note: You'll need to add delete endpoint to backend
        const result = await apiService.request(`/api/products/delete/${productId}`, {
          method: 'DELETE',
        });
        if (result && result.statusCode === 1) {
          fetchProducts();
          alert('Product deleted successfully!');
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (err) {
        alert('Error deleting product: ' + err.message);
      }
    }
  };

  // CRUD operations for categories
  const addCategory = async (categoryData) => {
    try {
      const result = await apiService.request('/api/category/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([categoryData]),
      });
      if (result && result.statusCode === 1) {
        fetchCategories();
        setShowCategoryModal(false);
        resetCategoryForm();
        alert('Category added successfully!');
      } else {
        throw new Error('Failed to add category');
      }
    } catch (err) {
      alert('Error adding category: ' + err.message);
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      // Note: You'll need to add update endpoint to backend
      const result = await apiService.request(`/api/category/update/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });
      if (result && result.statusCode === 1) {
        fetchCategories();
        setShowCategoryModal(false);
        resetCategoryForm();
        alert('Category updated successfully!');
      } else {
        throw new Error('Failed to update category');
      }
    } catch (err) {
      alert('Error updating category: ' + err.message);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        // Note: You'll need to add delete endpoint to backend
        const result = await apiService.request(`/api/category/delete/${categoryId}`, {
          method: 'DELETE',
        });
        if (result && result.statusCode === 1) {
          fetchCategories();
          alert('Category deleted successfully!');
        } else {
          throw new Error('Failed to delete category');
        }
      } catch (err) {
        alert('Error deleting category: ' + err.message);
      }
    }
  };

  // Form handlers
  const resetProductForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      images: [''],
      isActive: true
    });
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      categoryName: '',
      description: '',
      isActive: true
    });
    setEditingCategory(null);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct._id, productForm);
    } else {
      addProduct(productForm);
    }
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory._id, categoryForm);
    } else {
      addCategory(categoryForm);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      category: product.category || '',
      images: product.images || [''],
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setShowProductModal(true);
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      categoryName: category.categoryName || '',
      description: category.description || '',
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setShowCategoryModal(true);
  };

  // Bulk operations
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const bulkDeleteProducts = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        for (const productId of selectedProducts) {
          await apiService.request(`/api/products/delete/${productId}`, {
            method: 'DELETE',
          });
        }
        fetchProducts();
        setSelectedProducts([]);
        alert('Products deleted successfully!');
      } catch (err) {
        alert('Error deleting products: ' + err.message);
      }
    }
  };

  const bulkUpdateProducts = async (updateData) => {
    if (selectedProducts.length === 0) return;
    
    try {
      for (const productId of selectedProducts) {
        await apiService.request(`/api/products/update/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
      }
      fetchProducts();
      setSelectedProducts([]);
      setShowBulkEditModal(false);
      alert('Products updated successfully!');
    } catch (err) {
      alert('Error updating products: ' + err.message);
    }
  };

  // CSV Import/Export functions
  const exportToJSON = () => {
    const dataToExport = activeTab === 'products' ? filteredProducts : categories;
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === 'products' ? filteredProducts : categories;
    if (dataToExport.length === 0) return;
    
    const headers = Object.keys(dataToExport[0]).join(',');
    const csvContent = dataToExport.map(item => 
      Object.values(item).map(value => {
        if (Array.isArray(value)) {
          return `"${value.join(';')}"`;
        }
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${csvContent}`;
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csv);
    
    const exportFileDefaultName = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const item = {};
            headers.forEach((header, index) => {
              if (values[index] !== undefined) {
                // Handle array fields (like images)
                if (header === 'images' && values[index]) {
                  item[header] = values[index].split(';');
                } else if (header === 'price' || header === 'stock') {
                  item[header] = Number(values[index]) || 0;
                } else if (header === 'isActive') {
                  item[header] = values[index].toLowerCase() === 'true';
                } else {
                  item[header] = values[index];
                }
              }
            });
            data.push(item);
          }
        }

        // Import data
        if (activeTab === 'products') {
          importProducts(data);
        } else {
          importCategories(data);
        }
      } catch (err) {
        alert('Error parsing CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const importProducts = async (productsData) => {
    try {
      const result = await apiService.request('/api/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productsData),
      });
      if (result && result.statusCode === 1) {
        fetchProducts();
        setShowImportModal(false);
        alert(`${productsData.length} products imported successfully!`);
      } else {
        throw new Error('Failed to import products');
      }
    } catch (err) {
      alert('Error importing products: ' + err.message);
    }
  };

  const importCategories = async (categoriesData) => {
    try {
      const result = await apiService.request('/api/category/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriesData),
      });
      if (result && result.statusCode === 1) {
        fetchCategories();
        setShowImportModal(false);
        alert(`${categoriesData.length} categories imported successfully!`);
      } else {
        throw new Error('Failed to import categories');
      }
    } catch (err) {
      alert('Error importing categories: ' + err.message);
    }
  };

  // Filtering
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const filteredCategories = Array.isArray(categories) ? categories.filter(category => {
    return (category.categoryName || category.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
          <button 
            onClick={() => {
              fetchProducts();
              fetchCategories();
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Navigation */}
        {isAdminContext && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/myadmin')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Admin Dashboard
              </button>
              <div className="text-sm text-gray-500">
                Admin Panel / Products Management
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products & Categories Management</h1>
          <p className="text-gray-600">Full CRUD operations, bulk editing, and CSV import/export</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Categories ({categories.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search {activeTab === 'products' ? 'Products' : 'Categories'}
              </label>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter (only for products) */}
            {activeTab === 'products' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName || category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className={activeTab === 'products' ? 'md:col-span-2' : 'md:col-span-3'}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (activeTab === 'products') {
                      resetProductForm();
                      setShowProductModal(true);
                    } else {
                      resetCategoryForm();
                      setShowCategoryModal(true);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add {activeTab === 'products' ? 'Product' : 'Category'}
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Import CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Export CSV
                </button>
                {activeTab === 'products' && selectedProducts.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowBulkEditModal(true)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                    >
                      Bulk Edit ({selectedProducts.length})
                    </button>
                    <button
                      onClick={bulkDeleteProducts}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Bulk Delete ({selectedProducts.length})
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Content Table */}
        {activeTab === 'products' ? (
          <ProductsTable
            products={filteredProducts}
            categories={categories}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onSelectAll={selectAllProducts}
            onEdit={editProduct}
            onDelete={deleteProduct}
          />
        ) : (
          <CategoriesTable
            categories={filteredCategories}
            onEdit={editCategory}
            onDelete={deleteCategory}
          />
        )}

        {/* Product Modal */}
        {showProductModal && (
          <ProductModal
            isOpen={showProductModal}
            onClose={() => {
              setShowProductModal(false);
              resetProductForm();
            }}
            product={editingProduct}
            productForm={productForm}
            setProductForm={setProductForm}
            categories={categories}
            onSubmit={handleProductSubmit}
          />
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <CategoryModal
            isOpen={showCategoryModal}
            onClose={() => {
              setShowCategoryModal(false);
              resetCategoryForm();
            }}
            category={editingCategory}
            categoryForm={categoryForm}
            setCategoryForm={setCategoryForm}
            onSubmit={handleCategorySubmit}
          />
        )}

        {/* Bulk Edit Modal */}
        {showBulkEditModal && (
          <BulkEditModal
            isOpen={showBulkEditModal}
            onClose={() => setShowBulkEditModal(false)}
            selectedCount={selectedProducts.length}
            categories={categories}
            onSubmit={bulkUpdateProducts}
          />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            activeTab={activeTab}
            onFileSelect={handleCSVImport}
          />
        )}
      </div>
    </div>
  );
};

// Sub-components
const ProductsTable = ({ products, categories, selectedProducts, onSelectProduct, onSelectAll, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-900">Products ({products.length})</h2>
      {products.length > 0 && (
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedProducts.length === products.length}
            onChange={onSelectAll}
            className="mr-2"
          />
          Select All
        </label>
      )}
    </div>
    
    {products.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <tr key={product._id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => onSelectProduct(product._id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.images && product.images[0] && (
                      <img
                        className="h-10 w-10 rounded-full object-cover mr-4"
                        src={product.images[0]}
                        alt={product.title}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {product.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {categories.find(cat => cat._id === product.category)?.categoryName || categories.find(cat => cat._id === product.category)?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{product.price || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const CategoriesTable = ({ categories, onEdit, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Categories ({categories.length})</h2>
    </div>
    
    {categories.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-gray-500">No categories found.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category, index) => (
              <tr key={category._id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {category.categoryName || category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.description || 'No description'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(category)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(category._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const ProductModal = ({ isOpen, onClose, product, productForm, setProductForm, categories, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {product ? 'Edit Product' : 'Add Product'}
        </h3>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={productForm.title}
              onChange={(e) => setProductForm({...productForm, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <input
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
            <input
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={productForm.category}
              onChange={(e) => setProductForm({...productForm, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName || category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={productForm.images[0] || ''}
              onChange={(e) => setProductForm({...productForm, images: [e.target.value]})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={productForm.isActive}
                onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                className="mr-2"
              />
              Active
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              {product ? 'Update' : 'Add'} Product
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryModal = ({ isOpen, onClose, category, categoryForm, setCategoryForm, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {category ? 'Edit Category' : 'Add Category'}
        </h3>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={categoryForm.categoryName}
              onChange={(e) => setCategoryForm({...categoryForm, categoryName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={categoryForm.isActive}
                onChange={(e) => setCategoryForm({...categoryForm, isActive: e.target.checked})}
                className="mr-2"
              />
              Active
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              {category ? 'Update' : 'Add'} Category
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BulkEditModal = ({ isOpen, onClose, selectedCount, categories, onSubmit }) => {
  const [bulkForm, setBulkForm] = useState({
    price: '',
    stock: '',
    category: '',
    isActive: true
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = {};
    if (bulkForm.price) updateData.price = Number(bulkForm.price);
    if (bulkForm.stock) updateData.stock = Number(bulkForm.stock);
    if (bulkForm.category) updateData.category = bulkForm.category;
    if (bulkForm.isActive !== undefined) updateData.isActive = bulkForm.isActive;
    
    onSubmit(updateData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Bulk Edit {selectedCount} Products
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (leave empty to skip)</label>
            <input
              type="number"
              value={bulkForm.price}
              onChange={(e) => setBulkForm({...bulkForm, price: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock (leave empty to skip)</label>
            <input
              type="number"
              value={bulkForm.stock}
              onChange={(e) => setBulkForm({...bulkForm, stock: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category (leave empty to skip)</label>
            <select
              value={bulkForm.category}
              onChange={(e) => setBulkForm({...bulkForm, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No Change</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName || category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bulkForm.isActive}
                onChange={(e) => setBulkForm({...bulkForm, isActive: e.target.checked})}
                className="mr-2"
              />
              Set as Active
            </label>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Update Products
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImportModal = ({ isOpen, onClose, activeTab, onFileSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Import {activeTab === 'products' ? 'Products' : 'Categories'} from CSV
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={onFileSelect}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4 text-sm text-gray-600">
          <p>CSV format requirements:</p>
          <ul className="list-disc list-inside mt-2">
            {activeTab === 'products' ? (
              <>
                <li>title, description, price, stock, category, images, isActive</li>
                <li>Images: semicolon-separated URLs</li>
                <li>Category: use category ID</li>
              </>
            ) : (
              <>
                <li>categoryName, description, isActive</li>
                <li>isActive: true/false</li>
              </>
            )}
          </ul>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;
