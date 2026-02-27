import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PointOfSale from './components/PointOfSale';
import ProductManagement from './components/ProductManagement';
import TransactionHistory from './components/TransactionHistory';
import Settings from './components/Settings';
import OtherUpdates from './components/ShopExpenses';
import DailySalesReport from './components/DailySalesReport';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import Auth from './components/Auth';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'F1',
      description: 'Show keyboard shortcuts help',
      action: () => setShowShortcutsHelp(true)
    },
    {
      key: 'F3',
      description: 'Go to POS',
      action: () => setActiveTab('pos')
    },
    {
      key: 'F4',
      description: 'Go to Daily Report',
      action: () => setActiveTab('daily-report')
    },
    {
      key: 'F5',
      description: 'Refresh page',
      action: () => window.location.reload()
    },
    {
      key: 'F9',
      description: 'Go to Settings',
      action: () => setActiveTab('settings')
    },
    {
      key: '1',
      ctrlKey: true,
      description: 'Go to Dashboard',
      action: () => setActiveTab('dashboard')
    },
    {
      key: '2',
      ctrlKey: true,
      description: 'Go to POS',
      action: () => setActiveTab('pos')
    },
    {
      key: '3',
      ctrlKey: true,
      description: 'Go to Products',
      action: () => setActiveTab('products')
    },
    {
      key: '4',
      ctrlKey: true,
      description: 'Go to Transactions',
      action: () => setActiveTab('transactions')
    },
    {
      key: '5',
      ctrlKey: true,
      description: 'Go to Other Updates',
      action: () => setActiveTab('expenses')
    },
    {
      key: '6',
      ctrlKey: true,
      description: 'Go to Daily Report',
      action: () => setActiveTab('daily-report')
    },
    {
      key: 'Escape',
      description: 'Close help modal',
      action: () => setShowShortcutsHelp(false)
    }
  ], !!user); // Only enable shortcuts when logged in

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'pos':
        return <PointOfSale />;
      case 'products':
        return <ProductManagement />;
      case 'transactions':
        return <TransactionHistory />;
      case 'expenses':
        return <OtherUpdates />;
      case 'daily-report':
        return <DailySalesReport />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
      
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp 
        isOpen={showShortcutsHelp} 
        onClose={() => setShowShortcutsHelp(false)} 
      />
    </>
  );
}

export default App;