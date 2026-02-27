// Keyboard shortcuts help modal
import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Global Shortcuts',
      shortcuts: [
        { keys: ['F1'], description: 'Show this help' },
        { keys: ['F2'], description: 'Add new product' },
        { keys: ['F3'], description: 'Focus search bar' },
        { keys: ['F4'], description: 'Open daily report' },
        { keys: ['F5'], description: 'Refresh current page' },
        { keys: ['F9'], description: 'Open settings' },
        { keys: ['Esc'], description: 'Cancel / Close dialog' },
      ]
    },
    {
      title: 'POS Shortcuts',
      shortcuts: [
        { keys: ['F6'], description: 'Clear cart' },
        { keys: ['F7'], description: 'Save as draft' },
        { keys: ['F8'], description: 'Print last receipt' },
        { keys: ['F10'], description: 'Proceed to checkout' },
        { keys: ['F11'], description: 'Set payment to Cash' },
        { keys: ['F12'], description: 'Set payment to UPI' },
        { keys: ['/'], description: 'Focus product search' },
      ]
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', '1'], description: 'Go to Dashboard' },
        { keys: ['Ctrl', '2'], description: 'Go to POS' },
        { keys: ['Ctrl', '3'], description: 'Go to Products' },
        { keys: ['Ctrl', '4'], description: 'Go to Transactions' },
        { keys: ['Ctrl', '5'], description: 'Go to Other Updates' },
        { keys: ['Ctrl', '6'], description: 'Go to Daily Report' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Keyboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                <p className="text-blue-100 text-sm">Master these shortcuts to boost your productivity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="w-1 h-6 bg-blue-500 rounded mr-2"></span>
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Shortcuts won't work when you're typing in input fields</li>
              <li>• Press <kbd className="px-2 py-0.5 text-xs bg-white border border-blue-300 rounded">Esc</kbd> to quickly close any dialog or modal</li>
              <li>• Use <kbd className="px-2 py-0.5 text-xs bg-white border border-blue-300 rounded">/</kbd> to instantly focus the product search in POS</li>
              <li>• Function keys (F1-F12) work from anywhere in the application</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;

