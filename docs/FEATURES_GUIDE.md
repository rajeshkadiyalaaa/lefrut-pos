# Le Frut POS - Features Guide

Complete guide to all features and functionality in Le Frut POS system.

---

## Table of Contents

1. [Point of Sale](#point-of-sale)
2. [Inventory Management](#inventory-management)
3. [Financial Tracking](#financial-tracking)
4. [Reports & Analytics](#reports--analytics)
5. [Settings & Configuration](#settings--configuration)
6. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Point of Sale

### Product Selection

**Search Products**
- Type product name in search bar
- Results filter instantly (debounced 300ms)
- Click product card to add to cart
- Keyboard shortcut: `Ctrl + F`

**Category Filtering**
- Filter by: Fresh Fruits, Exotic & Imported, Juices & Cuts
- Click category button to filter
- "All" shows all products

**Virtualized Grid**
- Smooth scrolling with 100+ products
- Only renders visible items for performance
- 4-5 products per row (responsive)

### Cart Management

**Add to Cart**
- Click product card → adds to cart
- Click again → increments quantity
- Out-of-stock warning (unless "Continue Selling" enabled)

**Adjust Quantity**
- Click `+` button to increase
- Click `-` button to decrease
- Remove item when quantity reaches 0
- Or click trash icon to delete immediately

**Custom Pricing**
- Click price/edit icon on cart item
- Enter new price
- Press Enter or click outside to save
- Orange color indicates custom price
- Original price shown with strikethrough

**Discount**
- Enter discount amount in ₹
- Applied to subtotal
- Shows in red in summary
- Saved with transaction

### Payment & Checkout

**Payment Methods**
- Cash
- UPI
- Card (optional)

**Process Payment**
- Select payment method (required)
- Click "Process Payment" or `Ctrl + P`
- Receipt modal appears
- Cart clears automatically
- Stock updates in database

**Auto-Print**
- Enable in Settings
- Automatically prints receipt after sale
- Uses thermal printer format (58mm/80mm)
- Only prints receipt content (not whole page)

### Draft Orders

**Save Draft**
- Click "Save Draft" or `Ctrl + D`
- Saves current cart, customer, discount
- Continue working on other sales

**Load Draft**
- Click "Drafts" or `Ctrl + K`
- Select draft from list
- Cart, customer, discount restored

**Update Draft**
- After loading, modify cart
- Click "Update Draft"
- Saves changes to existing draft

### Packing Slip

**Print Packing Slip**
- Click packing slip icon or `Ctrl + H`
- Thermal format packing slip prints
- Shows order items with quantities
- Use to prepare order physically
- Then click "Process Payment" to complete

---

## Inventory Management

### Product Management

**Add Product**
- Click "Add Product" or `Ctrl + N`
- Fill in details:
  - Name (required)
  - Price (required)
  - Stock Quantity (required)
  - Category (dropdown: Fresh Fruits, Exotic & Imported, Juices & Cuts)
  - Image (optional)
  - Continue Selling at 0 Stock (checkbox)
- Click "Add Product"

**Edit Product**
- Click edit icon on product row
- Modify any field
- Click "Update Product"

**Delete Product**
- Click delete icon
- Confirm deletion
- Product removed from system

**Product Images**
- Upload via file picker
- Stored in Supabase storage
- Displayed on product cards
- CDN-optimized delivery

**Stock Settings**
- **Continue Selling at 0 Stock**: Allow selling when stock = 0
  - Useful for: Made-to-order items, services, digital products
  - When enabled: Shows "Out of stock (Selling)" badge
  - When disabled: Product disabled in POS when stock = 0

**Active/Inactive Toggle**
- Toggle to hide from POS without deleting
- Inactive products don't appear in POS
- View inactive products in Products page

### Bulk Import

**CSV Upload**
- Download sample CSV
- Fill with product data:
  - Name
  - Price
  - Stock Quantity
  - Category (must match: Fresh Fruits, Exotic and Imported Fruits, Juices and Cuts)
  - Image URL (optional)
- Upload CSV file
- Products imported automatically

**Sample CSV Format**
```csv
name,price,stock_quantity,category,image_url
Apple,50,100,Fresh Fruits,
Dragon Fruit,150,20,Exotic and Imported Fruits,
Fresh Orange Juice,80,50,Juices and Cuts,
```

### Product Filtering

**Filter Options**
- All Products
- Active Products
- Inactive Products
- By Category

**Search**
- Search by product name
- Real-time filtering
- Works with all filters

---

## Financial Tracking

### Shop Expenses

**Add Expense**
- Go to "Shop Expenses"
- Click "Add Expense"
- Fill in:
  - Category (Beta, General, Transportation)
  - Amount
  - Note/Description
  - Date (defaults to today)
- Click "Add"

**View Expenses**
- Table view with all expenses
- Search and filter by date
- Edit or delete expenses

**Categories**
- **Beta** (default) - Main operational expenses
- **General** - Miscellaneous expenses
- **Transportation** - Delivery and logistics

### Other Sales

**Add Other Sale**
- Go to "Other Sales"
- Click "Add Other Sale"
- Fill in:
  - Category (Website Cash, Boxes, General)
  - Amount
  - Description
  - Date
- Click "Add"

**View Sales**
- Table with all other sales
- Search and filter
- Edit or delete entries

**Categories**
- **Website Cash** (default) - Online sales
- **Boxes** - Packaging sales
- **General** - Other income

### Transaction History

**View All Transactions**
- Complete list of all sales
- Shows: Bill #, Date, Items, Total, Payment Method
- Search by bill number or date

**Transaction Details**
- Click on any transaction
- View item-level details
- Customer name, discount, subtotal

**Reprint Receipt**
- Click print icon on transaction
- Reprints original receipt
- Uses thermal format
- All details preserved

---

## Reports & Analytics

### Dashboard

**Today's Metrics**
- Total Sales (₹)
- Cash Sales (₹)
- UPI Sales (₹)
- Total Expenses (₹)
- Other Sales (₹)
- Net Cash in Hand

**Calculations**
```
Net Cash = (Cash Sales - Cash Expenses) + Other Sales
```

**Date Filter**
- Today (default)
- This Week
- Custom Range

### Daily Sales Report

**Sales Summary**
- Total sales for the day
- Payment method breakdown:
  - Cash Sales
  - UPI Sales
  - Card Sales
- Number of transactions

**Expenses & Income**
- Shop Expenses total
- Other Sales total

**Category-wise Totals**
- Dynamic cards showing:
  - Shop Expense categories with totals
  - Other Sales categories with totals
- Only shows categories with data (> 0)
- Color-coded:
  - Red background = Expenses
  - Green background = Sales

**Profit Calculation**
```
Daily Profit = Total Sales - Total Expenses + Other Sales
```

---

## Settings & Configuration

### Store Information

**Basic Info**
- Store Name
- Address
- Phone Number
- GST Number

**Receipt Customization**
- Header: Store name, address, phone
- Footer: Thank you message, GST #

### Receipt Settings

**Auto Print**
- Toggle automatic printing after sale
- Thermal printer format (58mm/80mm)
- Silent printing (no browser dialog)

**Print on A5 Paper**
- Toggle for regular printer
- When OFF: Uses thermal format
- When ON: Formats for A5 paper

### Data Management

**Data Reset**
- Deletes transaction history older than 7 days
- Keeps recent data for reporting
- Reduces database size
- Confirmation required

**Important Notes**
- Does not delete products
- Does not delete expenses/other sales
- Only affects transaction history
- Cannot be undone

### Keyboard Shortcuts

**View All Shortcuts**
- Click "Keyboard Shortcuts" in Settings
- Modal shows all available shortcuts
- Organized by category

**Customize Shortcuts** (Coming Soon)
- Edit default shortcuts
- Set custom key combinations
- Save preferences

---

## Keyboard Shortcuts

### Navigation

| Shortcut | Action |
|----------|--------|
| `F1` | Go to Dashboard |
| `F2` | Go to Point of Sale |
| `F3` | Go to Products |
| `F4` | Go to Transactions |
| `F5` | Go to Shop Expenses |
| `F6` | Go to Other Sales |
| `F7` | Go to Daily Report |
| `F8` | Go to Settings |

### Point of Sale

| Shortcut | Action |
|----------|--------|
| `Ctrl + F` | Focus Search Bar |
| `Ctrl + P` | Process Payment |
| `Ctrl + D` | Save Draft |
| `Ctrl + K` | Open Drafts |
| `Ctrl + H` | Print Packing Slip |
| `Escape` | Close Modal |

### Products

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | Add New Product |
| `Ctrl + F` | Focus Search |

### General

| Shortcut | Action |
|----------|--------|
| `Escape` | Close Any Modal |
| `Enter` | Confirm Action |

---

## Tips & Best Practices

### Daily Operations

1. **Start of Day**
   - Check dashboard for yesterday's summary
   - Review stock levels
   - Set up printer and test

2. **During Sales**
   - Use keyboard shortcuts for speed
   - Save drafts for interrupted orders
   - Print packing slips for large orders

3. **End of Day**
   - Review Daily Sales Report
   - Record all expenses
   - Reconcile cash drawer
   - Note any stock discrepancies

### Inventory Management

1. **Keep Stock Updated**
   - Stock auto-updates after sales
   - Manually adjust for waste/damage
   - Enable "Continue Selling" for made-to-order items

2. **Use Images**
   - Upload clear product images
   - Helps staff identify products quickly
   - Professional appearance

3. **Organize Categories**
   - Use consistent categorization
   - Makes filtering easier
   - Better for reporting

### Financial Tracking

1. **Record All Expenses**
   - Log expenses immediately
   - Use correct categories
   - Add detailed notes

2. **Reconcile Daily**
   - Check cash vs. system totals
   - Investigate discrepancies
   - Keep physical receipts

3. **Regular Data Cleanup**
   - Use Data Reset monthly
   - Export important reports first
   - Keep system performant

---

## Troubleshooting

### Common Issues

**Search not working**
- Check product is marked "Active"
- Verify spelling
- Clear search and try again

**Product out of stock**
- Check stock quantity
- Enable "Continue Selling" if needed
- Or restock the product

**Auto-print not working**
- Verify printer is connected
- Check printer is default printer
- Enable auto-print in Settings
- Test with manual print first

**Receipt prints whole page**
- Fixed in v1.0
- Update to latest version
- Use thermal printer format

---

## Support

For additional help:
1. Check [Setup Guide](SETUP_GUIDE.md)
2. Review [Keyboard Shortcuts](KEYBOARD_SHORTCUTS.md)
3. See [Build Guide](BUILD_GUIDE.md) for deployment
4. Check browser console for errors

---

**Last Updated**: February 2026  
**Version**: 1.0
