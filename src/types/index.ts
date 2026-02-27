export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  barcode?: string;
  description?: string;
  image_url: string;
  is_active?: boolean;
  allow_zero_stock?: boolean; // Continue selling when stock is 0
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'purchase';
  total_amount: number;
  subtotal: number;
  discount: number;
  tax: number;
  payment_method: string;
  customer_name?: string;
  notes?: string;
  created_at: string;
  user_id: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number; // Allow price override per item
  total: number;
}

export interface DashboardStats {
  todaysSales: number;
  totalProductsSold: number;
  totalTransactions: number;
  topProducts: Array<{
    product: Product;
    quantity: number;
    revenue: number;
  }>;
  lowStockProducts: Product[];
}

export interface ShopExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  user_id: string;
  created_at: string;
}

export interface OtherSale {
  id: string;
  description: string;
  amount: number;
  category: string;
  user_id: string;
  created_at: string;
}

export interface DailySalesReport {
  date: string;
  total_cash_sales: number;
  total_upi_sales: number;
  total_other_sales: number;
  total_expenses: number;
  total_cash_in_box: number;
  net_profit: number;
  transactions: Transaction[];
  expenses: ShopExpense[];
  other_sales: OtherSale[];
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'cashier';
}