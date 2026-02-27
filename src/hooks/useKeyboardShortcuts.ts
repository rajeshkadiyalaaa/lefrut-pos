// Hook for managing keyboard shortcuts across the application
import { useEffect } from 'react';

const STORAGE_KEY = 'lefrut_custom_shortcuts';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

// Load custom shortcut key for a given ID
export const getCustomShortcutKey = (id: string, defaultKey: string): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const shortcuts = JSON.parse(saved);
      const shortcut = shortcuts.find((s: any) => s.id === id);
      return shortcut ? shortcut.currentKey : defaultKey;
    }
  } catch (e) {
    // If error, return default
  }
  return defaultKey;
};

// Load custom shortcut config (including modifiers) for a given ID
export const getCustomShortcut = (id: string, defaults: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean }) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const shortcuts = JSON.parse(saved);
      const shortcut = shortcuts.find((s: any) => s.id === id);
      if (shortcut) {
        return {
          key: shortcut.currentKey,
          ctrlKey: shortcut.ctrlKey,
          shiftKey: shortcut.shiftKey,
          altKey: shortcut.altKey
        };
      }
    }
  } catch (e) {
    // If error, return defaults
  }
  return defaults;
};

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

// Global shortcuts that work across all pages
export const GLOBAL_SHORTCUTS: Record<string, { key: string; description: string }> = {
  HELP: { key: 'F1', description: 'Show keyboard shortcuts help' },
  ADD_PRODUCT: { key: 'F2', description: 'Add new product' },
  SEARCH: { key: 'F3', description: 'Focus search bar' },
  DAILY_REPORT: { key: 'F4', description: 'Open daily report' },
  REFRESH: { key: 'F5', description: 'Refresh current page' },
  PRINT_LAST: { key: 'F8', description: 'Print last receipt' },
  SETTINGS: { key: 'F9', description: 'Open settings' },
  LOGOUT: { key: 'F12', description: 'Logout' },
  CANCEL: { key: 'Escape', description: 'Cancel/Close current dialog' },
};

// POS-specific shortcuts
export const POS_SHORTCUTS: Record<string, { key: string; description: string }> = {
  QUICK_SALE: { key: 'F1', description: 'Quick sale mode' },
  CLEAR_CART: { key: 'F6', description: 'Clear cart' },
  SAVE_DRAFT: { key: 'F7', description: 'Save as draft' },
  CHECKOUT: { key: 'F10', description: 'Checkout' },
  FOCUS_SEARCH: { key: '/', description: 'Focus product search' },
  CASH_PAYMENT: { key: 'F11', description: 'Set payment to Cash' },
  UPI_PAYMENT: { key: 'F12', description: 'Set payment to UPI' },
};

