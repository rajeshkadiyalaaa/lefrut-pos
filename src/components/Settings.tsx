import React, { useEffect, useState } from 'react';
import { 
  User, 
  Store, 
  Receipt, 
  Bell,
  Shield,
  Save,
  Keyboard
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/supabase';
import ShortcutCustomizer from './ShortcutCustomizer';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('store');
  const [storeSettings, setStoreSettings] = useState({
    name: 'LE FRUT',
    tagline: 'Fresh Fruits & Juices',
    address: '7 Plot no :9, 52 1/2, Rd Number 2, Veterinary Colony, Vijayawada',
    phone: '97037 89888',
    email: 'lefrut@example.com',
    gstNo: '27XXXXX1234X1ZX',
    taxRate: 0,
    currency: 'INR',
    lowStockThreshold: 10
  });

  const [receiptSettings, setReceiptSettings] = useState({
    showLogo: true,
    showAddress: true,
    showPhone: true,
    footerMessage: 'Thank you for your business!'
  });

  // A5 print toggle persisted to localStorage (default disabled)
  const [printA5, setPrintA5] = useState<boolean>(false);
  useEffect(() => {
    const stored = localStorage.getItem('print_a5');
    if (stored === 'true') setPrintA5(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('print_a5', printA5 ? 'true' : 'false');
  }, [printA5]);

  // Auto print toggle persisted to localStorage (default disabled)
  const [autoPrintBill, setAutoPrintBill] = useState<boolean>(false);
  useEffect(() => {
    const stored = localStorage.getItem('auto_print_bill');
    if (stored === 'true') setAutoPrintBill(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('auto_print_bill', autoPrintBill ? 'true' : 'false');
  }, [autoPrintBill]);

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    dailySummary: true,
    newTransactions: false
  });

  // Data Reset state
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetRunning, setResetRunning] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'receipt', label: 'Receipt', icon: Receipt },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleSaveSettings = () => {
    // Here you would normally save to your backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'store' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={storeSettings.tagline}
                    onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Fresh Fruits & Juices"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={storeSettings.gstNo}
                    onChange={(e) => setStoreSettings({ ...storeSettings, gstNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 27XXXXX1234X1ZX"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={storeSettings.lowStockThreshold}
                    onChange={(e) => setStoreSettings({ ...storeSettings, lowStockThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                {/* Data Reset Section */}
                <div className="space-y-4 border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-md font-semibold text-red-700">Data Reset (Transactions Only)</h3>
                  <p className="text-sm text-red-700">
                    This will delete all transaction history older than the last 7 days.
                    Products and inventory will NOT be deleted.
                  </p>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={resetConfirm}
                      onChange={(e) => setResetConfirm(e.target.checked)}
                    />
                    <span className="text-sm text-gray-800">I understand and want to proceed</span>
                  </label>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={async () => {
                        if (!resetConfirm || resetRunning) return;
                        setResetRunning(true);
                        setResetProgress(1);
                        setResetMessage(null);
                        try {
                          const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                          const res = await db.purgeOldTransactions(cutoff, (p) => setResetProgress(p));
                          setResetMessage(`Deleted ${res.deleted} of ${res.total} old transactions.`);
                        } catch (err: unknown) {
                          console.error('Reset error:', err);
                          const message = err instanceof Error ? err.message : 'Failed to reset data.';
                          setResetMessage(message);
                        } finally {
                          setResetRunning(false);
                          setResetConfirm(false);
                        }
                      }}
                      disabled={!resetConfirm || resetRunning}
                      className={`px-4 py-2 rounded-lg text-white ${resetRunning ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}
                    >
                      {resetRunning ? 'Running…' : 'Run Reset'}
                    </button>

                    {resetRunning || resetProgress > 0 ? (
                      <div className="flex-1">
                        <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden">
                          <div
                            className="h-3 bg-red-600 transition-all"
                            style={{ width: `${Math.min(100, Math.max(1, resetProgress))}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-700 mt-1">{Math.min(100, Math.max(1, Math.floor(resetProgress)))}%</div>
                      </div>
                    ) : null}
                  </div>

                  {resetMessage && (
                    <div className="text-sm text-gray-800 mt-1">{resetMessage}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Receipt Settings</h2>
              
              <div className="space-y-4">
                {/* Print on A5 toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Print on A5 paper (instead of POS roll)
                    </label>
                    <p className="text-sm text-gray-500">When enabled, bills will print on A5 size</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printA5}
                      onChange={(e) => setPrintA5(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Auto Print Bill After Sale */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Auto Print Bill After Sale
                    </label>
                    <p className="text-sm text-gray-500">
                      When enabled, opens printer dialog right after sale completion. 
                      Select your thermal printer (Bluetooth) or A5 printer (WiFi) from the dialog.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPrintBill}
                      onChange={(e) => setAutoPrintBill(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Show Logo on Receipt
                    </label>
                    <p className="text-sm text-gray-500">Display store logo on printed receipts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showLogo}
                      onChange={(e) => setReceiptSettings({ ...receiptSettings, showLogo: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Show Address
                    </label>
                    <p className="text-sm text-gray-500">Display store address on receipts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showAddress}
                      onChange={(e) => setReceiptSettings({ ...receiptSettings, showAddress: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Show Phone Number
                    </label>
                    <p className="text-sm text-gray-500">Display store phone on receipts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiptSettings.showPhone}
                      onChange={(e) => setReceiptSettings({ ...receiptSettings, showPhone: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Message
                  </label>
                  <textarea
                    value={receiptSettings.footerMessage}
                    onChange={(e) => setReceiptSettings({ ...receiptSettings, footerMessage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Thank you message for customers"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <ShortcutCustomizer />
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Low Stock Alerts
                    </label>
                    <p className="text-sm text-gray-500">Get notified when products are running low</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.lowStockAlerts}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Daily Summary
                    </label>
                    <p className="text-sm text-gray-500">Receive daily sales summary emails</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.dailySummary}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, dailySummary: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Transaction Alerts
                    </label>
                    <p className="text-sm text-gray-500">Get notified for each new transaction</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.newTransactions}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, newTransactions: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-8 h-8 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{user?.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-sm text-gray-500 capitalize">Role: {user?.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </button>

                  <button className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </button>

                  <button className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900">Login History</p>
                    <p className="text-sm text-gray-500">View recent login activity</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;