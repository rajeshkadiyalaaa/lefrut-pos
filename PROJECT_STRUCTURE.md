# Le Frut POS - Project Structure

Complete overview of the project organization and file structure.

---

## 📁 Directory Structure

```
Lefrut_Pos_v4/
│
├── 📄 README.md                    # Main project documentation
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 package.json                 # Dependencies and scripts
├── 📄 package-lock.json            # Locked dependencies
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env                         # Environment variables (not in git)
├── 📄 .env.example                 # Environment template
├── 📄 .env.production              # Production environment
│
├── ⚙️  vite.config.ts              # Vite build configuration
├── ⚙️  tsconfig.json               # TypeScript configuration
├── ⚙️  tailwind.config.js          # Tailwind CSS configuration
├── ⚙️  postcss.config.js           # PostCSS configuration
├── ⚙️  eslint.config.js            # ESLint configuration
│
├── 🖥️  main.js                     # Electron main process
├── 🖥️  preload.cjs                 # Electron preload script
│
├── 📚 docs/                        # Documentation
│   ├── SETUP_GUIDE.md              # Installation and setup
│   ├── FEATURES_GUIDE.md           # Feature documentation
│   ├── KEYBOARD_SHORTCUTS.md       # Keyboard shortcuts reference
│   ├── BUILD_GUIDE.md              # Building the app
│   ├── API_REFERENCE.md            # Database API documentation
│   ├── CONTRIBUTING.md             # Contribution guidelines
│   └── CHANGELOG.md                # Version history
│
├── 🗄️  supabase/                   # Database
│   └── migrations/                 # SQL migrations
│       └── setup_complete_database.sql
│
├── 📦 src/                         # Source code
│   ├── 📄 main.tsx                 # React entry point
│   ├── 📄 App.tsx                  # Root component
│   ├── 📄 index.css                # Global styles
│   ├── 📄 vite-env.d.ts            # Vite type definitions
│   │
│   ├── 🧩 components/              # React components
│   │   ├── Auth.tsx                # Authentication UI
│   │   ├── Layout.tsx              # App layout shell
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── PointOfSale.tsx         # POS interface
│   │   ├── ProductManagement.tsx   # Inventory management
│   │   ├── TransactionHistory.tsx  # Sales history
│   │   ├── ShopExpenses.tsx        # Expense tracking
│   │   ├── OtherSales.tsx          # Other revenue tracking
│   │   ├── DailySalesReport.tsx    # Daily reports
│   │   └── Settings.tsx            # App settings
│   │
│   ├── 🪝 hooks/                   # Custom React hooks
│   │   ├── useAuth.ts              # Authentication hook
│   │   └── useKeyboardShortcuts.ts # Keyboard shortcuts hook
│   │
│   ├── 📚 lib/                     # Utilities and helpers
│   │   ├── supabase.ts             # Supabase client & DB operations
│   │   └── thermalPrinter.ts       # Receipt printing utilities
│   │
│   └── 🏷️  types/                  # TypeScript definitions
│       └── index.ts                # All type definitions
│
├── 🌐 public/                      # Static assets
│   └── (favicon, images, etc.)
│
├── 📦 node_modules/                # Dependencies (not in git)
│
├── 🏗️  dist/                       # Web build output (not in git)
│
└── 🖥️  dist-electron/              # Electron build output (not in git)
    ├── LeFrut_POS_v1.0.exe         # Windows executable
    └── win-unpacked/               # Unpacked app files
```

---

## 📝 File Descriptions

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, dependencies, scripts |
| `vite.config.ts` | Vite build tool configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.js` | Tailwind CSS customization |
| `eslint.config.js` | Code linting rules |
| `.env` | Environment variables (Supabase credentials) |
| `.gitignore` | Files to exclude from git |

### Electron Files

| File | Purpose |
|------|---------|
| `main.js` | Electron main process (window management) |
| `preload.cjs` | Electron preload script (IPC bridge) |

### Source Code (`src/`)

#### Components (`src/components/`)

**Core Components:**
- `Auth.tsx` - Login/signup forms with Supabase auth
- `Layout.tsx` - App shell with navigation sidebar
- `Dashboard.tsx` - Real-time metrics and summary cards

**Operational Components:**
- `PointOfSale.tsx` - Main POS interface with cart and checkout
- `ProductManagement.tsx` - Product CRUD, bulk upload, stock management
- `TransactionHistory.tsx` - Sales records with search and reprint
- `ShopExpenses.tsx` - Business expense tracking
- `OtherSales.tsx` - Non-product revenue tracking
- `DailySalesReport.tsx` - Daily summary with category-wise totals

**Configuration:**
- `Settings.tsx` - Store info, receipt settings, keyboard shortcuts

#### Hooks (`src/hooks/`)

- `useAuth.ts` - Authentication state management
- `useKeyboardShortcuts.ts` - Global keyboard shortcut handler

#### Library (`src/lib/`)

- `supabase.ts` - Database client and all CRUD operations
- `thermalPrinter.ts` - Receipt formatting and printing utilities

#### Types (`src/types/`)

- `index.ts` - All TypeScript interfaces and types

---

## 🗄️ Database Structure

### Tables

```
products
├── id (uuid, primary key)
├── user_id (uuid, foreign key)
├── name (text)
├── price (numeric)
├── stock_quantity (integer)
├── category (text)
├── image_url (text)
├── is_active (boolean)
├── allow_zero_stock (boolean)
└── created_at (timestamp)

transactions
├── id (uuid, primary key)
├── user_id (uuid, foreign key)
├── total_amount (numeric)
├── payment_method (text)
├── customer_name (text)
├── discount (numeric)
└── created_at (timestamp)

transaction_items
├── id (uuid, primary key)
├── transaction_id (uuid, foreign key)
├── product_id (uuid, foreign key)
├── product_name (text)
├── quantity (integer)
├── unit_price (numeric)
└── total (numeric)

shop_expenses
├── id (uuid, primary key)
├── user_id (uuid, foreign key)
├── category (text)
├── amount (numeric)
├── note (text)
├── date (date)
└── created_at (timestamp)

other_sales
├── id (uuid, primary key)
├── user_id (uuid, foreign key)
├── category (text)
├── amount (numeric)
├── description (text)
├── date (date)
└── created_at (timestamp)
```

### Storage Buckets

```
storage.product-images/
└── {user_id}/
    └── {image_filename}
```

---

## 📚 Documentation Structure

### `docs/` Directory

| File | Content |
|------|---------|
| `SETUP_GUIDE.md` | Complete installation and configuration guide |
| `FEATURES_GUIDE.md` | Detailed documentation of all features |
| `KEYBOARD_SHORTCUTS.md` | All keyboard shortcuts and customization |
| `BUILD_GUIDE.md` | Building web and Electron apps |
| `API_REFERENCE.md` | Database functions and Supabase API |
| `CONTRIBUTING.md` | Development workflow and code standards |
| `CHANGELOG.md` | Version history and release notes |

---

## 🚀 Build Output

### Web Build (`dist/`)

```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-{hash}.js     # Bundled JavaScript
│   └── index-{hash}.css    # Bundled CSS
└── (other static files)
```

Generated by: `npm run build`

### Electron Build (`dist-electron/`)

```
dist-electron/
├── LeFrut_POS_v1.0.exe     # Windows installer/executable
└── win-unpacked/           # Unpacked application files
    ├── LeFrut POS.exe      # Main executable
    ├── resources/          # App resources
    └── (Electron runtime files)
```

Generated by: `npm run package-win`

---

## 🔧 Scripts (package.json)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:5173) |
| `npm run build` | Build web app for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint code linter |
| `npm run electron` | Start Electron app in dev mode |
| `npm run package-win` | Build Windows .exe installer |

---

## 🌍 Environment Variables

### `.env` File

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** Never commit `.env` to version control. Use `.env.example` as template.

---

## 📦 Key Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18.3 | UI library |
| `react-dom` | 18.3 | React DOM renderer |
| `@supabase/supabase-js` | 2.57 | Supabase client |
| `lucide-react` | 0.344 | Icon library |
| `react-window` | 1.8 | Virtualized lists |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | 5.5 | Type safety |
| `vite` | 5.4 | Build tool |
| `electron` | 31.3 | Desktop app wrapper |
| `electron-builder` | 24.13 | App packaging |
| `tailwindcss` | 3.4 | CSS framework |
| `eslint` | 9.9 | Code linting |

---

## 🔒 Security Files

### `.gitignore`

Excludes from version control:
- `node_modules/`
- `dist/` and `dist-electron/`
- `.env` (environment variables)
- `.DS_Store` (macOS files)
- Build artifacts

### Environment Variables

- Stored in `.env` file
- Never committed to git
- Contains Supabase credentials
- Must be configured before running

---

## 🎨 Asset Organization

### Images

- **Product Images**: Stored in Supabase storage
- **App Icons**: In `public/` directory
- **Generated**: Receipt images (temporary)

### Styles

- **Global**: `src/index.css`
- **Component**: Inline with Tailwind classes
- **Utilities**: Tailwind configuration

---

## 📊 Size Information

### Repository Size (without node_modules)
- Source code: ~500 KB
- Documentation: ~100 KB
- Configuration: ~50 KB

### Build Sizes
- Web build: ~300 KB (gzipped)
- Electron app: ~150 MB (includes Chromium runtime)

### Database Storage
- Products table: ~10 KB per 100 products
- Transactions: ~5 KB per 100 transactions
- Images: Variable (typically 100-500 KB per image)

---

## 🧹 What Was Removed

### Deleted Files (Redundant Documentation)

The following files were removed during cleanup:
- Multiple summary files (FINAL_*, QUICK_*, etc.)
- Redundant reference guides
- Old implementation notes
- Duplicate testing guides
- Temporary build notes
- Dead code analysis files

All essential information was consolidated into the `docs/` folder.

---

## 📝 File Naming Conventions

### Components
- PascalCase: `ProductManagement.tsx`
- React functional components
- One component per file

### Utilities
- camelCase: `thermalPrinter.ts`
- Export named functions
- Group related functions

### Documentation
- UPPER_SNAKE_CASE: `FEATURES_GUIDE.md`
- Clear, descriptive names
- Organized in `docs/` folder

---

## 🎯 Quick Navigation

### For Developers
- Start here: `README.md`
- Setup: `docs/SETUP_GUIDE.md`
- API docs: `docs/API_REFERENCE.md`
- Contributing: `docs/CONTRIBUTING.md`

### For Users
- Features: `docs/FEATURES_GUIDE.md`
- Shortcuts: `docs/KEYBOARD_SHORTCUTS.md`
- Updates: `docs/CHANGELOG.md`

### For DevOps
- Build: `docs/BUILD_GUIDE.md`
- Environment: `.env.example`
- Database: `supabase/migrations/`

---

**Last Updated**: February 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
