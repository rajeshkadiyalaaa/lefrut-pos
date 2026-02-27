// Shortcut Customization Component
import React, { useState, useEffect } from 'react';
import { Keyboard, RotateCcw, Save, AlertCircle, CheckCircle, Edit2 } from 'lucide-react';

interface ShortcutConfig {
  id: string;
  name: string;
  description: string;
  defaultKey: string;
  currentKey: string;
  category: 'global' | 'pos' | 'navigation';
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  // Global Shortcuts
  { id: 'help', name: 'Show Help', description: 'Display keyboard shortcuts help', defaultKey: 'F1', currentKey: 'F1', category: 'global' },
  { id: 'refresh', name: 'Refresh Page', description: 'Reload current page', defaultKey: 'F5', currentKey: 'F5', category: 'global' },
  { id: 'settings', name: 'Open Settings', description: 'Go to settings page', defaultKey: 'F9', currentKey: 'F9', category: 'global' },
  { id: 'cancel', name: 'Cancel/Close', description: 'Close any dialog or modal', defaultKey: 'Escape', currentKey: 'Escape', category: 'global' },
  
  // POS Shortcuts
  { id: 'pos_search', name: 'Focus Search', description: 'Jump to product search', defaultKey: '/', currentKey: '/', category: 'pos' },
  { id: 'clear_cart', name: 'Clear Cart', description: 'Empty entire cart', defaultKey: 'F6', currentKey: 'F6', category: 'pos' },
  { id: 'save_draft', name: 'Save Draft', description: 'Save current cart as draft', defaultKey: 'F7', currentKey: 'F7', category: 'pos' },
  { id: 'show_drafts', name: 'Show Drafts', description: 'View saved drafts', defaultKey: 'F8', currentKey: 'F8', category: 'pos' },
  { id: 'payment_cash', name: 'Cash Payment', description: 'Set payment to Cash', defaultKey: 'F11', currentKey: 'F11', category: 'pos' },
  { id: 'payment_upi', name: 'UPI Payment', description: 'Set payment to UPI', defaultKey: 'F12', currentKey: 'F12', category: 'pos' },
  
  // Navigation Shortcuts
  { id: 'nav_dashboard', name: 'Go to Dashboard', description: 'Navigate to Dashboard', defaultKey: '1', currentKey: '1', category: 'navigation', ctrlKey: true },
  { id: 'nav_pos', name: 'Go to POS', description: 'Navigate to Point of Sale', defaultKey: '2', currentKey: '2', category: 'navigation', ctrlKey: true },
  { id: 'nav_products', name: 'Go to Products', description: 'Navigate to Products', defaultKey: '3', currentKey: '3', category: 'navigation', ctrlKey: true },
  { id: 'nav_transactions', name: 'Go to Transactions', description: 'Navigate to Transactions', defaultKey: '4', currentKey: '4', category: 'navigation', ctrlKey: true },
  { id: 'nav_updates', name: 'Go to Other Updates', description: 'Navigate to Expenses & Sales', defaultKey: '5', currentKey: '5', category: 'navigation', ctrlKey: true },
  { id: 'nav_report', name: 'Go to Daily Report', description: 'Navigate to Daily Report', defaultKey: '6', currentKey: '6', category: 'navigation', ctrlKey: true },
  { id: 'quick_pos', name: 'Quick POS Access', description: 'Quick access to POS', defaultKey: 'F3', currentKey: 'F3', category: 'navigation' },
  { id: 'quick_report', name: 'Quick Report Access', description: 'Quick access to Daily Report', defaultKey: 'F4', currentKey: 'F4', category: 'navigation' },
];

const STORAGE_KEY = 'lefrut_custom_shortcuts';

const ShortcutCustomizer: React.FC = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'global' | 'pos' | 'navigation'>('all');

  // Load shortcuts from localStorage or use defaults
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortcuts(parsed);
      } catch (e) {
        setShortcuts(DEFAULT_SHORTCUTS);
      }
    } else {
      setShortcuts(DEFAULT_SHORTCUTS);
    }
  }, []);

  // Save shortcuts to localStorage
  const saveShortcuts = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
      setSuccess('Shortcuts saved! Refresh the page to apply changes.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError('Failed to save shortcuts');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Reset to default shortcuts
  const resetToDefaults = () => {
    if (confirm('Reset all shortcuts to default? This will reload the page.')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  // Start listening for key press
  const startEditing = (id: string) => {
    setEditingId(id);
    setListening(true);
    setError(null);
  };

  // Handle key press during editing
  useEffect(() => {
    if (!listening || !editingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      const key = e.key;
      
      // Don't allow certain keys
      if (['Tab', 'Enter', 'Backspace', 'Delete'].includes(key)) {
        setError('This key cannot be used as a shortcut');
        setListening(false);
        setEditingId(null);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Check for conflicts
      const newKey = key;
      const conflict = shortcuts.find(s => 
        s.id !== editingId && 
        s.currentKey === newKey &&
        s.ctrlKey === e.ctrlKey &&
        s.shiftKey === e.shiftKey &&
        s.altKey === e.altKey
      );

      if (conflict) {
        setError(`This key is already used for "${conflict.name}"`);
        setListening(false);
        setEditingId(null);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Update shortcut
      setShortcuts(prev => prev.map(s => {
        if (s.id === editingId) {
          return {
            ...s,
            currentKey: newKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey
          };
        }
        return s;
      }));

      setListening(false);
      setEditingId(null);
      setSuccess(`Shortcut updated! Don't forget to save.`);
      setTimeout(() => setSuccess(null), 2000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [listening, editingId, shortcuts]);

  const formatKey = (shortcut: ShortcutConfig) => {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    parts.push(shortcut.currentKey);
    return parts.join(' + ');
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'global': return 'Global Shortcuts';
      case 'pos': return 'POS Shortcuts';
      case 'navigation': return 'Navigation';
      default: return 'Other';
    }
  };

  const filteredShortcuts = filter === 'all' 
    ? shortcuts 
    : shortcuts.filter(s => s.category === filter);

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutConfig[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Keyboard className="w-7 h-7 text-blue-600" />
            Customize Keyboard Shortcuts
          </h2>
          <p className="text-gray-600 mt-1">Click on any shortcut to change it to your preferred key</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={saveShortcuts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'global', 'pos', 'navigation'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Shortcuts' : getCategoryName(f)}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 How to customize:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click the "Edit" button next to any shortcut</li>
          <li>Press your desired key (can include Ctrl, Shift, Alt)</li>
          <li>The shortcut will update automatically</li>
          <li>Click "Save Changes" to apply (page will need refresh)</li>
        </ol>
      </div>

      {/* Shortcuts List */}
      <div className="space-y-6">
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">{getCategoryName(category)}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {categoryShortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    editingId === shortcut.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{shortcut.name}</h4>
                    <p className="text-sm text-gray-600">{shortcut.description}</p>
                    {shortcut.currentKey !== shortcut.defaultKey && (
                      <p className="text-xs text-gray-500 mt-1">
                        Default: <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs">{shortcut.defaultKey}</kbd>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {editingId === shortcut.id && listening ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg">
                        <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm text-blue-800 font-medium">Press any key...</span>
                      </div>
                    ) : (
                      <>
                        <kbd className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm font-semibold text-gray-800 min-w-[100px] text-center">
                          {formatKey(shortcut)}
                        </kbd>
                        <button
                          onClick={() => startEditing(shortcut.id)}
                          disabled={listening && editingId !== shortcut.id}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> After saving changes, you must refresh the page (F5) for the new shortcuts to take effect.
          Custom shortcuts are saved in your browser and won't affect other users.
        </p>
      </div>
    </div>
  );
};

export default ShortcutCustomizer;

