# 🍋 Le Frut POS - Point of Sale System

<div align="center">

**A modern, feature-rich Point of Sale system built for fruit shops and small retail businesses**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-31.3-47848f.svg)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📖 Overview

Le Frut POS is a complete Point of Sale and inventory management system designed specifically for fruit shops, juice stalls, and fresh produce retailers. It combines a modern React-based web interface with Electron for desktop deployment, providing both online and offline-capable operations.

### Key Highlights

- 🚀 **Fast & Responsive** - Virtualized product grid for smooth performance with 100+ products
- 💻 **Desktop App** - Standalone Windows executable (no installation required)
- 🔒 **Secure** - Row-level security with Supabase authentication
- 🖨️ **Thermal Printing** - Optimized for 58mm/80mm thermal receipt printers
- ⌨️ **Keyboard Shortcuts** - Full keyboard navigation for faster operations
- 📊 **Real-time Analytics** - Live dashboard with sales, expenses, and profit tracking

---

## ✨ Features

### 🏪 Point of Sale

- **Quick Product Search** - Search by name or category with instant results
- **Smart Cart Management** - Add, edit quantities, remove items with one click
- **Custom Pricing** - Override prices for discounts or special deals
- **Multiple Payment Methods** - Cash, UPI, and Card support
- **Discount System** - Apply flat discounts to entire order
- **Draft Orders** - Save incomplete orders and resume later
- **Packing Slips** - Print packing slip before finalizing order
- **Thermal Receipt Printing** - Auto-print receipts (58mm/80mm)

### 📦 Inventory Management

- **Product CRUD** - Add, edit, delete products with ease
- **Image Upload** - Product images with Supabase storage
- **Category Management** - Fixed categories: Fresh Fruits, Exotic & Imported, Juices & Cuts
- **Stock Tracking** - Real-time stock updates after each sale
- **Continue Selling Option** - Allow selling products even when out of stock
- **Bulk Import** - CSV upload for adding multiple products at once
- **Active/Inactive Toggle** - Hide products from POS without deleting

### 💰 Financial Tracking

- **Sales History** - Complete transaction records with search and filters
- **Shop Expenses** - Track daily business expenses (Beta, General, Transportation)
- **Other Sales** - Record non-product revenue (Website Cash, Boxes, General)
- **Cash Flow** - Calculate net cash in hand automatically
- **Receipt Reprints** - Reprint any past transaction receipt

### 📊 Reports & Dashboard

- **Daily Sales Report** - Today's sales summary with Cash/UPI breakdown
- **Category-wise Totals** - Dynamic cards showing totals by expense/sales category
- **Top Products** - Track best-selling items
- **Profit/Loss** - Calculate daily profit (Sales - Expenses)
- **Date Range Filters** - View reports for specific periods

### ⚙️ Settings & Configuration

- **Store Information** - Configure shop name, address, phone, GST
- **Receipt Settings** - Toggle auto-print and A5 paper printing
- **Data Reset** - Clean up old transaction history (keeps last 7 days)
- **Keyboard Shortcuts** - Customizable shortcuts for common actions

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Add New Product |
| `Ctrl + F` | Focus Search Bar (POS) |
| `Ctrl + P` | Process Payment |
| `Ctrl + D` | Save as Draft |
| `Ctrl + K` | Open Drafts |
| `Ctrl + H` | Print Packing Slip |
| `F1` | Navigate to Dashboard |
| `F2` | Navigate to POS |
| `F3` | Navigate to Products |
| `F4` | Navigate to Transactions |
| `F5` | Navigate to Expenses |
| `F6` | Navigate to Other Sales |
| `Escape` | Close Modals |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Supabase Account** (free tier works great)

### Installation

```bash
# Clone or download the project
cd Lefrut_Pos_v4

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Database Setup

Run the provided SQL script in your Supabase SQL Editor:

```bash
# Option 1: Copy SQL from
# supabase/setup_complete_database.sql
# and run in Supabase SQL Editor

# Option 2: Use the test script to verify connection
node test-supabase-connection.js
```

### Development

```bash
# Start development server
npm run dev

# Open browser at http://localhost:5173
```

### Production Build

```bash
# Build web app
npm run build

# Build Windows .exe
npm run package-win

# Output: dist-electron/LeFrut_POS_v1.0.exe
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling
- **Lucide React** - Icon library
- **React Window** - Virtualized lists for performance

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, and storage
- **Row Level Security (RLS)** - Secure data access
- **Real-time subscriptions** - Live data updates

### Desktop
- **Electron 31.3** - Desktop application wrapper
- **Electron Builder** - Packaging and distribution

### Key Libraries
- `@supabase/supabase-js` - Supabase client
- `react-window` - Virtualized product grid
- `lucide-react` - Icons

---

## 📁 Project Structure

```
Lefrut_Pos_v4/
├── src/
│   ├── components/
│   │   ├── Auth.tsx                    # Login/Signup
│   │   ├── Dashboard.tsx               # Main dashboard with metrics
│   │   ├── PointOfSale.tsx             # POS interface with cart
│   │   ├── ProductManagement.tsx       # Product CRUD and bulk upload
│   │   ├── TransactionHistory.tsx      # Sales history with reprints
│   │   ├── ShopExpenses.tsx            # Business expense tracking
│   │   ├── OtherSales.tsx              # Additional revenue tracking
│   │   ├── DailySalesReport.tsx        # Daily summary reports
│   │   ├── Settings.tsx                # App configuration
│   │   └── Layout.tsx                  # App shell with navigation
│   ├── hooks/
│   │   ├── useAuth.ts                  # Authentication hook
│   │   └── useKeyboardShortcuts.ts     # Keyboard navigation hook
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client & DB operations
│   │   └── thermalPrinter.ts           # Receipt printing utilities
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   ├── App.tsx                         # Root component with routing
│   ├── main.tsx                        # React entry point
│   └── index.css                       # Global styles
├── supabase/
│   └── migrations/
│       └── setup_complete_database.sql # Complete DB schema
├── public/                             # Static assets
├── docs/                               # Documentation files
├── main.js                             # Electron main process
├── preload.cjs                         # Electron preload script
├── package.json                        # Dependencies and scripts
├── vite.config.ts                      # Vite configuration
├── tailwind.config.js                  # Tailwind CSS config
├── tsconfig.json                       # TypeScript config
└── .env                                # Environment variables
```

---

## 🗄️ Database Schema

### Tables

#### `products`
- Product information (name, price, stock, category, images)
- `allow_zero_stock` - Flag to allow selling when stock = 0
- `is_active` - Show/hide from POS

#### `transactions`
- Sale records with totals, payment method, discount
- Links to customer (optional)

#### `transaction_items`
- Line items for each transaction
- Product, quantity, unit price, total

#### `shop_expenses`
- Business expenses with category (Beta, General, Transportation)
- Amount, date, notes

#### `other_sales`
- Non-product revenue (Website Cash, Boxes, General)
- Amount, date, description

#### `storage.product-images`
- Supabase storage bucket for product photos

---

## 🔐 Security

- **Authentication** - Supabase Auth with JWT tokens
- **Row Level Security (RLS)** - User-scoped data access
- **Secure Storage** - Product images with access policies
- **Environment Variables** - Sensitive credentials in `.env`

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Complete installation instructions
- **[FEATURES_GUIDE.md](docs/FEATURES_GUIDE.md)** - Detailed feature documentation
- **[KEYBOARD_SHORTCUTS.md](docs/KEYBOARD_SHORTCUTS.md)** - All keyboard shortcuts
- **[BUILD_GUIDE.md](docs/BUILD_GUIDE.md)** - Building the Electron app
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - Supabase functions reference

---

## 🖨️ Thermal Printing

The system supports thermal receipt printing with the following formats:

### Receipt Format (58mm / 80mm)

```
      🍊 LE FRUT 🍊
   12 Market Street, City
    Ph: +91-98765-43210

Bill No: #00458
Date: 02-Oct-2025   7:52 PM
--------------------------------
Item          Qty  Price  Total
--------------------------------
Apple Juice   2   40.00   80.00
Banana Shake  1   50.00   50.00
--------------------------------
Subtotal:                 130.00
Discount:                  10.00
TOTAL:                   ₹120.00
Payment: UPI
--------------------------------
Thank you! Visit Again 🍊
```

### Print Settings

- **Auto Print** - Toggle automatic printing after sale
- **A5 Paper** - Switch between thermal and A5 paper printing
- **Thermal Sizes** - Supports 58mm and 80mm widths

---

## 🧪 Testing

```bash
# Run TypeScript checks
npm run lint

# Build production bundle
npm run build

# Test Supabase connection
node test-supabase-connection.js
```

---

## 🚢 Deployment

### Web Deployment

```bash
# Build for web
npm run build

# Deploy 'dist' folder to:
# - Vercel (recommended)
# - Netlify
# - Cloudflare Pages
# - Any static hosting
```

### Desktop Deployment

```bash
# Build Windows .exe
npm run package-win

# Output location:
# dist-electron/LeFrut_POS_v1.0.exe

# Distribute the .exe file
# No installation required - just run it!
```

---

## 🔧 Configuration

### Store Settings

Edit in the app under **Settings > Store Information**:
- Store name
- Address
- Phone number
- GST number

### Categories

**Product Categories** (fixed):
- Fresh Fruits
- Exotic and Imported Fruits
- Juices and Cuts

**Expense Categories**:
- Beta (default)
- General
- Transportation

**Other Sales Categories**:
- Website Cash (default)
- Boxes
- General

---

## 🐛 Troubleshooting

### Common Issues

**Problem: App freezes after sale**
- **Solution**: Fixed in v1.0 - Update to latest version

**Problem: Auto-print prints entire page**
- **Solution**: Fixed in v1.0 - Only receipt content prints

**Problem: Product search not working**
- **Solution**: Check if products are marked as "active"

**Problem: Cannot connect to Supabase**
- **Solution**: Verify `.env` file has correct credentials

### Logs and Debugging

```bash
# View browser console (Electron)
Ctrl + Shift + I (Windows)

# Check Supabase logs
https://app.supabase.com/project/your-project/logs
```

---

## 📈 Performance Optimization

- **Virtualized Lists** - Only render visible products (handles 1000+ items)
- **Debounced Search** - Search triggers after typing stops (300ms)
- **Indexed Queries** - Database indexes on commonly queried columns
- **Image CDN** - Supabase storage serves optimized images
- **Code Splitting** - Lazy load components as needed

---

## 🎯 Roadmap

### Planned Features

- [ ] Mobile app (React Native)
- [ ] Barcode scanning
- [ ] Multi-store support
- [ ] Advanced reporting (charts/graphs)
- [ ] Export reports to PDF/Excel
- [ ] Customer management
- [ ] Loyalty points system
- [ ] Email receipt delivery
- [ ] Inventory forecasting
- [ ] Supplier management

---

## 🤝 Contributing

This is a proprietary project for Le Frut business operations.

---

## 📄 License

**Proprietary** - All rights reserved.  
Created for Le Frut business operations.

---

## 📞 Support

For issues or questions:
1. Check the [documentation](docs/)
2. Review [troubleshooting](#-troubleshooting) section
3. Check browser console for errors
4. Verify Supabase dashboard for database issues

---

## 🎉 Acknowledgments

Built with:
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/)
- [Electron](https://www.electronjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

**Le Frut POS v1.0** • Built with ❤️ for small businesses

**[Documentation](docs/)** • **[Report Issue](#)** • **[Latest Release](#)**

</div>
