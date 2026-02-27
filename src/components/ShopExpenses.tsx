import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, Calendar, TrendingUp } from 'lucide-react';
import { db } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { ShopExpense, OtherSale } from '../types';

const OtherUpdates: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'expenses' | 'sales'>('expenses');
  const [expenses, setExpenses] = useState<ShopExpense[]>([]);
  const [otherSales, setOtherSales] = useState<OtherSale[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  // Day-wise filter (local date)
  const getLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDate(new Date()));
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Beta' // Default for expenses
  });

  // Updated category lists - only allowed categories
  const expenseCategories = [
    'Beta',          // Default for expenses
    'General',
    'Transportation'
  ];

  const salesCategories = [
    'Website Cash',  // Default for other sales
    'Boxes',
    'General'
  ];

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  // Update category default when switching tabs
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: activeTab === 'expenses' ? 'Beta' : 'Website Cash'
    }));
  }, [activeTab]);

  const loadData = async (date?: string) => {
    try {
      setLoading(true);
      const expensesData = await db.getShopExpenses(date);
      const salesData = await db.getOtherSales(date);
      
      setExpenses(expensesData);
      setOtherSales(salesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        user_id: user!.id
      };

      if (activeTab === 'expenses') {
        await db.createShopExpense(data);
      } else {
        await db.createOtherSale(data);
      }
      
      await loadData();
      
      // Reset form with correct default based on active tab
      setFormData({
        description: '',
        amount: '',
        category: activeTab === 'expenses' ? 'Beta' : 'Website Cash'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Error adding entry');
    }
  };

  const handleDelete = async (id: string, type: 'expense' | 'sale') => {
    const itemType = type === 'expense' ? 'expense' : 'other sale';
    if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
      try {
        if (type === 'expense') {
          await db.deleteShopExpense(id);
        } else {
          await db.deleteOtherSale(id);
        }
        await loadData();
      } catch (error) {
        console.error(`Error deleting ${itemType}:`, error);
        alert(`Error deleting ${itemType}`);
      }
    }
  };

  // Since we fetch for the selected date, totals are directly from arrays
  const totalSelectedExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSelectedOtherSales = otherSales.reduce((sum, sale) => sum + sale.amount, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Other Updates</h1>
          <p className="text-gray-600">Manage shop expenses and other sales</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className={`px-4 py-2 rounded-lg text-white flex items-center space-x-2 ${
            activeTab === 'expenses' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Add {activeTab === 'expenses' ? 'Expense' : 'Other Sale'}</span>
        </button>
      </div>

      {/* Tab Navigation & Date Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'expenses'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Shop Expenses
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'sales'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Other Sales
          </button>
        </div>
        <div className="p-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => loadData(selectedDate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generate
          </button>
        </div>

        {/* Selected Day Summary */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Expenses ( {selectedDate} )</h3>
                <p className="text-2xl font-bold text-red-600 mt-1">₹{totalSelectedExpenses.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Wallet className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Other Sales ( {selectedDate} )</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{totalSelectedOtherSales.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Date & Time</th>
                <th className="text-left p-4 font-medium text-gray-900">Description</th>
                <th className="text-left p-4 font-medium text-gray-900">Category</th>
                <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(activeTab === 'expenses' ? expenses : otherSales).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{item.description}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      activeTab === 'expenses' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className={`font-medium ${
                      activeTab === 'expenses' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹{item.amount.toFixed(2)}
                    </p>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(item.id, activeTab === 'expenses' ? 'expense' : 'sale')}
                      className={`p-2 rounded-lg transition-colors ${
                        activeTab === 'expenses'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(activeTab === 'expenses' ? expenses : otherSales).length === 0 && (
            <div className="text-center py-12">
              {activeTab === 'expenses' ? (
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              ) : (
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-gray-500">
                No {activeTab === 'expenses' ? 'expenses' : 'other sales'} recorded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Add {activeTab === 'expenses' ? 'Shop Expense' : 'Other Sale'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${activeTab === 'expenses' ? 'expense' : 'sale'} description`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(activeTab === 'expenses' ? expenseCategories : salesCategories).map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFormData({ ...formData, category })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.category === category
                          ? activeTab === 'expenses'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg ${
                    activeTab === 'expenses'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Add {activeTab === 'expenses' ? 'Expense' : 'Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherUpdates;