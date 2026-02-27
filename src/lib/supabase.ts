import { createClient } from '@supabase/supabase-js';
import type { Product, Category, Transaction, TransactionItem, ShopExpense, OtherSale } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Image upload function
export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `product-images/${fileName}`;

  // Race the upload against a timeout to avoid UI hanging indefinitely
  const timeoutMs = 20000; // 20s safeguard
  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Image upload timed out. Please check your network and try again.'));
    }, timeoutMs);
  });

  const uploadPromise = (async () => {
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);
    if (uploadError) throw uploadError;
  })();

  await Promise.race([uploadPromise, timeoutPromise]);

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Database operations
export const db = {
  // Products
  async getProducts(includeInactive = false) {
    let query = supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, is_active: true }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    // Soft delete: mark as inactive instead of hard delete
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Transactions
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>, items: Omit<TransactionItem, 'id' | 'transaction_id' | 'product'>[]) {
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (transactionError) throw transactionError;

    const itemsWithTransactionId = items.map(item => ({
      ...item,
      transaction_id: transactionData.id
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(itemsWithTransactionId);
    
    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of items) {
      const stockChange = transaction.type === 'sale' ? -item.quantity : item.quantity;
      
      // Get current stock
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();
      
      if (product) {
        const newStock = product.stock_quantity + stockChange;
        await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, newStock) })
          .eq('id', item.product_id);
      }
    }

    return transactionData;
  },

  async getTransactions(limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (
          *,
          product:products (*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getTodaysTransactions() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (
          *,
          product:products (*)
        )
      `)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Shop Expenses
  async getShopExpenses(date?: string) {
    let query = supabase
      .from('shop_expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (date) {
      query = query.gte('created_at', `${date}T00:00:00`)
                   .lte('created_at', `${date}T23:59:59`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createShopExpense(expense: Omit<ShopExpense, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('shop_expenses')
      .insert([expense])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteShopExpense(id: string) {
    const { error } = await supabase
      .from('shop_expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Other Sales
  async getOtherSales(date?: string) {
    let query = supabase
      .from('other_sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (date) {
      query = query.gte('created_at', `${date}T00:00:00`)
                   .lte('created_at', `${date}T23:59:59`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createOtherSale(sale: Omit<OtherSale, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('other_sales')
      .insert([sale])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteOtherSale(id: string) {
    const { error } = await supabase
      .from('other_sales')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Bulk product operations
  async bulkCreateProducts(products: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabase
      .from('products')
      .insert(products.map(product => ({ ...product, is_active: true })))
      .select();
    
    if (error) throw error;
    return data;
  },

  async bulkUpdateProducts(products: { id: string; updates: Partial<Product> }[]) {
    const results = [];
    for (const { id, updates } of products) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      results.push(data);
    }
    return results;
  },
  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's sales
    const { data: todaysSales } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('type', 'sale')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    // Top products
    const { data: topProducts } = await supabase
      .from('transaction_items')
      .select(`
        quantity,
        total_price,
        product:products (*)
      `)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    // Low stock products
    const { data: lowStock } = await supabase
      .from('products')
      .select('*')
      .lte('stock_quantity', 10)
      .order('stock_quantity');

    // Process top products with correct structure
    const processedTopProducts = topProducts?.map(item => ({
      product: item.product?.[0] || item.product,
      quantity: Number(item.quantity) || 0,
      revenue: Number(item.total_price) || 0
    })) || [];

    return {
      todaysSales: todaysSales?.reduce((sum, t) => sum + t.total_amount, 0) || 0,
      totalProductsSold: topProducts?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      totalTransactions: todaysSales?.length || 0,
      topProducts: processedTopProducts,
      lowStockProducts: lowStock || []
    };
  },

  async getDailySalesReport(date: string) {
    const [transactions, expenses, otherSales] = await Promise.all([
      this.getTodaysTransactions(),
      this.getShopExpenses(date),
      this.getOtherSales(date)
    ]);

    const cashSales = transactions.filter(t => t.payment_method.toLowerCase() === 'cash').reduce((sum, t) => sum + t.total_amount, 0);
    const upiSales = transactions.filter(t => t.payment_method.toLowerCase() === 'upi').reduce((sum, t) => sum + t.total_amount, 0);
    const totalOtherSales = otherSales.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCashInBox = cashSales + totalOtherSales - totalExpenses;

    return {
      date, 
      cashSales, 
      upiSales, 
      totalOtherSales,
      totalExpenses, 
      totalCashInBox,
      transactions, 
      expenses,
      otherSales,
      netProfit: (cashSales + upiSales + totalOtherSales) - totalExpenses
    };
  },

  /**
   * Purge transaction-related data older than the provided cutoff (ISO string),
   * preserving the most recent 7 days. Products are NOT touched.
   * - Deletes in batches, first from `transaction_items`, then `transactions`.
   * - Calls onProgress(percentage) between 1 and 100 as it proceeds.
   */
  async purgeOldTransactions(cutoffISO: string, onProgress?: (p: number) => void) {
    // Get total count of transactions to purge for progress tracking
    const { count: totalCount, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoffISO);
    if (countError) throw countError;

    const total = totalCount || 0;
    if (total === 0) {
      onProgress?.(100);
      return { total, deleted: 0 };
    }

    let deleted = 0;
    const batchSize = 100;
    // Loop: fetch IDs in ascending order to keep batches stable
    // Use a moving cursor on created_at + id for stable pagination if needed; here small-medium datasets are expected
    // We'll simply fetch by cutoff each round until no more.
    while (true) {
      const { data: idsBatch, error: fetchError } = await supabase
        .from('transactions')
        .select('id')
        .lt('created_at', cutoffISO)
        .order('created_at', { ascending: true })
        .limit(batchSize);
      if (fetchError) throw fetchError;
      if (!idsBatch || idsBatch.length === 0) break;

      const ids = idsBatch.map(r => r.id);

      // Delete child rows first
      const { error: delItemsError } = await supabase
        .from('transaction_items')
        .delete()
        .in('transaction_id', ids);
      if (delItemsError) throw delItemsError;

      // Delete parent transactions
      const { error: delTxError } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids);
      if (delTxError) throw delTxError;

      deleted += ids.length;
      const percent = Math.min(100, Math.max(1, Math.floor((deleted / total) * 100)));
      onProgress?.(percent);

      // Small delay to avoid rate-limit spikes and allow UI updates
      await new Promise(r => setTimeout(r, 30));
    }

    onProgress?.(100);
    return { total, deleted };
  }
};