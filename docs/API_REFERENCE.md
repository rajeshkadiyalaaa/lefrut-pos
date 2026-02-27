# API Reference - Supabase Functions

Documentation for all database operations in Le Frut POS.

---

## Database Client

Location: `src/lib/supabase.ts`

### Initialization

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Products

### Get Products

```typescript
async getProducts(includeInactive: boolean = false): Promise<Product[]>

// Usage
const products = await db.getProducts(false); // Active only
const allProducts = await db.getProducts(true); // Include inactive
```

**Parameters:**
- `includeInactive` (boolean): Include inactive products if true

**Returns:** Array of Product objects

**Product Type:**
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category: string;
  image_url?: string;
  is_active?: boolean;
  allow_zero_stock?: boolean;
  created_at: string;
  user_id: string;
}
```

### Add Product

```typescript
async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product>

// Usage
const newProduct = await db.addProduct({
  name: 'Apple',
  price: 50,
  stock_quantity: 100,
  category: 'Fresh Fruits',
  image_url: 'https://...',
  is_active: true,
  allow_zero_stock: false,
  user_id: session.user.id
});
```

**Parameters:**
- `product` (object): Product data without id and created_at

**Returns:** Created Product object

### Update Product

```typescript
async updateProduct(id: string, updates: Partial<Product>): Promise<Product>

// Usage
const updated = await db.updateProduct('product-id', {
  price: 55,
  stock_quantity: 90
});
```

**Parameters:**
- `id` (string): Product ID
- `updates` (object): Fields to update

**Returns:** Updated Product object

### Delete Product

```typescript
async deleteProduct(id: string): Promise<void>

// Usage
await db.deleteProduct('product-id');
```

**Parameters:**
- `id` (string): Product ID

**Returns:** void

### Update Stock

```typescript
async updateStock(productId: string, quantitySold: number): Promise<void>

// Usage
await db.updateStock('product-id', 5); // Reduce stock by 5
```

**Parameters:**
- `productId` (string): Product ID
- `quantitySold` (number): Quantity to deduct from stock

**Returns:** void

---

## Transactions

### Get Transactions

```typescript
async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]>

// Usage
const today = new Date();
const transactions = await db.getTransactions(today, today);
```

**Parameters:**
- `startDate` (Date, optional): Filter from date
- `endDate` (Date, optional): Filter to date

**Returns:** Array of Transaction objects

**Transaction Type:**
```typescript
interface Transaction {
  id: string;
  user_id: string;
  total_amount: number;
  payment_method: 'Cash' | 'UPI' | 'Card';
  customer_name?: string;
  discount: number;
  items: TransactionItem[];
  created_at: string;
}

interface TransactionItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}
```

### Add Transaction

```typescript
async addTransaction(transaction: {
  items: CartItem[];
  total_amount: number;
  payment_method: string;
  customer_name?: string;
  discount: number;
}): Promise<Transaction>

// Usage
const transaction = await db.addTransaction({
  items: cartItems,
  total_amount: 250,
  payment_method: 'Cash',
  customer_name: 'John Doe',
  discount: 10
});
```

**Parameters:**
- `transaction` (object): Transaction data

**Returns:** Created Transaction object

### Get Transaction by ID

```typescript
async getTransactionById(id: string): Promise<Transaction>

// Usage
const transaction = await db.getTransactionById('transaction-id');
```

**Parameters:**
- `id` (string): Transaction ID

**Returns:** Transaction object

---

## Shop Expenses

### Get Expenses

```typescript
async getExpenses(startDate?: Date, endDate?: Date): Promise<ShopExpense[]>

// Usage
const expenses = await db.getExpenses();
```

**Parameters:**
- `startDate` (Date, optional): Filter from date
- `endDate` (Date, optional): Filter to date

**Returns:** Array of ShopExpense objects

**ShopExpense Type:**
```typescript
interface ShopExpense {
  id: string;
  user_id: string;
  category: 'Beta' | 'General' | 'Transportation';
  amount: number;
  note?: string;
  date: string;
  created_at: string;
}
```

### Add Expense

```typescript
async addExpense(expense: Omit<ShopExpense, 'id' | 'created_at'>): Promise<ShopExpense>

// Usage
const expense = await db.addExpense({
  category: 'Beta',
  amount: 500,
  note: 'Staff salaries',
  date: new Date().toISOString(),
  user_id: session.user.id
});
```

**Parameters:**
- `expense` (object): Expense data

**Returns:** Created ShopExpense object

### Update Expense

```typescript
async updateExpense(id: string, updates: Partial<ShopExpense>): Promise<ShopExpense>

// Usage
const updated = await db.updateExpense('expense-id', {
  amount: 550,
  note: 'Updated note'
});
```

**Parameters:**
- `id` (string): Expense ID
- `updates` (object): Fields to update

**Returns:** Updated ShopExpense object

### Delete Expense

```typescript
async deleteExpense(id: string): Promise<void>

// Usage
await db.deleteExpense('expense-id');
```

**Parameters:**
- `id` (string): Expense ID

**Returns:** void

---

## Other Sales

### Get Other Sales

```typescript
async getOtherSales(startDate?: Date, endDate?: Date): Promise<OtherSale[]>

// Usage
const sales = await db.getOtherSales();
```

**Parameters:**
- `startDate` (Date, optional): Filter from date
- `endDate` (Date, optional): Filter to date

**Returns:** Array of OtherSale objects

**OtherSale Type:**
```typescript
interface OtherSale {
  id: string;
  user_id: string;
  category: 'Website Cash' | 'Boxes' | 'General';
  amount: number;
  description?: string;
  date: string;
  created_at: string;
}
```

### Add Other Sale

```typescript
async addOtherSale(sale: Omit<OtherSale, 'id' | 'created_at'>): Promise<OtherSale>

// Usage
const sale = await db.addOtherSale({
  category: 'Website Cash',
  amount: 1000,
  description: 'Online order payment',
  date: new Date().toISOString(),
  user_id: session.user.id
});
```

**Parameters:**
- `sale` (object): Sale data

**Returns:** Created OtherSale object

### Update Other Sale

```typescript
async updateOtherSale(id: string, updates: Partial<OtherSale>): Promise<OtherSale>

// Usage
const updated = await db.updateOtherSale('sale-id', {
  amount: 1100
});
```

**Parameters:**
- `id` (string): Sale ID
- `updates` (object): Fields to update

**Returns:** Updated OtherSale object

### Delete Other Sale

```typescript
async deleteOtherSale(id: string): Promise<void>

// Usage
await db.deleteOtherSale('sale-id');
```

**Parameters:**
- `id` (string): Sale ID

**Returns:** void

---

## Storage

### Upload Product Image

```typescript
async uploadProductImage(file: File): Promise<string>

// Usage
const imageUrl = await db.uploadProductImage(file);
```

**Parameters:**
- `file` (File): Image file to upload

**Returns:** Public URL string

**Storage Bucket:** `product-images`

**Supported Formats:**
- image/jpeg
- image/png
- image/webp

**Max Size:** 5MB

### Delete Product Image

```typescript
async deleteProductImage(imageUrl: string): Promise<void>

// Usage
await db.deleteProductImage('https://...product-images/abc123.jpg');
```

**Parameters:**
- `imageUrl` (string): Full public URL of image

**Returns:** void

---

## Authentication

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

### Get Session

```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Get User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

## Real-time Subscriptions

### Subscribe to Products Changes

```typescript
const subscription = supabase
  .channel('products_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'products'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

### Subscribe to Transactions

```typescript
const subscription = supabase
  .channel('transactions_changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'transactions'
  }, (payload) => {
    console.log('New transaction!', payload);
  })
  .subscribe();
```

---

## Error Handling

All database functions throw errors that should be caught:

```typescript
try {
  const products = await db.getProducts();
} catch (error) {
  console.error('Failed to fetch products:', error);
  // Handle error appropriately
}
```

**Common Error Codes:**
- `PGRST301` - Foreign key violation
- `PGRST116` - Row not found
- `23505` - Unique violation
- `23503` - Foreign key violation

---

## Database Migrations

Location: `supabase/migrations/`

### Run Migration

```sql
-- In Supabase SQL Editor
-- Copy contents from migration file and run
```

### Create New Migration

```sql
-- Create new .sql file in supabase/migrations/
-- Name format: YYYYMMDD_description.sql
```

---

## Security - Row Level Security (RLS)

All tables have RLS enabled with policies:

### Products Policy
```sql
-- Users can only access their own products
CREATE POLICY "Users can access own products"
ON products FOR ALL
USING (auth.uid() = user_id);
```

### Transactions Policy
```sql
-- Users can only access their own transactions
CREATE POLICY "Users can access own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id);
```

### Storage Policy
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Performance Tips

1. **Use Indexes:**
   - All foreign keys are indexed
   - created_at columns are indexed
   - user_id columns are indexed

2. **Batch Operations:**
   ```typescript
   // Instead of multiple single inserts
   const { data } = await supabase
     .from('products')
     .insert(productsArray); // Batch insert
   ```

3. **Select Specific Columns:**
   ```typescript
   const { data } = await supabase
     .from('products')
     .select('id, name, price') // Only needed columns
     .eq('is_active', true);
   ```

4. **Pagination:**
   ```typescript
   const { data } = await supabase
     .from('transactions')
     .select('*')
     .range(0, 9) // First 10 records
     .order('created_at', { ascending: false });
   ```

---

## Rate Limits

Supabase Free Tier Limits:
- **Database**: 500MB storage
- **Storage**: 1GB
- **Auth**: Unlimited users
- **API Requests**: 500,000/month
- **Realtime**: 200 concurrent connections

---

## Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Discord](https://discord.supabase.com)

---

**Last Updated**: February 2026  
**Version**: 1.0
