/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  WAREHOUSE = 'WAREHOUSE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  WALLET = 'WALLET',
  DEBT = 'DEBT',
}

export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  DRAFT = 'DRAFT',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
}

export enum InventoryType {
  IN = 'IN',
  OUT = 'OUT',
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  supplier?: string;
  salePrice: number;
  costAvg: number;
  stock: number;
  minStock: number;
  active: boolean;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  group: 'Lẻ' | 'VIP' | 'Đại lý';
  address: string;
  debt: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
  discountLine: number;
  costAtSale: number;
  lineTotal: number;
  lineProfit: number;
}

export interface Order {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  subtotal: number;
  discountOrder: number;
  shipFee: number;
  vat: number;
  total: number;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  cashReceived?: number;
  cashChange?: number;
}

export interface InventoryLedger {
  id: string;
  sku: string;
  type: InventoryType;
  qty: number;
  unitCost: number;
  refId: string; // Order ID or Receipt ID
  date: string;
  note?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  vatIn: number;
  note: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface AppSettings {
  vatRate: number;
  vatEnabled: boolean;
  shipAsRevenue: boolean;
  allowNegativeStock: boolean;
  hideCostFromCashier: boolean;
  costMethod: 'FIFO' | 'AVERAGE';
  theme: 'light' | 'dark';
  geminiApiKey: string;
  selectedModel: string;
}

export interface AppData {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  ledger: InventoryLedger[];
  expenses: Expense[];
  accounts: UserAccount[];
  settings: AppSettings;
  currentUser: {
    name: string;
    role: UserRole;
  };
}
