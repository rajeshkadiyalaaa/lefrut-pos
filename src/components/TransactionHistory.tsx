import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  Filter, 
  Eye,
  Download,
  Printer,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { db } from '../lib/supabase';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Transaction, TransactionItem, Product } from '../types';
import ReceiptModal from './ReceiptModal';

const TransactionHistory: React.FC = () => {
  type TransactionWithItems = Transaction & { transaction_items: Array<TransactionItem & { product?: Product }> };
  const [transactions, setTransactions] = useState<TransactionWithItems[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithItems[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 250);
  const [dateFilter, setDateFilter] = useState('today');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  type ReceiptItem = { name: string; qty: number; price: number; total: number };
  type ReceiptData = {
    billNo: string;
    date: string;
    customerName?: string;
    items: ReceiptItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
  };
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    // Inline filtering to satisfy exhaustive-deps without extra callbacks
    let filtered = transactions;

    // Search filter
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(s) ||
        (t.customer_name && t.customer_name.toLowerCase().includes(s)) ||
        t.payment_method.toLowerCase().includes(s)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      switch (dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(t => new Date(t.created_at) >= startDate);
    }

    // Payment method filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.payment_method.toLowerCase() === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, debouncedSearch, dateFilter, typeFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await db.getTransactions(100);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprintReceipt = (transaction: TransactionWithItems) => {
    const billNo = `#${transaction.id.slice(-6).toUpperCase()}`;
    const date = new Date(transaction.created_at).toLocaleString();

    setCurrentReceipt({
      billNo,
      date,
      customerName: transaction.customer_name || undefined,
      items: transaction.transaction_items.map((item) => ({
        name: item.product?.name || 'Unknown Product',
        qty: item.quantity,
        price: item.unit_price,
        total: item.total_price
      })),
      subtotal: transaction.subtotal,
      discount: transaction.discount,
      total: transaction.total_amount,
      paymentMethod: transaction.payment_method
    });
    setShowReceipt(true);
  };

  // removed unused filterTransactions (inlined in useEffect above)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Transaction ID', 'Type', 'Customer', 'Payment Method', 'Total Amount'],
      ...filteredTransactions.map(t => [
        formatDate(t.created_at),
        t.id,
        t.type,
        t.customer_name || 'N/A',
        t.payment_method,
        t.total_amount.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600">View and manage all transactions</p>
        </div>
        <button
          onClick={exportTransactions}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredTransactions.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Sale</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{filteredTransactions.length > 0 ? 
                  (filteredTransactions.reduce((sum, t) => sum + t.total_amount, 0) / filteredTransactions.length).toFixed(2) : 
                  '0.00'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <History className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <button
            onClick={loadTransactions}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Transaction ID</th>
                <th className="text-left p-4 font-medium text-gray-900">Date</th>
                <th className="text-left p-4 font-medium text-gray-900">Type</th>
                <th className="text-left p-4 font-medium text-gray-900">Customer</th>
                <th className="text-left p-4 font-medium text-gray-900">Payment</th>
                <th className="text-left p-4 font-medium text-gray-900">Total</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-mono text-sm text-gray-900">
                      #{transaction.id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">{formatDate(transaction.created_at)}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      transaction.type === 'sale' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900">
                      {transaction.customer_name || 'Walk-in Customer'}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900 capitalize">{transaction.payment_method}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">₹{transaction.total_amount.toFixed(2)}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReprintReceipt(transaction)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Reprint Thermal Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Transaction Details
                </h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono">#{selectedTransaction.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedTransaction.created_at)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <p className="text-sm text-gray-900 capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <p className="text-sm text-gray-900 capitalize">{selectedTransaction.payment_method}</p>
                </div>
                {selectedTransaction.customer_name && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name
                    </label>
                    <p className="text-sm text-gray-900">{selectedTransaction.customer_name}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedTransaction.transaction_items?.map((item: TransactionItem & { product?: Product }) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ₹{item.unit_price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">₹{item.total_price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${selectedTransaction.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedTransaction.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${selectedTransaction.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedTransaction.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Reprint Modal */}
      {currentReceipt && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          receipt={currentReceipt}
        />
      )}
    </div>
  );
};

export default TransactionHistory;