# 🖥️ Electron Desktop App - Build & Troubleshooting Guide

## ✅ Fixes Applied for Electron Freezing Issues

The following issues have been fixed to prevent freezing in the .exe version:

### 1. **Window Opening Restrictions** ✅
- **Problem**: Electron was blocking all new windows, causing print dialogs to fail
- **Fix**: Updated `setWindowOpenHandler` to allow internal windows (about:, blob:, data:) for printing
- **File**: `main.js`

### 2. **Sandbox Mode Issues** ✅
- **Problem**: Sandbox mode was causing freezes with database operations and printing
- **Fix**: Disabled sandbox mode in main window (`sandbox: false`)
- **File**: `main.js`

### 3. **Print Method Compatibility** ✅
- **Problem**: Thermal printer was using iframe method which doesn't work well in Electron
- **Fix**: Added Electron detection and uses `window.open()` for printing in Electron
- **File**: `src/lib/thermalPrinter.ts`

### 4. **Error Handling** ✅
- **Problem**: Unhandled errors could freeze the entire app
- **Fix**: Added global error handlers and crash recovery
- **File**: `main.js`

---

## 🚀 Building the Electron App

### Step 1: Build the Frontend
```bash
# Make sure you're in the project directory
cd /Users/kadiyalarajesh/Downloads/Lefrut_Pos_v4

# Build the Vite frontend
npm run build
```

This creates the `build/` directory with compiled files.

### Step 2: Package the Electron App
```bash
# Build Windows .exe
npm run package-win
```

The .exe file will be created in: `dist-electron/LeFrut_POS_v1.0.exe`

---

## 🧪 Testing the Electron App

### Test in Development Mode
```bash
# First build the frontend
npm run build

# Then run electron
npm run electron
```

### What to Test:
1. ✅ **Sale Processing**
   - Complete a sale
   - Check if app remains responsive
   - Search should work immediately after sale

2. ✅ **Printing**
   - Try manual printing (click Print button)
   - Try auto-print (enable in Settings)
   - Should only print receipt, not whole window

3. ✅ **Database Operations**
   - Add/edit products
   - View transactions
   - Generate reports

4. ✅ **Multiple Sales**
   - Process 5-10 sales in a row
   - App should not slow down or freeze

---

## 🔧 Common Electron Issues & Solutions

### Issue 1: App Freezes After Sale
**Solution**: Already fixed! The app now:
- Properly handles async operations
- Has fallback error handling
- Resets all states correctly

### Issue 2: Print Dialog Opens Whole Window
**Solution**: Already fixed! Now:
- Detects Electron environment
- Uses window.open() for printing
- Only prints the receipt content

### Issue 3: Database Connection Timeout
**Symptoms**: App freezes when loading products or saving transactions

**Solution**:
1. Check your internet connection (Supabase requires internet)
2. Verify `.env` file is included in build
3. Check Windows Firewall isn't blocking the app

**How to fix**:
```bash
# Make sure .env is copied to build folder
# Add to package.json build files:
"build": {
  "files": [
    "build/**",
    "main.js",
    "preload.cjs",
    ".env",  // <-- Add this
    "package.json"
  ]
}
```

### Issue 4: Images Not Loading
**Symptoms**: Product images show as broken

**Solution**: Images are loaded from Supabase CDN - requires internet connection. No fix needed.

### Issue 5: App Won't Start
**Solution**:
1. Delete `dist-electron` folder
2. Rebuild: `npm run build && npm run package-win`
3. Run the new .exe

---

## 📋 Pre-Build Checklist

Before building the .exe, ensure:

- [ ] Frontend builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] .env file has correct Supabase credentials
- [ ] Tested in dev mode (`npm run electron`)
- [ ] All features work in electron dev mode
- [ ] Print functionality tested

---

## 🎯 Performance Tips for Electron

### 1. **Optimize Product Loading**
If you have 1000+ products, consider:
- Pagination in product list
- Virtual scrolling (already implemented)
- Lazy loading images

### 2. **Database Query Optimization**
- Limit transaction queries (already set to 50-100)
- Use date filters when loading reports
- Don't load all transactions at once

### 3. **Memory Management**
The app automatically:
- Cleans up print windows
- Removes unused iframes
- Handles crashes gracefully

---

## 🐛 Debugging Electron App

### Enable DevTools in Production
The app now has devTools enabled. To open:

**Windows**: Press `Ctrl + Shift + I`

**Mac**: Press `Cmd + Option + I`

### View Console Logs
Check for errors in:
1. DevTools Console
2. Terminal (if running `npm run electron`)

### Common Error Messages

**"Failed to load resource"**
- Missing file in build folder
- Run `npm run build` again

**"Cannot read properties of undefined"**
- State management issue
- Check console for specific line
- Usually caused by async timing

**"Print failed"**
- Printer not connected
- Try with PDF printer first
- Check printer drivers

---

## 📦 Distribution

### Installer Creation
The current setup creates a **portable .exe** file.

To create an installer:
```json
// In package.json, update build config:
"build": {
  "nsis": {
    "oneClick": false,  // <-- Change to false
    "allowToChangeInstallationDirectory": true,  // <-- Enable
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

### Code Signing (Optional)
For production release:
1. Get a code signing certificate
2. Add to electron-builder config
3. App won't show "Unknown Publisher" warning

---

## 🔍 System Requirements

### Minimum Requirements:
- **OS**: Windows 10 or later
- **RAM**: 4 GB
- **Disk**: 100 MB free space
- **Internet**: Required (for Supabase database)

### Recommended:
- **OS**: Windows 11
- **RAM**: 8 GB or more
- **Internet**: Stable broadband connection

---

## 📞 Support & Troubleshooting

### Still Having Issues?

1. **Check the console**: Open DevTools and look for errors
2. **Test in browser**: Run `npm run dev` and test there first
3. **Rebuild from scratch**:
   ```bash
   rm -rf dist-electron build node_modules
   npm install
   npm run build
   npm run package-win
   ```

### Error Logs Location

Windows Event Viewer might show crash logs:
- Open Event Viewer
- Go to Windows Logs > Application
- Look for errors from "Electron" or "LeFrut"

---

## ✅ Verification Steps

After building, verify:

1. ✅ .exe file exists in `dist-electron/`
2. ✅ File size is reasonable (50-150 MB)
3. ✅ Double-clicking .exe launches the app
4. ✅ Login works
5. ✅ Can add products
6. ✅ Can process sales
7. ✅ Printing works
8. ✅ App doesn't freeze after multiple operations

---

## 🎉 Success!

If all the above works, your Electron app is ready for use!

**Build Date**: Auto-generated on build  
**Version**: 1.0.0  
**Platform**: Windows 64-bit

---

**Need help?** Check the console logs first, then review this guide.

