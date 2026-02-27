import React, { useState, useEffect, useMemo, startTransition, useRef } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  Package,
  Edit3,
  FileText
} from 'lucide-react';
import { db } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { printThermalReceipt } from '../lib/thermalPrinter';
import ReceiptModal from './ReceiptModal';
import PackingSlipModal from './PackingSlipModal';
import DraftsModal from './DraftsModal';
import { upsertDraft, getDraft, deleteDraft } from '../lib/drafts';
import type { Product, CartItem } from '../types';

// Local view types to avoid any
type ReceiptItem = { name: string; qty: number; price: number; total: number };
type ReceiptData = {
  billNo: string;
  date: string;
  customerName?: string;
  cashier?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
};
type PackingSlipData = {
  billNo: string;
  date: string;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
};

const PointOfSale: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);
  const [showPackingSlip, setShowPackingSlip] = useState(false);
  const [currentPackingSlip, setCurrentPackingSlip] = useState<PackingSlipData | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const printingRef = useRef(false);

  // Debounced search term to avoid filtering on every keystroke
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250);

  useEffect(() => {
    loadProducts();
  }, []);

  // POS-specific keyboard shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);
  useKeyboardShortcuts([
    {
      key: 'F6',
      description: 'Clear cart',
      action: () => {
        if (cart.length > 0 && confirm('Clear the entire cart?')) {
          setCart([]);
          setCustomerName('');
          setDiscount(0);
          setPaymentMethod('');
          setCurrentDraftId(null);
        }
      }
    },
    {
      key: 'F7',
      description: 'Save as draft',
      action: () => handleSaveDraft()
    },
    {
      key: 'F8',
      description: 'Show drafts',
      action: () => setShowDrafts(true)
    },
    {
      key: 'F11',
      description: 'Set payment to Cash',
      action: () => setPaymentMethod('Cash')
    },
    {
      key: 'F12',
      description: 'Set payment to UPI',
      action: () => setPaymentMethod('UPI')
    },
    {
      key: '/',
      description: 'Focus product search',
      action: () => searchInputRef.current?.focus()
    }
  ]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await db.getProducts(false);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error loading products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Drafts
  const handleSaveDraft = () => {
    if (cart.length === 0) {
      alert('Cannot save empty cart as draft');
      return;
    }
    const totals = calculateTotals();
    const id = currentDraftId || `DRAFT-${Date.now().toString(36)}`;
    upsertDraft({
      id,
      created_at: new Date().toISOString(),
      customer_name: customerName || undefined,
      discount,
      payment_method: paymentMethod || undefined,
      items: cart,
      subtotal: totals.subtotal,
      total: totals.total,
    });
    setCurrentDraftId(id);
    alert('Draft saved');
  };

  const handleOpenDraft = (draftId: string) => {
    const d = getDraft(draftId);
    if (!d) return;
    setCart(d.items);
    setCustomerName(d.customer_name || '');
    setDiscount(d.discount || 0);
    setPaymentMethod(d.payment_method || '');
    setCurrentDraftId(d.id);
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    // Check if product allows zero stock sales or has stock
    const canSell = product.allow_zero_stock || product.stock_quantity > 0;
    
    if (!canSell) {
      alert('Product out of stock and not available for sale');
      return;
    }
    
    if (existingItem) {
      // Check stock limit only if zero stock not allowed
      if (!product.allow_zero_stock && existingItem.quantity >= product.stock_quantity) {
        alert('Insufficient stock');
        return;
      }
      
      const newQuantity = existingItem.quantity + 1;
      const price = existingItem.customPrice || product.price;
      
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: newQuantity, total: newQuantity * price }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        customPrice: undefined,
        total: product.price
      }]);
    }
  };

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const cartItem = cart.find(item => item.product.id === productId);
    if (!cartItem) return;

    const product = cartItem.product;
    
    // Check stock only if zero stock not allowed
    if (!product.allow_zero_stock && quantity > product.stock_quantity) {
      alert('Insufficient stock');
      return;
    }

    const price = cartItem.customPrice || product.price;
    
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity, total: quantity * price }
        : item
    ));
  };

  const updateCustomPrice = (productId: string, newPrice: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          customPrice: newPrice,
          total: item.quantity * newPrice
        };
      }
      return item;
    }));
    setEditingPrice(null);
    setCustomPriceInput('');
  };

  const startEditingPrice = (productId: string, currentPrice: number) => {
    setEditingPrice(productId);
    setCustomPriceInput(currentPrice.toString());
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = discount;
    const total = Math.max(0, subtotal - discountAmount);

    return {
      subtotal,
      discountAmount,
      taxAmount: 0,
      total
    };
  };

  const handlePrintPackingSlip = () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const billNo = `#PS${Date.now().toString().slice(-6)}`;
    const date = new Date().toLocaleString();

    // Open popup UI for packing slip (same design style as receipt)
    setCurrentPackingSlip({
      billNo,
      date,
      customerName: customerName || undefined,
      items: cart.map(item => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.customPrice || item.product.price,
        total: item.total
      })),
      subtotal: calculateTotals().subtotal,
      discount: discount,
      total: calculateTotals().total
    });
    setShowPackingSlip(true);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setProcessing(true);
    
    try {
      const totals = calculateTotals();
      
      const transaction = {
        type: 'sale' as const,
        total_amount: totals.total,
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        tax: 0,
        payment_method: paymentMethod,
        customer_name: customerName || undefined,
        notes: undefined,
        user_id: user!.id
      };

      const transactionItems = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.customPrice || item.product.price,
        total_price: item.total
      }));

      // Create transaction in database
      await db.createTransaction(transaction, transactionItems);
      
      // Prepare receipt data
      const billNo = `#${Date.now().toString().slice(-6)}`;
      const receiptData = {
        billNo,
        date: new Date().toLocaleString(),
        customerName: customerName || undefined,
        cashier: user?.full_name || user?.email || 'Cashier',
        items: cart.map(item => ({
          name: item.product.name,
          qty: item.quantity,
          price: item.customPrice || item.product.price,
          total: item.total
        })),
        subtotal: totals.subtotal,
        discount: totals.discountAmount,
        total: totals.total,
        paymentMethod
      };
      
      // Auto print if enabled (print thermal receipt, NOT the whole window)
      const autoPrintEnabled = typeof window !== 'undefined' && localStorage.getItem('auto_print_bill') === 'true';
      
      if (autoPrintEnabled && !printingRef.current) {
        try {
          printingRef.current = true;
          // Use thermal printer to print receipt only (not whole page)
          printThermalReceipt(receiptData);
        } catch (err) {
          console.error('Auto print failed:', err);
        } finally {
          printingRef.current = false;
        }
      }

      // Show receipt modal
      setCurrentReceipt(receiptData);
      setShowReceipt(true);

      // If this was from a draft, remove it
      if (currentDraftId) {
        try {
          deleteDraft(currentDraftId);
          setCurrentDraftId(null);
        } catch (err) {
          console.error('Error deleting draft:', err);
        }
      }

      // Clear cart and form states
      setCart([]);
      setCustomerName('');
      setDiscount(0);
      setPaymentMethod('');
      
      // Reload products to update stock - with error handling
      try {
        await loadProducts();
      } catch (error) {
        console.error('Error reloading products:', error);
        // Don't fail the whole sale if reload fails
        // Products will be stale but user can manually refresh
      }
      
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    } finally {
      // Always reset processing state
      setProcessing(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const s = debouncedSearchTerm.trim().toLowerCase();
    return products.filter(product => {
      const matchesSearch = !s || product.name.toLowerCase().includes(s) ||
        product.category.toLowerCase().includes(s);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchTerm, selectedCategory]);

  const categories = useMemo(() => (
    ['all', ...Array.from(new Set(products.map(p => p.category)))]
  ), [products]);
  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Products Section */}
      <div className="flex-1 p-6">
        {/* Search & Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products... (Press / to focus)"
              value={searchTerm}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setSearchTerm(v));
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Draft actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50 transition"
            >
              {currentDraftId ? 'Update Draft' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => setShowDrafts(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50 transition"
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex flex-col items-center min-w-[100px] p-4 rounded-2xl transition ${
                selectedCategory === category
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium text-sm">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <span className="text-xs mt-1 opacity-75">
                {products.filter(p => category === 'all' || p.category === category).length} Items
              </span>
            </button>
          ))}
        </div>

        {/* Products Grid (virtualized) */}
        <div className="h-[calc(100vh-280px)]">
          <VirtualProductGrid products={filteredProducts} onAdd={addToCart} />
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Cart ({cart.length})</h2>
            </div>
            <button
              onClick={handlePrintPackingSlip}
              disabled={cart.length === 0}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Print Packing Slip"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="p-6 h-64 overflow-y-auto border-b border-gray-200">
          {cart.length > 0 ? (
            <div className="space-y-4">
              {cart.map(item => {
                const displayPrice = item.customPrice || item.product.price;
                const isCustomPrice = item.customPrice !== undefined;
                
                return (
                  <div key={item.product.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {editingPrice === item.product.id ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">₹</span>
                            <input
                              type="number"
                              value={customPriceInput}
                              onChange={(e) => setCustomPriceInput(e.target.value)}
                              onBlur={() => {
                                const newPrice = parseFloat(customPriceInput);
                                if (newPrice && newPrice > 0) {
                                  updateCustomPrice(item.product.id, newPrice);
                                } else {
                                  setEditingPrice(null);
                                }
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  const newPrice = parseFloat(customPriceInput);
                                  if (newPrice && newPrice > 0) {
                                    updateCustomPrice(item.product.id, newPrice);
                                  }
                                }
                              }}
                              className="w-16 px-1 py-0.5 text-xs border border-blue-500 rounded"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingPrice(item.product.id, displayPrice)}
                            className="flex items-center space-x-1 text-xs hover:text-blue-600"
                          >
                            <span className={isCustomPrice ? 'text-orange-600 font-medium' : 'text-gray-500'}>
                              ₹{displayPrice.toFixed(2)}
                            </span>
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                        {isCustomPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{item.product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-sm">₹{item.total.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Cart is empty</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2">Payment Method</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod(paymentMethod === 'Cash' ? '' : 'Cash')}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                    paymentMethod === 'Cash'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(paymentMethod === 'UPI' ? '' : 'UPI')}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                    paymentMethod === 'UPI'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  UPI
                </button>
              </div>
              {paymentMethod === '' && (
                <p className="mt-1 text-xs text-red-600">Please select a payment method</p>
              )}
            </div>
          </div>
        </div>

        {/* Total and Checkout */}
        <div className="p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={processSale}
            disabled={cart.length === 0 || processing || !paymentMethod}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {processing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Process Sale</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {currentReceipt && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          receipt={currentReceipt}
        />
      )}

      {/* Packing Slip Modal */}
      {currentPackingSlip && (
        <PackingSlipModal
          isOpen={showPackingSlip}
          onClose={() => setShowPackingSlip(false)}
          slip={currentPackingSlip}
        />
      )}

      {/* Drafts Modal */}
      <DraftsModal
        isOpen={showDrafts}
        onClose={() => setShowDrafts(false)}
        onSelect={(d) => {
          handleOpenDraft(d.id);
          setShowDrafts(false);
        }}
      />
    </div>
  );
};

export default PointOfSale;


// Virtualized product grid for better performance on large catalogs
type VirtualProductGridProps = {
  products: Product[];
  onAdd: (p: Product) => void;
};

const VirtualProductGrid: React.FC<VirtualProductGridProps> = ({ products, onAdd }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cellWidth = 210; // optimized for 4-5 cards per row
  const cellHeight = 240; // optimized card height
  const columnCount = Math.max(1, Math.floor(width / cellWidth));
  const rowCount = Math.ceil(products.length / columnCount);

  const Cell: React.FC<{ columnIndex: number; rowIndex: number; style: React.CSSProperties }> = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= products.length) return null;
    const product = products[index];
    const canSell = product.allow_zero_stock || product.stock_quantity > 0;
    return (
      <div style={{ ...style, width: cellWidth, height: cellHeight }} className="p-3 box-border">
        <div
          onClick={() => canSell && onAdd(product)}
          className={`h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col overflow-hidden ${
            !canSell ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative flex-shrink-0">
            <div className="w-full h-28 bg-gray-200 rounded-t-2xl overflow-hidden">
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
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            {product.allow_zero_stock && product.stock_quantity === 0 && (
              <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Out of Stock
              </span>
            )}
          </div>
          <div className="p-2 flex-1 flex flex-col justify-between min-h-0">
            <div className="min-h-0">
              <h3 className="font-semibold text-sm mb-1 truncate" title={product.name}>{product.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <span className="whitespace-nowrap">{product.stock_quantity} Avl</span>
                <span>•</span>
                <span className="truncate" title={product.category}>{product.category}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold text-gray-900 truncate">₹{product.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (width === 0) {
    return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
  }

  const gridWidth = width;
  const gridHeight = window.innerHeight - 280; // dynamic height based on viewport

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <Grid
        columnCount={columnCount}
        columnWidth={cellWidth}
        height={gridHeight}
        rowCount={rowCount}
        rowHeight={cellHeight}
        width={gridWidth}
      >
        {Cell as any}
      </Grid>
    </div>
  );
};

