import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  CreditCard
} from 'lucide-react';
import { db } from '../lib/supabase';
import type { DashboardStats, Transaction } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [paymentStats, setPaymentStats] = useState<{cash: number, upi: number, upiCount: number}>({cash: 0, upi: 0, upiCount: 0});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, transactions, todaysTransactions] = await Promise.all([
        db.getDashboardStats(),
        db.getTodaysTransactions(),
        db.getTodaysTransactions()
      ]);
      
      setStats(dashboardStats);
      setRecentTransactions(transactions.slice(0, 5));
      
      // Calculate payment method stats
      const cashTotal = todaysTransactions
        .filter(t => t.payment_method.toLowerCase() === 'cash')
        .reduce((sum, t) => sum + t.total_amount, 0);
      const upiTotal = todaysTransactions
        .filter(t => t.payment_method.toLowerCase() === 'upi')
        .reduce((sum, t) => sum + t.total_amount, 0);
      const upiCount = todaysTransactions.filter(t => t.payment_method.toLowerCase() === 'upi').length;
      
      setPaymentStats({ cash: cashTotal, upi: upiTotal, upiCount });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Sales",
      value: `₹${stats?.todaysSales?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'Products Sold',
      value: stats?.totalProductsSold?.toString() || '0',
      icon: Package,
      color: 'bg-blue-500',
      change: '+8.2%',
      trend: 'up'
    },
    {
      title: 'Transactions',
      value: stats?.totalTransactions?.toString() || '0',
      icon: ShoppingBag,
      color: 'bg-purple-500',
      change: '+5.1%',
      trend: 'up'
    },
    {
      title: 'Total Cash (Today)',
      value: `₹${paymentStats.cash.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-600',
      change: '',
      trend: 'up'
    },
    {
      title: 'UPI Transactions (Today)',
      value: paymentStats.upiCount.toString(),
      icon: CreditCard,
      color: 'bg-blue-600',
      change: '',
      trend: 'up'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LEFRUT Dashboard</h1>
          <p className="text-gray-600">Fresh Fruits Store Overview</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2 space-x-1">
                  {stat.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">vs yesterday</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Payment Methods</h2>
            <p className="text-sm text-gray-600">Sales breakdown by payment type</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Cash Payments</p>
                    <p className="text-sm text-gray-600">Direct cash transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">₹{paymentStats.cash.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {stats?.todaysSales ? ((paymentStats.cash / stats.todaysSales) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">UPI Payments</p>
                    <p className="text-sm text-gray-600">Digital UPI transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">₹{paymentStats.upi.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {stats?.todaysSales ? ((paymentStats.upi / stats.todaysSales) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Sales:</span>
                  <span className="text-xl font-bold text-gray-900">₹{(paymentStats.cash + paymentStats.upi).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-600">Latest sales from today</p>
          </div>
          <div className="p-6">
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ShoppingBag className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Transaction #{transaction.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₹{transaction.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {transaction.payment_method}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No transactions today</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Low Stock section removed as requested */}
    </div>
  );
};

export default Dashboard;