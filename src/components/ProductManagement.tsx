import React, { useState, useEffect, useMemo, useCallback, startTransition } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Plus, CreditCard as Edit2, Trash2, Package, Search, Filter, AlertCircle, Upload, Image, Download } from 'lucide-react';
import { db, uploadProductImage } from '../lib/supabase';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Product } from '../types';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState<'active' | 'inactive' | 'all'>('active');
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock_quantity: '',
    barcode: '',
    description: '',
    image_url: '',
    is_active: true,
    allow_zero_stock: false
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(200);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load all products when showing 'all' or 'inactive', load only active when showing 'active'
      const productsData = await db.getProducts(showInactive !== 'active');
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  // Load on mount and whenever showInactive changes via loadData's deps
  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock_quantity: '',
      barcode: '',
      description: '',
      image_url: '',
      is_active: true,
      allow_zero_stock: false
    });
    setSelectedImage(null);
    setImagePreview('');
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct && !selectedImage) {
      alert('Please select a product image');
      return;
    }
    
    try {
      setUploading(true);
      let imageUrl = formData.image_url;
      
      if (selectedImage) {
        imageUrl = await uploadProductImage(selectedImage);
      }
      
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        barcode: formData.barcode || undefined,
        description: formData.description || undefined,
        image_url: imageUrl,
        is_active: formData.is_active,
        allow_zero_stock: formData.allow_zero_stock
      };

      if (editingProduct) {
        await db.updateProduct(editingProduct.id, productData);
      } else {
        await db.createProduct(productData);
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      barcode: product.barcode || '',
      description: product.description || '',
      image_url: product.image_url,
      is_active: product.is_active ?? true,
      allow_zero_stock: product.allow_zero_stock ?? false
    });
    setImagePreview(product.image_url);
    setShowAddForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await db.deleteProduct(product.id);
        await loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
        // Check if it's a foreign key constraint violation
        if (error instanceof Error && error.message.includes('foreign key constraint')) {
          alert(`Cannot delete "${product.name}" because it is linked to existing transactions. Please remove all associated transaction records first.`);
        } else {
          alert('Error deleting product');
        }
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'category', 'price', 'stock_quantity', 'barcode', 'description'],
      ['Apple', 'Fresh Fruits', '50.00', '100', '1234567890', 'Fresh red apples'],
      ['Dragon Fruit', 'Exotic and Imported Fruits', '120.00', '50', '1234567891', 'Premium dragon fruit'],
      ['Fresh Orange Juice', 'Juices and Cuts', '80.00', '30', '1234567892', 'Freshly squeezed orange juice']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }
    
    setBulkUploading(true);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validate headers
      const requiredHeaders = ['name', 'category', 'price', 'stock_quantity'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        alert(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }
      
      const products: Array<Omit<Product, 'id' | 'created_at' | 'updated_at'>> = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            row[header] = values[index];
          }
        });

        const product: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
          name: row.name || '',
          category: row.category || '',
          price: row.price ? parseFloat(row.price) : 0,
          stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : 0,
          barcode: row.barcode || undefined,
          description: row.description || undefined,
          image_url: row.image_url || '',
          is_active: true,
          allow_zero_stock: false,
        };

        products.push(product);
      }
      
      await db.bulkCreateProducts(products);
      await loadData();
      
      setShowBulkUpload(false);
      setCsvFile(null);
      alert(`Successfully uploaded ${products.length} products!`);
      
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert('Error uploading CSV file. Please check the format and try again.');
    } finally {
      setBulkUploading(false);
    }
  };

  // Debounce search to avoid filtering on every keystroke
  const debouncedSearch = useDebouncedValue(searchTerm, 250);

  const filteredProducts = useMemo(() => {
    const s = debouncedSearch.trim().toLowerCase();
    return products.filter(product => {
      const matchesSearch = !s || product.name.toLowerCase().includes(s) || product.category.toLowerCase().includes(s);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      // Apply showInactive in the UI layer if dataset includes both
      const matchesActive = showInactive === 'all'
        ? true
        : (showInactive === 'active' ? (product.is_active ?? true) : !(product.is_active ?? true));
      return matchesSearch && matchesCategory && matchesActive;
    });
  }, [products, debouncedSearch, selectedCategory, showInactive]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  const categoryOptions = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your store inventory</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setSearchTerm(v));
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={showInactive}
              onChange={(e) => setShowInactive(e.target.value as 'active' | 'inactive' | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active Products</option>
              <option value="inactive">Inactive Products</option>
              <option value="all">All Products</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Product</th>
                <th className="text-left p-4 font-medium text-gray-900">Category</th>
                <th className="text-left p-4 font-medium text-gray-900">Price</th>
                <th className="text-left p-4 font-medium text-gray-900">Stock</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Active</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
          </table>
          <div className="max-h-[480px] overflow-auto">
            <div className="min-w-[1000px]">
            <List
              height={480}
              itemCount={visibleProducts.length}
              itemSize={88}
              width={'100%'}
            >
              {({ index, style }: { index: number; style: React.CSSProperties }) => {
                const product = visibleProducts[index];
                return (
                  <div style={style} key={product.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <div className="grid items-center [grid-template-columns:2fr_1fr_1fr_1fr_1fr_1fr_1fr]">
                      <div className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                fetchPriority="low"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {product.barcode && (
                              <p className="text-sm text-gray-500">Barcode: {product.barcode}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-medium text-gray-900">₹{product.price.toFixed(2)}</p>
                      </div>
                      <div className="p-4">
                        <p className={`font-medium ${product.stock_quantity <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock_quantity}
                        </p>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center space-x-1">
                          {!(product.is_active ?? true) ? (
                            <>
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">Inactive</span>
                            </>
                          ) : product.stock_quantity <= 0 ? (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-red-600">Out of Stock</span>
                            </>
                          ) : product.stock_quantity <= 10 ? (
                            <>
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              <span className="text-sm text-orange-600">Low Stock</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600">In Stock</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_active ?? true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ?? true ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="p-4 pr-6">
                        <div className="flex items-center space-x-2 justify-start">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {(product.is_active ?? true) && (
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Deactivate Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            </List>
            </div>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Load more windowing control */}
      {filteredProducts.length > visibleProducts.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setVisibleCount(c => c + 200)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
          >
            Show more ({visibleProducts.length}/{filteredProducts.length})
          </button>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                      required={!editingProduct}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {selectedImage ? 'Change Image' : 'Upload Image'}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Exotic and Imported Fruits">Exotic and Imported Fruits</option>
                  <option value="Juices and Cuts">Juices and Cuts</option>
                  <option value="Fresh Fruits">Fresh Fruits</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode (Optional)
                </label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Stock Settings
                </label>
                <div className="space-y-2">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.allow_zero_stock}
                      onChange={(e) => setFormData({ ...formData, allow_zero_stock: e.target.checked })}
                      className="mr-2 mt-1"
                    />
                    <div>
                      <span className="text-sm text-gray-900 font-medium">Continue Selling at 0 Stock</span>
                      <p className="text-xs text-gray-500">Allow selling this product even when stock reaches zero</p>
                    </div>
                  </label>
                </div>
              </div>

              {editingProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Status
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={() => setFormData({ ...formData, is_active: true })}
                        className="mr-2"
                      />
                      <span className="text-sm text-green-700">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_active"
                        checked={!formData.is_active}
                        onChange={() => setFormData({ ...formData, is_active: false })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Bulk Upload Products</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Required columns: name, category, price, stock_quantity</li>
                  <li>• Optional columns: barcode, description</li>
                  <li>• First row should contain column headers</li>
                  <li>• Price should be in decimal format (e.g., 50.00)</li>
                  <li>• Categories must be one of: "Fresh Fruits", "Exotic and Imported Fruits", "Juices and Cuts"</li>
                </ul>
                <button
                  onClick={downloadSampleCSV}
                  className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              <form onSubmit={handleBulkUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File *
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkUpload(false);
                      setCsvFile(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkUploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {bulkUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Products</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;