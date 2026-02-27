# 🍋 Welcome to Le Frut POS v1.0

> **A professional, feature-rich Point of Sale system for fruit shops and small retail businesses**

---

## 🚀 Quick Start for Developers

### 1️⃣ Read This First
👉 **[README.md](README.md)** - Complete project overview, features, and setup

### 2️⃣ Set Up Your Environment
👉 **[docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Installation and configuration

### 3️⃣ Understand the Project Structure  
👉 **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete file organization

---

## 📚 Documentation Guide

### For Developers

| Document | What You'll Find |
|----------|-----------------|
| **[README.md](README.md)** | Project overview, features, tech stack, quick start |
| **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** | Complete file and folder organization |
| **[docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** | Step-by-step installation guide |
| **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** | Database functions, types, examples |
| **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** | Development workflow, code standards |
| **[docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md)** | Building web and desktop apps |

### For Users

| Document | What You'll Find |
|----------|-----------------|
| **[docs/FEATURES_GUIDE.md](docs/FEATURES_GUIDE.md)** | Complete feature documentation |
| **[docs/KEYBOARD_SHORTCUTS.md](docs/KEYBOARD_SHORTCUTS.md)** | All keyboard shortcuts |
| **[docs/CHANGELOG.md](docs/CHANGELOG.md)** | Version history and updates |

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production (web)
npm run build

# Build desktop app (Windows)
npm run package-win

# Run linter
npm run lint
```

---

## 📁 Project Organization

```
Lefrut_Pos_v4/
│
├── 📖 START_HERE.md          ← You are here!
├── 📄 README.md               ← Main documentation
├── 📄 PROJECT_STRUCTURE.md    ← File organization guide
├── 📄 CLEANUP_SUMMARY.md      ← What we cleaned up
│
├── 📚 docs/                   ← All documentation
│   ├── SETUP_GUIDE.md         ← Installation guide
│   ├── FEATURES_GUIDE.md      ← Feature documentation
│   ├── API_REFERENCE.md       ← Database API docs
│   ├── KEYBOARD_SHORTCUTS.md  ← Shortcuts reference
│   ├── BUILD_GUIDE.md         ← Build instructions
│   ├── CONTRIBUTING.md        ← Development guidelines
│   └── CHANGELOG.md           ← Version history
│
├── 📦 src/                    ← Source code
│   ├── components/            ← React components
│   ├── hooks/                 ← Custom hooks
│   ├── lib/                   ← Utilities
│   └── types/                 ← TypeScript types
│
├── 🗄️ supabase/               ← Database
│   └── migrations/            ← SQL migrations
│
└── ⚙️ Config files            ← vite, tailwind, etc.
```

---

## ✨ Key Features

### 🏪 Point of Sale
- Real-time product search
- Shopping cart with quantity controls
- Multiple payment methods (Cash, UPI, Card)
- Custom pricing and discounts
- Draft orders
- Thermal receipt printing

### 📦 Inventory Management
- Product CRUD with images
- Stock tracking
- Bulk CSV import
- Category management
- Active/Inactive toggle

### 💰 Financial Tracking
- Transaction history
- Shop expenses
- Other sales tracking
- Daily reports with category breakdowns

### ⌨️ Keyboard Shortcuts
- Full keyboard navigation
- Customizable shortcuts
- Speed up operations

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript 5.5
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Desktop**: Electron 31.3
- **Icons**: Lucide React

---

## 🎯 What's New in This Cleanup

### ✅ Created
- **Professional README** with comprehensive documentation
- **8 organized documentation files** in `docs/` folder
- **API Reference** with complete database documentation
- **Contributing Guide** with development workflow
- **Changelog** with version history
- **Project Structure** guide
- **Environment template** (.env.example)

### 🗑️ Removed
- **38 redundant documentation files** 
- Duplicate summaries, quick references, old notes
- All essential info consolidated into organized docs

### 📊 Result
- **Clean root directory** (only 3 docs: README, PROJECT_STRUCTURE, CLEANUP_SUMMARY)
- **Organized docs folder** (7 comprehensive guides)
- **Easy navigation** with clear file purposes
- **Professional structure** following industry standards

See **[CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md)** for complete details.

---

## 🆘 Need Help?

### Common Questions

**"Where do I start?"**  
→ Read [README.md](README.md) then [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

**"How do I use feature X?"**  
→ Check [docs/FEATURES_GUIDE.md](docs/FEATURES_GUIDE.md)

**"How do I add a new feature?"**  
→ Read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

**"How do I build the app?"**  
→ Follow [docs/BUILD_GUIDE.md](docs/BUILD_GUIDE.md)

**"What keyboard shortcuts are available?"**  
→ See [docs/KEYBOARD_SHORTCUTS.md](docs/KEYBOARD_SHORTCUTS.md)

---

## 📞 Support

1. **Check Documentation** - All guides in `docs/` folder
2. **Review Code Comments** - Inline documentation in source
3. **Check Browser Console** - For runtime errors
4. **Supabase Dashboard** - For database issues

---

## 🎉 You're All Set!

The project is now **clean, organized, and developer-friendly**.

Start with **[README.md](README.md)** and happy coding! 🚀

---

<div align="center">

**Le Frut POS v1.0** • Built with ❤️ for small businesses

**[Documentation](docs/)** • **[Features](docs/FEATURES_GUIDE.md)** • **[API](docs/API_REFERENCE.md)**

</div>

---

**Last Updated**: February 27, 2026  
**Status**: ✅ Production Ready  
**Documentation**: ✅ Complete & Organized
