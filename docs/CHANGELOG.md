# Changelog

All notable changes to Le Frut POS will be documented in this file.

---

## [1.0.0] - 2024-10-18

### 🎉 Initial Release

Complete Point of Sale system with inventory management, financial tracking, and reporting.

### ✨ Features Added

#### Point of Sale
- Product search with real-time filtering
- Virtualized product grid (handles 100+ products)
- Shopping cart with quantity controls
- Custom pricing for individual items
- Discount system (flat amount)
- Multiple payment methods (Cash, UPI, Card)
- Draft orders (save and resume)
- Packing slip printing
- Thermal receipt printing (58mm/80mm)
- Auto-print functionality

#### Inventory Management
- Product CRUD operations
- Image upload to Supabase storage
- Fixed categories: Fresh Fruits, Exotic & Imported, Juices & Cuts
- Stock tracking and alerts
- "Continue Selling at 0 Stock" option
- Active/Inactive toggle
- Bulk CSV import

#### Financial Tracking
- Transaction history with search
- Receipt reprinting
- Shop expense tracking (Beta, General, Transportation categories)
- Other sales tracking (Website Cash, Boxes, General categories)
- Net cash calculation

#### Reports & Analytics
- Real-time dashboard with key metrics
- Daily sales report
- Category-wise totals (dynamic cards)
- Cash vs UPI breakdown
- Profit/loss calculation

#### Settings & Configuration
- Store information management
- Receipt customization
- Auto-print toggle
- A5 paper printing option
- Data reset (keep last 7 days)
- Keyboard shortcuts reference

#### User Experience
- Keyboard shortcuts for all major actions (F1-F8, Ctrl combos)
- Responsive design (desktop, tablet)
- Collapsible sidebar
- Professional UI with Tailwind CSS
- Loading states and error handling
- Modal dialogs for confirmations

#### Security
- Supabase authentication
- Row-level security (RLS)
- User-scoped data access
- Secure image storage

#### Performance
- Virtualized rendering (React Window)
- Debounced search (300ms)
- Optimized database queries
- Image CDN delivery
- Lazy loading components

### 🔧 Technical
- React 18.3 with TypeScript 5.5
- Vite 5.4 build system
- Electron 31.3 for desktop app
- Supabase backend
- Tailwind CSS 3.4 styling
- Lucide React icons

---

## [0.9.0] - 2024-10-17

### ✨ Added
- Keyboard shortcuts system
- Customizable shortcut keys
- Keyboard shortcuts modal

### 🐛 Fixed
- Product card text overflow issue
- Inactive products filter not working
- Search bar freezing after sale
- Auto-print printing entire page

---

## [0.8.0] - 2024-10-17

### ✨ Added
- Category-wise totals in daily report
- Dynamic cards for expenses and other sales
- Shop Expenses category update (Beta, General, Transportation)
- Other Sales category update (Website Cash, Boxes, General)

### 🎨 Improved
- Daily report UI with color-coded cards
- Only show categories with data (> 0)

---

## [0.7.0] - 2024-10-16

### ✨ Added
- Data Reset functionality (keep last 7 days)
- Store information in Settings

### 🐛 Fixed
- Product card text being cut off
- Price visibility issues
- Inactive products filter

---

## [0.6.0] - 2024-10-16

### ✨ Added
- Collapsible sidebar
- Responsive product grid (4-5 cards per row)
- Product card size optimization

### 🎨 Improved
- UI consistency across components
- Layout responsiveness

---

## [0.5.0] - 2024-10-16

### ✨ Added
- Category dropdown for products
- Fixed categories: Fresh Fruits, Exotic & Imported, Juices & Cuts
- Category validation

### 🔄 Changed
- Replaced free-text category input with dropdown

---

## [0.4.0] - 2024-10-15

### 🐛 Fixed
- Electron app freezing after sale
- Auto-print printing whole window
- Search functionality breaking after checkout

### 🔧 Technical
- Improved Electron build process
- Optimized render cycle

---

## [0.3.0] - 2024-10-15

### ✨ Added
- Thermal receipt printing (58mm/80mm)
- Auto-print functionality
- Packing slip feature
- Receipt reprinting from history

### 🔧 Technical
- Created thermalPrinter.ts utility
- Print CSS optimization

---

## [0.2.0] - 2024-10-11

### ✨ Added
- Custom pricing for cart items
- Discount system
- Draft orders functionality
- "Continue Selling at 0 Stock" option

### 🎨 Improved
- POS UI redesign based on sample
- Cart item display
- Payment method selection

---

## [0.1.0] - 2024-10-02

### 🎉 Initial Development
- Basic POS system
- Product management
- Transaction history
- Shop expenses
- Other sales
- Dashboard with metrics
- Daily sales report
- Supabase integration
- Authentication system

---

## Legend

- ✨ Added: New features
- 🔄 Changed: Changes to existing functionality
- 🐛 Fixed: Bug fixes
- 🔧 Technical: Technical improvements
- 🎨 Improved: UI/UX improvements
- ⚠️ Deprecated: Soon-to-be removed features
- 🗑️ Removed: Removed features
- 🔒 Security: Security improvements

---

**Version Format**: [Major.Minor.Patch]
- Major: Breaking changes
- Minor: New features (backwards compatible)
- Patch: Bug fixes (backwards compatible)
