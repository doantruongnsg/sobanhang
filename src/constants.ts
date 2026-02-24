/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppData, UserRole, PaymentMethod, OrderStatus, InventoryType, UserAccount } from './types';

const DEFAULT_ACCOUNTS: UserAccount[] = [
  { id: 'ACC001', username: 'admin', password: 'admin123', name: 'Quản trị viên', role: UserRole.ADMIN, active: true },
  { id: 'ACC002', username: 'cashier', password: 'cashier123', name: 'Thu ngân', role: UserRole.CASHIER, active: true },
  { id: 'ACC003', username: 'warehouse', password: 'warehouse123', name: 'Thủ kho', role: UserRole.WAREHOUSE, active: true },
];

export const INITIAL_DATA: AppData = {
  products: [
    { sku: 'SP001', name: 'Áo thun Cotton Basic', category: 'Thời trang', supplier: 'Xưởng may Việt Tiến', salePrice: 150000, costAvg: 80000, stock: 50, minStock: 10, active: true },
    { sku: 'SP002', name: 'Quần Jean Slimfit', category: 'Thời trang', supplier: 'Xưởng may Việt Tiến', salePrice: 350000, costAvg: 200000, stock: 5, minStock: 10, active: true },
    { sku: 'SP003', name: 'Giày Sneaker White', category: 'Giày dép', supplier: 'Kho sỉ Giày HN', salePrice: 550000, costAvg: 320000, stock: 15, minStock: 5, active: true },
    { sku: 'SP004', name: 'Mũ lưỡi trai NY', category: 'Phụ kiện', supplier: 'Tổng kho Phụ kiện Q5', salePrice: 120000, costAvg: 45000, stock: 0, minStock: 5, active: true },
    { sku: 'SP005', name: 'Tất cổ cao (Set 3)', category: 'Phụ kiện', supplier: 'Tổng kho Phụ kiện Q5', salePrice: 45000, costAvg: 15000, stock: 100, minStock: 20, active: true },
  ],
  customers: [
    { id: 'KH001', phone: '0901234567', name: 'Nguyễn Văn A', group: 'VIP', address: 'Quận 1, TP.HCM', debt: 0, totalOrders: 12, totalSpent: 5400000, lastOrderDate: '2024-02-20' },
    { id: 'KH002', phone: '0912345678', name: 'Trần Thị B', group: 'Lẻ', address: 'Quận 7, TP.HCM', debt: 150000, totalOrders: 2, totalSpent: 850000, lastOrderDate: '2024-02-15' },
    { id: 'KH003', phone: '0987654321', name: 'Lê Văn C', group: 'Đại lý', address: 'Bình Dương', debt: 0, totalOrders: 5, totalSpent: 15200000, lastOrderDate: '2024-02-22' },
  ],
  orders: [],
  ledger: [],
  expenses: [
    { id: 'CP001', date: '2024-02-01', category: 'Mặt bằng', amount: 5000000, vatIn: 0, note: 'Tiền thuê tháng 2' },
    { id: 'CP002', date: '2024-02-05', category: 'Marketing', amount: 2000000, vatIn: 200000, note: 'Chạy quảng cáo FB' },
  ],
  accounts: DEFAULT_ACCOUNTS,
  settings: {
    vatRate: 10,
    vatEnabled: true,
    shipAsRevenue: true,
    allowNegativeStock: false,
    hideCostFromCashier: true,
    costMethod: 'AVERAGE',
    theme: 'light',
    geminiApiKey: '',
    selectedModel: 'gemini-3-flash-preview',
  },
  currentUser: {
    name: 'Admin',
    role: UserRole.ADMIN,
  },
};

const STORAGE_KEY = 'so_ban_hang_pro_data';

export const storage = {
  get: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_DATA;
    try {
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_DATA;
    }
  },
  save: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
};
