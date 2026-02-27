import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Printer, DollarSign, CreditCard, Wallet, TrendingUp, FileText, ShoppingBag, Receipt } from 'lucide-react';
import { db } from '../lib/supabase';
import type { Transaction, ShopExpense, OtherSale } from '../types';

// Type for category-wise totals
interface CategoryTotal {
  category: string;
  amount: number;
  count: number;
}

const DailySalesReport: React.FC = () => {
  // Use local date (YYYY-MM-DD) to avoid UTC off-by-one issues
  const getLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate(new Date()));
  const [, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<ShopExpense[]>([]);
  const [otherSales, setOtherSales] = useState<OtherSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    cashSales: 0,
    upiSales: 0,
    totalOtherSales: 0,
    totalExpenses: 0,
    totalCashInBox: 0,
    netProfit: 0,
    totalTransactions: 0
  });

  const generateReport = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get transactions for selected date
      const allTransactions = await db.getTransactions(1000);
      const dateTransactions = allTransactions.filter(t => {
        const transactionDate = getLocalDate(new Date(t.created_at));
        return transactionDate === selectedDate;
      });

      // Get expenses for selected date
      const dateExpenses = await db.getShopExpenses(selectedDate);
      
      // Get other sales for selected date
      const dateOtherSales = await db.getOtherSales(selectedDate);

      setTransactions(dateTransactions);
      setExpenses(dateExpenses);
      setOtherSales(dateOtherSales);

      // Calculate totals
      const cashSales = dateTransactions
        .filter(t => t.payment_method.toLowerCase() === 'cash')
        .reduce((sum, t) => sum + t.total_amount, 0);
      
      const upiSales = dateTransactions
        .filter(t => t.payment_method.toLowerCase() === 'upi')
        .reduce((sum, t) => sum + t.total_amount, 0);
      
      const totalOtherSales = dateOtherSales.reduce((sum, s) => sum + s.amount, 0);
      const totalExpenses = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalCashInBox = cashSales + totalOtherSales - totalExpenses;
      const netProfit = (cashSales + upiSales + totalOtherSales) - totalExpenses;

      setReportData({
        cashSales,
        upiSales,
        totalOtherSales,
        totalExpenses,
        totalCashInBox,
        netProfit,
        totalTransactions: dateTransactions.length
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  // Calculate category-wise totals for Other Sales (only non-zero)
  const otherSalesByCategory = useMemo((): CategoryTotal[] => {
    const categoryMap = new Map<string, CategoryTotal>();
    
    otherSales.forEach(sale => {
      const existing = categoryMap.get(sale.category);
      if (existing) {
        existing.amount += sale.amount;
        existing.count += 1;
      } else {
        categoryMap.set(sale.category, {
          category: sale.category,
          amount: sale.amount,
          count: 1
        });
      }
    });
    
    // Return only categories with non-zero amounts
    return Array.from(categoryMap.values())
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }, [otherSales]);

  // Calculate category-wise totals for Expenses (only non-zero)
  const expensesByCategory = useMemo((): CategoryTotal[] => {
    const categoryMap = new Map<string, CategoryTotal>();
    
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category);
      if (existing) {
        existing.amount += expense.amount;
        existing.count += 1;
      } else {
        categoryMap.set(expense.category, {
          category: expense.category,
          amount: expense.amount,
          count: 1
        });
      }
    });
    
    // Return only categories with non-zero amounts
    return Array.from(categoryMap.values())
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
  }, [expenses]);

  const printReport = () => {
    const reportWindow = window.open('', '_blank', 'width=800,height=600');
    if (!reportWindow) return;

    const reportHTML = `
      <html>
        <head>
          <title>Daily Sales Report - ${selectedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .store-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .tagline { font-size: 14px; color: #666; margin-bottom: 10px; }
            .report-date { font-size: 16px; font-weight: bold; }
            .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .summary-title { font-weight: bold; margin-bottom: 10px; }
            .summary-amount { font-size: 20px; font-weight: bold; }
            .cash { color: #10B981; }
            .upi { color: #3B82F6; }
            .expense { color: #EF4444; }
            .profit { color: #059669; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">LEFRUT</div>
            <div class="tagline">Fresh Fruits</div>
            <div class="report-date">Daily Sales Report - ${new Date(selectedDate).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <div class="summary-title">Cash Sales</div>
              <div class="summary-amount cash">₹${reportData.cashSales.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">UPI Sales</div>
              <div class="summary-amount upi">₹${reportData.upiSales.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Other Sales</div>
              <div class="summary-amount profit">₹${reportData.totalOtherSales.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Total Expenses</div>
              <div class="summary-amount expense">₹${reportData.totalExpenses.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Total Cash in Box</div>
              <div class="summary-amount profit">₹${reportData.totalCashInBox.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Net Profit</div>
              <div class="summary-amount profit">₹${reportData.netProfit.toFixed(2)}</div>
            </div>
          </div>

          ${otherSalesByCategory.length > 0 ? `
            <div class="section">
              <div class="section-title">Other Sales by Category</div>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Entries</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${otherSalesByCategory.map(cat => `
                    <tr>
                      <td>${cat.category}</td>
                      <td>${cat.count}</td>
                      <td class="profit">₹${cat.amount.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${expensesByCategory.length > 0 ? `
            <div class="section">
              <div class="section-title">Expenses by Category</div>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Entries</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${expensesByCategory.map(cat => `
                    <tr>
                      <td>${cat.category}</td>
                      <td>${cat.count}</td>
                      <td class="expense">₹${cat.amount.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Sales Summary (${reportData.totalTransactions} transactions)</div>
            <table>
              <thead>
                <tr>
                  <th>Payment Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cash Sales</td>
                  <td>₹${reportData.cashSales.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>UPI Sales</td>
                  <td>₹${reportData.upiSales.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                  <td>Total Sales</td>
                  <td>₹${(reportData.cashSales + reportData.upiSales).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${otherSales.length > 0 ? `
            <div class="section">
              <div class="section-title">Other Sales (${otherSales.length} entries)</div>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${otherSales.map(s => `
                    <tr>
                      <td>${new Date(s.created_at).toLocaleTimeString()}</td>
                      <td>${s.description}</td>
                      <td>${s.category}</td>
                      <td>₹${s.amount.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3">Total Other Sales</td>
                    <td>₹${reportData.totalOtherSales.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}

          ${expenses.length > 0 ? `
            <div class="section">
              <div class="section-title">Expenses (${expenses.length} entries)</div>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenses.map(e => `
                    <tr>
                      <td>${new Date(e.created_at).toLocaleTimeString()}</td>
                      <td>${e.description}</td>
                      <td>${e.category}</td>
                      <td>₹${e.amount.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3">Total Expenses</td>
                    <td>₹${reportData.totalExpenses.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>LEFRUT - Fresh Fruits | GST No: 27XXXXX1234X1ZX</p>
          </div>
        </body>
      </html>
    `;

    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
    reportWindow.print();
  };

  const finishSaleToday = async () => {
    if (confirm('Are you sure you want to finish sales for today? This will generate the final report and prepare for a new billing cycle.')) {
      printReport();
      alert('Daily sales completed! Report has been generated. System is ready for the next billing cycle.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Sales Report</h1>
          <p className="text-gray-600">Generate and print daily sales summary</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={printReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Printer className="w-5 h-5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={finishSaleToday}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Finish Sale Today</span>
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Sales</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₹{reportData.cashSales.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">UPI Sales</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{reportData.upiSales.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Other Sales</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">₹{reportData.totalOtherSales.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">₹{reportData.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Wallet className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash in Box</p>
              <p className={`text-2xl font-bold mt-1 ${reportData.totalCashInBox >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{reportData.totalCashInBox.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${reportData.totalCashInBox >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${reportData.totalCashInBox >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Category-wise Summary Cards */}
      {(otherSalesByCategory.length > 0 || expensesByCategory.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Category-wise Summary</h2>
          
          {/* Other Sales by Category */}
          {otherSalesByCategory.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Other Sales by Category
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {otherSalesByCategory.map(cat => (
                  <div 
                    key={cat.category} 
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-4 border border-green-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                          {cat.category}
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{cat.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {cat.count} {cat.count === 1 ? 'entry' : 'entries'}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses by Category */}
          {expensesByCategory.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Expenses by Category
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {expensesByCategory.map(cat => (
                  <div 
                    key={cat.category} 
                    className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg shadow-sm p-4 border border-red-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">
                          {cat.category}
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          ₹{cat.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {cat.count} {cat.count === 1 ? 'entry' : 'entries'}
                        </p>
                      </div>
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Wallet className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Sales Details Table (replaces Transactions table) */}
      {otherSales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Other Sales Details ({otherSales.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Time</th>
                  <th className="text-left p-4 font-medium text-gray-900">Description</th>
                  <th className="text-left p-4 font-medium text-gray-900">Category</th>
                  <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {otherSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <span className="text-sm text-gray-900">{new Date(sale.created_at).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-900">{sale.description}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">{sale.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900">₹{sale.amount.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Expenses ({expenses.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Time</th>
                  <th className="text-left p-4 font-medium text-gray-900">Description</th>
                  <th className="text-left p-4 font-medium text-gray-900">Category</th>
                  <th className="text-left p-4 font-medium text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <span className="text-sm text-gray-900">
                        {new Date(expense.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-900">{expense.description}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-red-600">₹{expense.amount.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySalesReport;