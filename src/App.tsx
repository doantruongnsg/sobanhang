/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Trash2,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Briefcase,
  History,
  Download,
  Upload,
  UserCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Printer,
  Save,
  CreditCard,
  Wallet,
  Banknote,
  ArrowRightLeft,
  Pencil,
  Lock,
  ClipboardList,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './constants';
import { AppData, UserRole, PaymentMethod, PaymentStatus, OrderStatus, InventoryType, Product, Customer, Order, OrderItem, InventoryLedger, UserAccount } from './types';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { callGeminiAI, generateInventorySuggestions, AI_MODELS } from './services/geminiService';
import { Key } from 'lucide-react';
import Markdown from 'react-markdown';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      : 'text-slate-600 hover:bg-slate-100'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, icon: Icon, color }: { title: string, value: string, trend?: string, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

// --- Login Page ---
const LoginPage = ({ onLogin, accounts }: { onLogin: (account: UserAccount) => void, accounts: UserAccount[] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const account = accounts.find(
        a => a.username === username && a.password === password && a.active
      );
      if (account) {
        sessionStorage.setItem('auth_user_id', account.id);
        onLogin(account);
      } else {
        setError('Sai tài khoản hoặc mật khẩu!');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
              <Briefcase size={36} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Sổ Bán Hàng Pro</h1>
            <p className="text-blue-200/70 text-sm mt-2">Đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider mb-2 block">Tài khoản</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-blue-200/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập tên đăng nhập..."
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-blue-200/80 uppercase tracking-wider mb-2 block">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/50" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white placeholder-blue-200/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-200 text-sm"
                >
                  <AlertTriangle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={22} />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-blue-200/40 text-xs">Tài khoản mặc định: admin / admin123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [data, setData] = useState<AppData>(() => {
    const saved = storage.get();
    // Ensure accounts exist for backward compatibility
    if (!saved.accounts || saved.accounts.length === 0) {
      saved.accounts = [
        { id: 'ACC001', username: 'admin', password: 'admin123', name: 'Quản trị viên', role: UserRole.ADMIN, active: true },
        { id: 'ACC002', username: 'cashier', password: 'cashier123', name: 'Thu ngân', role: UserRole.CASHIER, active: true },
        { id: 'ACC003', username: 'warehouse', password: 'warehouse123', name: 'Thủ kho', role: UserRole.WAREHOUSE, active: true },
      ];
    }
    return saved;
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('auth_user_id');
  });

  // POS State
  const [posCart, setPosCart] = useState<OrderItem[]>([]);
  const [posCustomer, setPosCustomer] = useState<Customer | null>(null);
  const [posSearch, setPosSearch] = useState('');
  const [posDiscount, setPosDiscount] = useState(0);
  const [posDiscountType, setPosDiscountType] = useState<'amount' | 'percent'>('amount');
  const [posShipFee, setPosShipFee] = useState(0);
  const [posVatRateManual, setPosVatRateManual] = useState(data.settings.vatRate);
  const [posPaymentMethod, setPosPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [posCashReceived, setPosCashReceived] = useState<number>(0);

  // Product Modal State
  const [productModal, setProductModal] = useState<{ open: boolean; mode: 'add' | 'edit'; product: Partial<Product> }>({ open: false, mode: 'add', product: {} });
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // Order Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // API Key Modal State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleLogin = (account: UserAccount) => {
    setIsAuthenticated(true);
    setData(prev => ({
      ...prev,
      currentUser: { name: account.name, role: account.role }
    }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth_user_id');
    setIsAuthenticated(false);
  };

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} accounts={data.accounts} />;
  }

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    storage.save(data);
  }, [data]);

  // Show API Key modal if no key configured
  useEffect(() => {
    if (!data.settings.geminiApiKey) {
      setShowApiKeyModal(true);
      setApiKeyInput('');
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const isAdmin = data.currentUser.role === UserRole.ADMIN;
  const isWarehouse = data.currentUser.role === UserRole.WAREHOUSE;
  const isCashier = data.currentUser.role === UserRole.CASHIER;

  // --- POS Logic ---

  const addToCart = (product: Product) => {
    if (product.stock <= 0 && !data.settings.allowNegativeStock) {
      Swal.fire('Hết hàng', 'Sản phẩm này đã hết hàng trong kho!', 'warning');
      return;
    }

    setPosCart(prev => {
      const existing = prev.find(item => item.sku === product.sku);
      if (existing) {
        return prev.map(item =>
          item.sku === product.sku
            ? { ...item, qty: item.qty + 1, lineTotal: (item.qty + 1) * (item.price - item.discountLine), lineProfit: (item.qty + 1) * (item.price - item.discountLine - item.costAtSale) }
            : item
        );
      }
      const newItem: OrderItem = {
        sku: product.sku,
        name: product.name,
        qty: 1,
        price: product.salePrice,
        discountLine: 0,
        costAtSale: product.costAvg,
        lineTotal: product.salePrice,
        lineProfit: product.salePrice - product.costAvg
      };
      return [...prev, newItem];
    });
  };

  const updateCartQty = (sku: string, delta: number) => {
    setPosCart(prev => prev.map(item => {
      if (item.sku === sku) {
        const newQty = Math.max(0, item.qty + delta);
        if (newQty === 0) return null;

        // Check stock
        const product = data.products.find(p => p.sku === sku);
        if (product && delta > 0 && product.stock <= item.qty && !data.settings.allowNegativeStock) {
          Swal.fire('Hết hàng', 'Không thể thêm quá số lượng tồn kho!', 'warning');
          return item;
        }

        return {
          ...item,
          qty: newQty,
          lineTotal: newQty * (item.price - item.discountLine),
          lineProfit: newQty * (item.price - item.discountLine - item.costAtSale)
        };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const posTotals = useMemo(() => {
    const subtotal = posCart.reduce((sum, item) => sum + item.lineTotal, 0);
    const vat = data.settings.vatEnabled ? (subtotal * posVatRateManual / 100) : 0;
    const discountAmount = posDiscountType === 'percent' ? (subtotal * posDiscount / 100) : posDiscount;
    const total = subtotal - discountAmount + posShipFee + vat;
    const cogs = posCart.reduce((sum, item) => sum + (item.costAtSale * item.qty), 0);
    const profit = total - cogs;
    const margin = total > 0 ? (profit / total * 100) : 0;

    return { subtotal, vat, total, cogs, profit, margin, discountAmount };
  }, [posCart, posDiscount, posDiscountType, posShipFee, posVatRateManual, data.settings]);

  const handleCreateOrder = () => {
    if (posCart.length === 0) {
      Swal.fire('Giỏ hàng trống', 'Vui lòng chọn sản phẩm!', 'warning');
      return;
    }
    if (!posCustomer) {
      Swal.fire('Thiếu khách hàng', 'Vui lòng nhập SĐT khách hàng!', 'warning');
      return;
    }

    const paymentStatus = posPaymentMethod === PaymentMethod.DEBT ? PaymentStatus.UNPAID : PaymentStatus.PAID;
    const paidAmount = paymentStatus === PaymentStatus.PAID ? posTotals.total : 0;

    const newOrder: Order = {
      id: `DH${dayjs().format('YYMMDDHHmmss')}`,
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      customerId: posCustomer.id,
      customerName: posCustomer.name,
      subtotal: posTotals.subtotal,
      discountOrder: posTotals.discountAmount,
      shipFee: posShipFee,
      vat: posTotals.vat,
      total: posTotals.total,
      revenue: posTotals.total,
      cogs: posTotals.cogs,
      profit: posTotals.profit,
      margin: posTotals.margin,
      paymentMethod: posPaymentMethod,
      paymentStatus: paymentStatus,
      paidAmount: paidAmount,
      status: OrderStatus.COMPLETED,
      items: [...posCart],
      cashReceived: posCashReceived,
      cashChange: posCashReceived > posTotals.total ? posCashReceived - posTotals.total : 0
    };

    // Update Data
    const updatedProducts = data.products.map(p => {
      const cartItem = posCart.find(item => item.sku === p.sku);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.qty };
      }
      return p;
    });

    const updatedCustomers = data.customers.map(c => {
      if (c.id === posCustomer.id) {
        return {
          ...c,
          totalOrders: c.totalOrders + 1,
          totalSpent: c.totalSpent + posTotals.total,
          lastOrderDate: dayjs().format('YYYY-MM-DD'),
          debt: posPaymentMethod === PaymentMethod.DEBT ? c.debt + posTotals.total : c.debt
        };
      }
      return c;
    });

    const newLedgerEntries: InventoryLedger[] = posCart.map(item => ({
      id: `LG${Math.random().toString(36).substr(2, 9)}`,
      sku: item.sku,
      type: InventoryType.OUT,
      qty: item.qty,
      unitCost: item.costAtSale,
      refId: newOrder.id,
      date: newOrder.date,
      note: `Bán hàng cho ${posCustomer.name}`
    }));

    setData(prev => ({
      ...prev,
      products: updatedProducts,
      customers: updatedCustomers,
      orders: [newOrder, ...prev.orders],
      ledger: [...newLedgerEntries, ...prev.ledger]
    }));

    setLastCreatedOrder(newOrder);
    Swal.fire({
      title: 'Tạo đơn thành công!',
      html: `<b>${newOrder.id}</b> - Tổng: <b>${formatCurrency(newOrder.total)}</b>`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: '🖨️ In đơn hàng',
      cancelButtonText: 'Đóng'
    }).then(r => { if (r.isConfirmed) handlePrintOrder(newOrder); });

    // Reset POS
    setPosCart([]);
    setPosCustomer(null);
    setPosDiscount(0);
    setPosDiscountType('amount');
    setPosShipFee(0);
    setPosVatRateManual(data.settings.vatRate);
    setPosCashReceived(0);
  };

  const handlePrintOrder = (order: Order) => {
    const win = window.open('', '_blank', 'width=420,height=600');
    if (!win) return;
    const items = order.items.map(i => `<tr><td style="padding:4px 8px">${i.name}</td><td style="text-align:center;padding:4px 8px">${i.qty}</td><td style="text-align:right;padding:4px 8px">${new Intl.NumberFormat('vi-VN').format(i.lineTotal)}đ</td></tr>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Đơn ${order.id}</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:monospace}body{padding:16px;font-size:13px}h2{text-align:center;font-size:16px;margin-bottom:4px}.center{text-align:center;color:#666;margin-bottom:8px}.divider{border-top:1px dashed #999;margin:8px 0}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:4px 8px;text-align:left;font-size:11px}.total-row{font-weight:bold;font-size:15px}.footer{text-align:center;margin-top:12px;color:#888;font-size:11px}@media print{button{display:none}}</style></head><body><h2>SỔ BÁN HÀNG PRO</h2><p class="center">${order.date}</p><p class="center">Khách: ${order.customerName}</p><div class="divider"></div><table><thead><tr><th>Sản phẩm</th><th style="text-align:center">SL</th><th style="text-align:right">T.Tiền</th></tr></thead><tbody>${items}</tbody></table><div class="divider"></div><table><tr><td>Tạm tính</td><td style="text-align:right">${new Intl.NumberFormat('vi-VN').format(order.subtotal)}đ</td></tr>${order.discountOrder > 0 ? `<tr><td>Giảm giá</td><td style="text-align:right">-${new Intl.NumberFormat('vi-VN').format(order.discountOrder)}đ</td></tr>` : ''} ${order.shipFee > 0 ? `<tr><td>Phí ship</td><td style="text-align:right">${new Intl.NumberFormat('vi-VN').format(order.shipFee)}đ</td></tr>` : ''} <tr class="total-row"><td>TỔNG CỘNG</td><td style="text-align:right">${new Intl.NumberFormat('vi-VN').format(order.total)}đ</td></tr></table><p class="footer">Cảm ơn quý khách! Hẹn gặp lại 🙏</p><div style="text-align:center;margin-top:12px"><button onclick="window.print()" style="padding:8px 20px;background:#1e40af;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">🖨️ In ngay</button></div></body></html>`);
    win.document.close();
  };

  const handleExportOrdersExcel = () => {
    const headers = ['Mã đơn', 'Ngày', 'Khách hàng', 'Tạm tính', 'Giảm giá', 'Phí ship', 'Tổng cộng', 'Thanh toán', 'Trạng thái TT'];
    const rows = data.orders.map(o => [
      o.id, o.date, o.customerName,
      o.subtotal, o.discountOrder, o.shipFee, o.total,
      o.paymentMethod,
      o.paymentStatus === 'PAID' ? 'Đã TT' : o.paymentStatus === 'PARTIAL' ? 'TT 1 phần' : 'Chưa TT'
    ]);
    const csv = [headers, ...rows].map(r => r.join('\t')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `don_hang_${dayjs().format('YYYYMMDD')}.xls`;
    a.click(); URL.revokeObjectURL(url);
  };

  // --- AI Logic ---

  const getAiSuggestions = async () => {
    if (!data.settings.geminiApiKey) {
      Swal.fire('Thiếu API Key', 'Vui lòng cấu hình Gemini API Key trong phần Cài đặt.', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const prompt = generateInventorySuggestions(data.products, data.orders);
      const result = await callGeminiAI(prompt, data.settings.geminiApiKey, data.settings.selectedModel);
      setAiSuggestion(result);
    } catch (error: any) {
      Swal.fire('Lỗi AI', error.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // --- Views ---

  const DashboardView = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayOrders = data.orders.filter(o => o.date.startsWith(today));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.revenue, 0);
    const todayProfit = todayOrders.reduce((sum, o) => sum + o.profit, 0);

    const weekAgo = dayjs().subtract(7, 'days');
    const weekOrders = data.orders.filter(o => dayjs(o.date).isAfter(weekAgo));
    const weekRevenue = weekOrders.reduce((sum, o) => sum + o.revenue, 0);

    const lowStockCount = data.products.filter(p => p.stock <= p.minStock).length;

    // Chart Data
    const last7Days = Array.from({ length: 7 }, (_, i) => dayjs().subtract(6 - i, 'days').format('DD/MM'));
    const revenueByDay = last7Days.map(date => {
      const dayStr = dayjs().subtract(6 - last7Days.indexOf(date), 'days').format('YYYY-MM-DD');
      return data.orders
        .filter(o => o.date.startsWith(dayStr))
        .reduce((sum, o) => sum + o.revenue, 0);
    });

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tổng quan kinh doanh</h1>
            <p className="text-slate-500">Chào mừng trở lại, {data.currentUser.name}!</p>
          </div>
          <button
            onClick={getAiSuggestions}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {aiLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
            AI Suggestions
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Doanh thu hôm nay" value={formatCurrency(todayRevenue)} trend="+12%" icon={DollarSign} color="bg-blue-500" />
          <StatCard title="Lợi nhuận gộp" value={formatCurrency(todayProfit)} trend="+8%" icon={TrendingUp} color="bg-emerald-500" />
          <StatCard title="Đơn hàng mới" value={todayOrders.length.toString()} trend="+5%" icon={ShoppingCart} color="bg-violet-500" />
          <StatCard title="Cảnh báo kho" value={lowStockCount.toString()} icon={AlertTriangle} color={lowStockCount > 0 ? "bg-rose-500" : "bg-slate-400"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Doanh thu 7 ngày qua</h3>
            <div className="h-80">
              <Line
                data={{
                  labels: last7Days,
                  datasets: [{
                    label: 'Doanh thu',
                    data: revenueByDay,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { callback: (v) => formatCurrency(v as number) } } }
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Gợi ý thông minh</h3>
            <div className="flex-1 overflow-y-auto">
              {aiSuggestion ? (
                <div className="prose prose-sm max-w-none text-slate-600">
                  <Markdown>{aiSuggestion}</Markdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="text-indigo-500" size={32} />
                  </div>
                  <p className="text-slate-500 text-sm">Nhấn nút "AI Suggestions" để nhận phân tích và gợi ý từ Gemini AI.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Top sản phẩm bán chạy</h3>
            <div className="space-y-4">
              {data.products.slice(0, 5).map((p, i) => (
                <div key={p.sku} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(p.salePrice)}</p>
                    <p className="text-xs text-emerald-600 font-medium">Tồn: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              {data.orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Đơn hàng {o.id}</p>
                      <p className="text-xs text-slate-500">{dayjs(o.date).format('HH:mm - DD/MM/YYYY')}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{formatCurrency(o.total)}</p>
                      <p className="text-xs text-slate-500">{o.customerName}</p>
                    </div>
                    <button
                      onClick={() => {
                        const currentStatus = o.paymentStatus || PaymentStatus.PAID;
                        const nextStatus = currentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : currentStatus === PaymentStatus.UNPAID ? PaymentStatus.PARTIAL : PaymentStatus.PAID;
                        setData(prev => ({
                          ...prev,
                          orders: prev.orders.map(ord => ord.id === o.id ? { ...ord, paymentStatus: nextStatus, paidAmount: nextStatus === PaymentStatus.PAID ? ord.total : nextStatus === PaymentStatus.PARTIAL ? ord.total / 2 : 0 } : ord)
                        }));
                      }}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all whitespace-nowrap ${(o.paymentStatus || PaymentStatus.PAID) === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-600' :
                        o.paymentStatus === PaymentStatus.PARTIAL ? 'bg-amber-100 text-amber-600' :
                          'bg-rose-100 text-rose-600'
                        }`}
                      title="Nhấn để đổi trạng thái thanh toán"
                    >
                      {(o.paymentStatus || PaymentStatus.PAID) === PaymentStatus.PAID ? '🟢 Đã TT' :
                        o.paymentStatus === PaymentStatus.PARTIAL ? '🟡 TT 1 phần' :
                          '🔴 Chưa TT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Unpaid Orders Summary */}
        {(() => {
          const unpaidOrders = data.orders.filter(o => o.paymentStatus === PaymentStatus.UNPAID || o.paymentStatus === PaymentStatus.PARTIAL);
          const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + o.total - (o.paidAmount || 0), 0);
          if (unpaidOrders.length === 0) return null;
          return (
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-2xl border border-rose-200 shadow-sm">
              <h3 className="text-lg font-bold text-rose-700 mb-3 flex items-center gap-2"><AlertTriangle size={20} /> Đơn hàng chưa thanh toán</h3>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-sm text-rose-600">Số đơn chưa TT</p>
                  <p className="text-2xl font-black text-rose-700">{unpaidOrders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-rose-600">Tổng công nợ</p>
                  <p className="text-2xl font-black text-rose-700">{formatCurrency(unpaidTotal)}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {unpaidOrders.map(o => (
                  <div key={o.id} className="flex justify-between items-center bg-white/70 p-3 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-900">{o.id}</span>
                      <span className="text-xs text-slate-500 ml-2">{o.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-rose-600">{formatCurrency(o.total - (o.paidAmount || 0))}</span>
                      <button
                        onClick={() => setData(prev => ({ ...prev, orders: prev.orders.map(ord => ord.id === o.id ? { ...ord, paymentStatus: PaymentStatus.PAID, paidAmount: ord.total } : ord) }))}
                        className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                      >
                        Xác nhận TT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  const POSView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');

    const filteredProducts = data.products.filter(p =>
      p.active && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCustomerSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const customer = data.customers.find(c => c.phone === customerPhone);
      if (customer) {
        setPosCustomer(customer);
      } else {
        Swal.fire({
          title: '➕ Thêm khách hàng mới',
          html: `
            <p class="text-sm text-gray-500 mb-3">SĐT: <b>${customerPhone}</b></p>
            <input id="swal-cust-name" class="swal2-input" placeholder="Họ tên khách hàng *" style="margin: 4px 0">
            <input id="swal-cust-addr" class="swal2-input" placeholder="Địa chỉ (tùy chọn)" style="margin: 4px 0">
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Tạo khách & chọn',
          cancelButtonText: 'Hủy',
          preConfirm: () => {
            const name = (document.getElementById('swal-cust-name') as HTMLInputElement)?.value?.trim();
            if (!name) {
              Swal.showValidationMessage('Vui lòng nhập họ tên khách hàng!');
              return false;
            }
            return {
              name,
              address: (document.getElementById('swal-cust-addr') as HTMLInputElement)?.value?.trim() || ''
            };
          }
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            const newId = `KH${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            const newCustomer: Customer = {
              id: newId,
              phone: customerPhone,
              name: result.value.name,
              group: 'Lẻ',
              address: result.value.address,
              debt: 0,
              totalOrders: 0,
              totalSpent: 0
            };
            setData(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
            setPosCustomer(newCustomer);
          }
        });
      }

    };

    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full animate-in slide-in-from-bottom-4 duration-500">
        {/* Left: Customer & Payment */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Khách hàng
            </h3>

            {!posCustomer ? (
              <form onSubmit={handleCustomerSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Nhập SĐT khách hàng..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors">
                  Tìm khách hàng
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-900">{posCustomer.name}</p>
                    <p className="text-sm text-slate-500">{posCustomer.phone}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full uppercase">
                      {posCustomer.group}
                    </span>
                  </div>
                  <button onClick={() => setPosCustomer(null)} className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Tổng mua</p>
                    <p className="font-bold text-slate-900">{formatCurrency(posCustomer.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Công nợ</p>
                    <p className={`font-bold ${posCustomer.debt > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{formatCurrency(posCustomer.debt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CreditCard size={20} className="text-emerald-600" />
              Thanh toán
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: PaymentMethod.CASH, label: 'Tiền mặt', icon: Banknote },
                { id: PaymentMethod.TRANSFER, label: 'Chuyển khoản', icon: ArrowRightLeft },
                { id: PaymentMethod.WALLET, label: 'Ví điện tử', icon: Wallet },
                { id: PaymentMethod.DEBT, label: 'Ghi nợ', icon: History },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPosPaymentMethod(m.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${posPaymentMethod === m.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                    }`}
                >
                  <m.icon size={16} />
                  <span className="text-xs">{m.label}</span>
                </button>
              ))}
            </div>

            {posPaymentMethod === PaymentMethod.CASH && (
              <div className="space-y-3 pt-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Khách đưa</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg"
                    value={posCashReceived || ''}
                    onChange={(e) => setPosCashReceived(Number(e.target.value))}
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-emerald-700">Tiền thối:</span>
                  <span className="font-bold text-emerald-700 text-lg">
                    {formatCurrency(Math.max(0, posCashReceived - posTotals.total))}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span>{formatCurrency(posTotals.subtotal)}</span>
              </div>
              {data.settings.vatEnabled && (
                <div className="flex justify-between text-slate-600">
                  <span>Thuế VAT (%):</span>
                  <input
                    type="number"
                    className="w-16 text-right bg-transparent border-b border-slate-200 outline-none focus:border-blue-500"
                    value={posVatRateManual || ''}
                    onChange={(e) => setPosVatRateManual(Number(e.target.value))}
                  />
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600">
                <span>Giảm giá:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-28 text-right bg-transparent border-b border-slate-200 outline-none focus:border-blue-500"
                    value={posDiscount === 0 ? '' : posDiscount.toLocaleString('vi-VN')}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setPosDiscount(raw === '' ? 0 : Number(raw));
                    }}
                    placeholder="0"
                  />
                  <select
                    className="text-[10px] font-bold bg-slate-100 rounded px-1 py-0.5 outline-none"
                    value={posDiscountType}
                    onChange={(e) => setPosDiscountType(e.target.value as 'amount' | 'percent')}
                  >
                    <option value="amount">đ</option>
                    <option value="percent">%</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí ship:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-28 text-right bg-transparent border-b border-slate-200 outline-none focus:border-blue-500"
                  value={posShipFee === 0 ? '' : posShipFee.toLocaleString('vi-VN')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setPosShipFee(raw === '' ? 0 : Number(raw));
                  }}
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-lg font-bold text-slate-900">Tổng cộng:</span>
                <span className="text-2xl font-black text-blue-600">{formatCurrency(posTotals.total)}</span>
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={24} />
              THANH TOÁN (F9)
            </button>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => lastCreatedOrder && handlePrintOrder(lastCreatedOrder)}
                disabled={!lastCreatedOrder}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all disabled:opacity-40"
              >
                <Printer size={14} /> In đơn
              </button>
              <button
                onClick={handleExportOrdersExcel}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
              >
                <Download size={14} /> Excel
              </button>
              <button
                onClick={() => {
                  if (!lastCreatedOrder) { Swal.fire('Chưa có đơn', 'Hãy tạo đơn hàng trước!', 'info'); return; }
                  handlePrintOrder(lastCreatedOrder);
                }}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
              >
                <Save size={14} /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right: Products & Cart */}
        <div className="xl:col-span-8 space-y-6 flex flex-col">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc SKU (F2)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['Tất cả', 'Thời trang', 'Giày dép', 'Phụ kiện'].map(cat => (
                <button key={cat} className="whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1">
            {filteredProducts.map(p => (
              <button
                key={p.sku}
                onClick={() => addToCart(p)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group"
              >
                <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-200 transition-colors">
                  <Package size={40} />
                </div>
                <p className="font-bold text-slate-900 text-sm line-clamp-2 mb-1">{p.name}</p>
                <p className="text-xs text-slate-500 mb-2">{p.sku}</p>
                <div className="flex justify-between items-center">
                  <p className="font-black text-blue-600">{formatCurrency(p.salePrice)}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.stock <= p.minStock ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    Tồn: {p.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Giỏ hàng ({posCart.length})</h3>
              {isAdmin && (
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex flex-col items-end">
                    <span className="text-slate-500 uppercase font-bold">Lợi nhuận đơn</span>
                    <span className={`font-black ${posTotals.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(posTotals.profit)} ({posTotals.margin.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">Sản phẩm</th>
                    <th className="px-4 py-3 text-center">Số lượng</th>
                    <th className="px-4 py-3 text-right">Giá bán</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posCart.map(item => (
                    <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => updateCartQty(item.sku, -1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">-</button>
                          <span className="font-bold text-slate-900 w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.sku, 1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">+</button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        {formatCurrency(item.lineTotal)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setPosCart(prev => prev.filter(i => i.sku !== item.sku))} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {posCart.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center text-slate-400">
                        <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Giỏ hàng đang trống</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InventoryView = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = data.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      if (filter === 'low') return matchesSearch && p.stock <= p.minStock;
      if (filter === 'out') return matchesSearch && p.stock <= 0;
      return matchesSearch;
    });

    const handleAddProduct = () => {
      setProductModal({ open: true, mode: 'add', product: { active: true, stock: 0, minStock: 5, costAvg: 0, salePrice: 0 } });
    };

    const handleEditProduct = (product: Product) => {
      setProductModal({ open: true, mode: 'edit', product: { ...product } });
    };

    const handleDeleteProduct = (sku: string) => {
      Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn không thể hoàn tác hành động này!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Xóa ngay',
        cancelButtonText: 'Hủy'
      }).then((result) => {
        if (result.isConfirmed) {
          setData(prev => ({
            ...prev,
            products: prev.products.filter(p => p.sku !== sku)
          }));
          Swal.fire('Đã xóa!', 'Sản phẩm đã được gỡ khỏi hệ thống.', 'success');
        }
      });
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Quản lý kho hàng</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
              <Download size={18} /> Xuất Excel
            </button>
            <button onClick={handleAddProduct} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-all">
              <Plus size={18} /> Thêm sản phẩm
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên, SKU..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'low', label: 'Tồn thấp' },
              { id: 'out', label: 'Hết hàng' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Nhà cung cấp</th>
                <th className="px-6 py-4 text-right">Giá vốn</th>
                <th className="px-6 py-4 text-right">Giá bán</th>
                <th className="px-6 py-4 text-center">Tồn kho</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.sku} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.sku}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{p.supplier || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">
                    {isAdmin ? formatCurrency(p.costAvg) : '***'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(p.salePrice)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-black ${p.stock <= p.minStock ? 'text-rose-600' : 'text-slate-900'}`}>
                      {p.stock}
                    </span>
                    <p className="text-[10px] text-slate-400">Min: {p.minStock}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.stock <= 0 ? (
                      <span className="px-2 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-bold uppercase">Hết hàng</span>
                    ) : p.stock <= p.minStock ? (
                      <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase">Tồn thấp</span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase">Ổn định</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEditProduct(p)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.sku)}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ReportsView = () => {
    const totalRevenue = data.orders.reduce((sum, o) => sum + o.revenue, 0);
    const totalCogs = data.orders.reduce((sum, o) => sum + o.cogs, 0);
    const totalProfit = data.orders.reduce((sum, o) => sum + o.profit, 0);
    const totalVatOut = data.orders.reduce((sum, o) => sum + o.vat, 0);
    const totalVatIn = data.expenses.reduce((sum, e) => sum + e.vatIn, 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-2xl font-bold text-slate-900">Báo cáo tài chính & Thuế</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-500 text-sm font-medium mb-1">Tổng doanh thu</h3>
            <p className="text-2xl font-black text-blue-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-500 text-sm font-medium mb-1">Lợi nhuận gộp</h3>
            <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalProfit)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-500 text-sm font-medium mb-1">Dự kiến thuế VAT</h3>
            <p className="text-2xl font-black text-rose-600">{formatCurrency(Math.max(0, totalVatOut - totalVatIn))}</p>
            <p className="text-[10px] text-slate-400 mt-1">VAT Ra: {formatCurrency(totalVatOut)} - VAT Vào: {formatCurrency(totalVatIn)}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-8">Chi tiết lợi nhuận theo tháng</h3>
          <div className="h-96">
            <Bar
              data={{
                labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
                datasets: [
                  { label: 'Doanh thu', data: [45000000, 52000000, 48000000, 61000000, 55000000, 67000000], backgroundColor: '#3b82f6' },
                  { label: 'Giá vốn', data: [30000000, 35000000, 32000000, 40000000, 37000000, 45000000], backgroundColor: '#94a3b8' },
                  { label: 'Lợi nhuận', data: [15000000, 17000000, 16000000, 21000000, 18000000, 22000000], backgroundColor: '#10b981' },
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { ticks: { callback: (v) => formatCurrency(v as number) } } }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    return (
      <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
        <h1 className="text-2xl font-bold text-slate-900">Cấu hình hệ thống</h1>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              Gemini AI Integration
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Gemini API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={data.settings.geminiApiKey}
                    onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, geminiApiKey: e.target.value } }))}
                    placeholder="Nhập API Key của bạn..."
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Lấy key tại <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google AI Studio</a></p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">Chọn Model AI</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {AI_MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, selectedModel: model.id } }))}
                      className={`relative p-5 rounded-2xl border-2 transition-all text-left ${data.settings.selectedModel === model.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        }`}
                    >
                      <span className={`absolute top-3 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${model.badge === 'Default' ? 'bg-blue-100 text-blue-600' :
                        model.badge === 'Pro' ? 'bg-violet-100 text-violet-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>{model.badge}</span>
                      <div className="mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${data.settings.selectedModel === model.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                          <Sparkles size={20} />
                        </div>
                        <p className="font-bold text-slate-900">{model.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{model.desc}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{model.id}</p>
                      {data.settings.selectedModel === model.id && (
                        <div className="absolute top-3 left-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600" />
              Phân quyền & Tài khoản
            </h3>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <UserCircle size={32} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{data.currentUser.name}</p>
                <p className="text-xs text-blue-600 font-bold uppercase">{data.currentUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>

            {isAdmin && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-700">Danh sách tài khoản</p>
                  <button
                    onClick={() => {
                      Swal.fire({
                        title: 'Tạo tài khoản mới',
                        html: `
                          <input id="swal-name" class="swal2-input" placeholder="Họ tên">
                          <input id="swal-user" class="swal2-input" placeholder="Tên đăng nhập">
                          <input id="swal-pass" class="swal2-input" placeholder="Mật khẩu" type="password">
                          <select id="swal-role" class="swal2-select" style="margin-top:12px;padding:8px 12px;border:1px solid #d5d5d5;border-radius:8px;width:100%;font-size:14px">
                            <option value="ADMIN">Admin</option>
                            <option value="CASHIER">Thu ngân</option>
                            <option value="WAREHOUSE">Thủ kho</option>
                          </select>`,
                        focusConfirm: false,
                        showCancelButton: true,
                        confirmButtonText: 'Tạo',
                        cancelButtonText: 'Hủy',
                        preConfirm: () => {
                          const name = (document.getElementById('swal-name') as HTMLInputElement).value;
                          const username = (document.getElementById('swal-user') as HTMLInputElement).value;
                          const password = (document.getElementById('swal-pass') as HTMLInputElement).value;
                          const role = (document.getElementById('swal-role') as HTMLSelectElement).value as UserRole;
                          if (!name || !username || !password) {
                            Swal.showValidationMessage('Vui lòng điền đủ thông tin!');
                            return;
                          }
                          if (data.accounts.some(a => a.username === username)) {
                            Swal.showValidationMessage('Tên đăng nhập đã tồn tại!');
                            return;
                          }
                          return { name, username, password, role };
                        }
                      }).then(result => {
                        if (result.isConfirmed && result.value) {
                          const newAccount: UserAccount = {
                            id: `ACC${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                            username: result.value.username,
                            password: result.value.password,
                            name: result.value.name,
                            role: result.value.role,
                            active: true
                          };
                          setData(prev => ({ ...prev, accounts: [...prev.accounts, newAccount] }));
                          Swal.fire('Thành công', 'Đã tạo tài khoản mới!', 'success');
                        }
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    <Plus size={16} /> Thêm tài khoản
                  </button>
                </div>
                <div className="space-y-3">
                  {data.accounts.map(acc => (
                    <div key={acc.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${acc.active ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${acc.role === UserRole.ADMIN ? 'bg-violet-500' : acc.role === UserRole.CASHIER ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}>
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{acc.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">@{acc.username}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${acc.role === UserRole.ADMIN ? 'bg-violet-100 text-violet-600' :
                            acc.role === UserRole.CASHIER ? 'bg-emerald-100 text-emerald-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>{acc.role}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: `Sửa tài khoản: ${acc.name}`,
                              html: `
                                <input id="swal-name" class="swal2-input" placeholder="Họ tên" value="${acc.name}">
                                <input id="swal-pass" class="swal2-input" placeholder="Mật khẩu mới (bỏ trống = giữ nguyên)" type="password">
                                <select id="swal-role" class="swal2-select" style="margin-top:12px;padding:8px 12px;border:1px solid #d5d5d5;border-radius:8px;width:100%;font-size:14px">
                                  <option value="ADMIN" ${acc.role === UserRole.ADMIN ? 'selected' : ''}>Admin</option>
                                  <option value="CASHIER" ${acc.role === UserRole.CASHIER ? 'selected' : ''}>Thu ngân</option>
                                  <option value="WAREHOUSE" ${acc.role === UserRole.WAREHOUSE ? 'selected' : ''}>Thủ kho</option>
                                </select>`,
                              focusConfirm: false,
                              showCancelButton: true,
                              confirmButtonText: 'Lưu',
                              cancelButtonText: 'Hủy',
                              preConfirm: () => {
                                const name = (document.getElementById('swal-name') as HTMLInputElement).value;
                                const password = (document.getElementById('swal-pass') as HTMLInputElement).value;
                                const role = (document.getElementById('swal-role') as HTMLSelectElement).value as UserRole;
                                if (!name) {
                                  Swal.showValidationMessage('Vui lòng nhập họ tên!');
                                  return;
                                }
                                return { name, password, role };
                              }
                            }).then(result => {
                              if (result.isConfirmed && result.value) {
                                setData(prev => ({
                                  ...prev,
                                  accounts: prev.accounts.map(a => a.id === acc.id ? {
                                    ...a,
                                    name: result.value!.name,
                                    role: result.value!.role,
                                    ...(result.value!.password ? { password: result.value!.password } : {})
                                  } : a)
                                }));
                                Swal.fire('Thành công', 'Đã cập nhật tài khoản!', 'success');
                              }
                            });
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            const authUserId = sessionStorage.getItem('auth_user_id');
                            if (acc.id === authUserId) {
                              Swal.fire('Không thể xóa', 'Bạn không thể xóa tài khoản đang đăng nhập!', 'warning');
                              return;
                            }
                            Swal.fire({
                              title: 'Xác nhận xóa?',
                              text: `Bạn có chắc muốn xóa tài khoản "${acc.name}"?`,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'Xóa',
                              cancelButtonText: 'Hủy',
                              confirmButtonColor: '#ef4444'
                            }).then(result => {
                              if (result.isConfirmed) {
                                setData(prev => ({ ...prev, accounts: prev.accounts.filter(a => a.id !== acc.id) }));
                                Swal.fire('Đã xóa', 'Tài khoản đã bị xóa!', 'success');
                              }
                            });
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-slate-600" />
              Thiết lập bán hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">Bật thuế VAT</p>
                  <p className="text-xs text-slate-500">Tự động tính VAT vào đơn hàng</p>
                </div>
                <input
                  type="checkbox"
                  checked={data.settings.vatEnabled}
                  onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, vatEnabled: e.target.checked } }))}
                  className="w-5 h-5 accent-blue-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">Cho phép xuất âm</p>
                  <p className="text-xs text-slate-500">Bán hàng khi tồn kho bằng 0</p>
                </div>
                <input
                  type="checkbox"
                  checked={data.settings.allowNegativeStock}
                  onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, allowNegativeStock: e.target.checked } }))}
                  className="w-5 h-5 accent-blue-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">Ẩn giá vốn</p>
                  <p className="text-xs text-slate-500">Ẩn giá vốn với nhân viên thu ngân</p>
                </div>
                <input
                  type="checkbox"
                  checked={data.settings.hideCostFromCashier}
                  onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, hideCostFromCashier: e.target.checked } }))}
                  className="w-5 h-5 accent-blue-600"
                />
              </div>
            </div>
          </section>

          <div className="pt-8 flex justify-end gap-4">
            <button onClick={storage.reset} className="px-6 py-2 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-all">Xóa dữ liệu</button>
            <button onClick={() => Swal.fire('Thành công', 'Đã lưu cấu hình!', 'success')} className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Lưu thay đổi</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== ORDERS VIEW =====
  const OrdersView = () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filtered = data.orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true :
        filterStatus === 'paid' ? (o.paymentStatus === PaymentStatus.PAID) :
          filterStatus === 'unpaid' ? (o.paymentStatus === PaymentStatus.UNPAID) :
            (o.paymentStatus === PaymentStatus.PARTIAL);
      const matchFrom = dateFrom ? dayjs(o.date).isAfter(dayjs(dateFrom).subtract(1, 'day')) : true;
      const matchTo = dateTo ? dayjs(o.date).isBefore(dayjs(dateTo).add(1, 'day')) : true;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const totalProfit = filtered.reduce((s, o) => s + (o.profit || 0), 0);

    const handleExportOrdersFiltered = () => {
      const headers = ['Mã đơn', 'Ngày', 'Khách hàng', 'Tạm tính', 'Giảm giá', 'Phí ship', 'VAT', 'Tổng cộng', 'Thanh toán', 'Trạng thái TT', 'Lợi nhuận'];
      const rows = filtered.map(o => [
        o.id, o.date, o.customerName,
        o.subtotal, o.discountOrder, o.shipFee, o.vat || 0, o.total,
        o.paymentMethod,
        o.paymentStatus === PaymentStatus.PAID ? 'Đã TT' : o.paymentStatus === PaymentStatus.PARTIAL ? 'TT 1 phần' : 'Chưa TT',
        o.profit || 0
      ]);
      const csv = [headers, ...rows].map(r => r.join('\t')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/tab-separated-values;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `lich_su_don_hang_${dayjs().format('YYYYMMDD')}.xls`;
      a.click(); URL.revokeObjectURL(url);
    };

    const handleExportSingleOrder = (order: Order) => {
      const headers = ['Tên sản phẩm', 'SKU', 'Số lượng', 'Đơn giá', 'Giảm dòng', 'Thành tiền'];
      const rows = order.items.map(i => [i.name, i.sku, i.qty, i.price, i.discountLine, i.lineTotal]);
      const summary = [
        [], ['', '', '', '', 'Tạm tính:', order.subtotal],
        ['', '', '', '', 'Giảm giá:', order.discountOrder],
        ['', '', '', '', 'Phí ship:', order.shipFee],
        ['', '', '', '', 'VAT:', order.vat || 0],
        ['', '', '', '', 'TỔNG CỘNG:', order.total],
        ['', '', '', '', 'Lợi nhuận:', order.profit || 0],
      ];
      const meta = [
        [`Mã đơn: ${order.id}`], [`Ngày: ${order.date}`], [`Khách: ${order.customerName}`],
        [`TT: ${order.paymentStatus === PaymentStatus.PAID ? 'Đã TT' : order.paymentStatus === PaymentStatus.PARTIAL ? 'TT 1 phần' : 'Chưa TT'}`], []
      ];
      const csv = [...meta, headers, ...rows, ...summary].map(r => r.join('\t')).join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/tab-separated-values;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `don_hang_${order.id}.xls`;
      a.click(); URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Lịch sử đơn hàng</h1>
          <button
            onClick={handleExportOrdersFiltered}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-sm"
          >
            <Download size={18} /> Xuất Excel ({filtered.length} đơn)
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tổng đơn</p>
            <p className="text-2xl font-black text-slate-900">{filtered.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Doanh thu</p>
            <p className="text-xl font-black text-blue-600">{formatCurrency(totalRevenue)}</p>
          </div>
          {isAdmin && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Lợi nhuận</p>
              <p className={`text-xl font-black ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(totalProfit)}</p>
            </div>
          )}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Chưa TT</p>
            <p className="text-xl font-black text-rose-600">{filtered.filter(o => o.paymentStatus !== PaymentStatus.PAID).length} đơn</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ id: 'all', label: 'Tất cả' }, { id: 'paid', label: 'Đã TT' }, { id: 'unpaid', label: 'Chưa TT' }, { id: 'partial', label: 'TT 1 phần' }].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === f.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >{f.label}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-slate-400 text-xs">→</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-slate-400 hover:text-rose-500 transition-colors">✕ Xóa</button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-center">Sản phẩm</th>
                <th className="px-6 py-4 text-right">Tổng cộng</th>
                {isAdmin && <th className="px-6 py-4 text-right">Lợi nhuận</th>}
                <th className="px-6 py-4 text-center">Trạng thái TT</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-20 text-center text-slate-400">
                  <ClipboardList size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Không có đơn hàng nào phù hợp</p>
                </td></tr>
              )}
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-blue-600 font-mono text-sm">{o.id}</p>
                    <p className="text-[10px] text-slate-400">{o.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 font-medium">{dayjs(o.date).format('HH:mm')}</p>
                    <p className="text-xs text-slate-500">{dayjs(o.date).format('DD/MM/YYYY')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 text-sm">{o.customerName}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">{o.items.length} SP</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-black text-slate-900">{formatCurrency(o.total)}</p>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <p className={`font-bold text-sm ${(o.profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(o.profit || 0)}</p>
                    </td>
                  )}
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${(o.paymentStatus || PaymentStatus.PAID) === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' :
                      o.paymentStatus === PaymentStatus.PARTIAL ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'}`}>
                      {(o.paymentStatus || PaymentStatus.PAID) === PaymentStatus.PAID ? '🟢 Đã TT' :
                        o.paymentStatus === PaymentStatus.PARTIAL ? '🟡 TT 1 phần' : '🔴 Chưa TT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Xem chi tiết"
                      ><Eye size={15} /></button>
                      <button
                        onClick={() => handlePrintOrder(o)}
                        className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="In đơn"
                      ><Printer size={15} /></button>
                      <button
                        onClick={() => handleExportSingleOrder(o)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors" title="Xuất Excel"
                      ><Download size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Chi tiết đơn hàng</h2>
                  <p className="text-sm font-mono text-blue-600 font-bold">{selectedOrder.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintOrder(selectedOrder)}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                  ><Printer size={14} /> In đơn</button>
                  <button
                    onClick={() => handleExportSingleOrder(selectedOrder)}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all"
                  ><Download size={14} /> Excel</button>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer & Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Thông tin khách</p>
                    <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                    <p className="text-xs text-slate-500">{dayjs(selectedOrder.date).format('HH:mm - DD/MM/YYYY')}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Thanh toán</p>
                    <p className="font-bold text-slate-900">{selectedOrder.paymentMethod}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${(selectedOrder.paymentStatus || PaymentStatus.PAID) === PaymentStatus.PAID ? 'bg-emerald-100 text-emerald-700' :
                      selectedOrder.paymentStatus === PaymentStatus.PARTIAL ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'}`}>
                      {(selectedOrder.paymentStatus || PaymentStatus.PAID) === PaymentStatus.PAID ? '🟢 Đã thanh toán' :
                        selectedOrder.paymentStatus === PaymentStatus.PARTIAL ? '🟡 TT 1 phần' : '🔴 Chưa thanh toán'}
                    </span>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-3">Danh sách sản phẩm</p>
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold">
                        <tr>
                          <th className="px-4 py-3">Sản phẩm</th>
                          <th className="px-4 py-3 text-center">SL</th>
                          <th className="px-4 py-3 text-right">Đơn giá</th>
                          <th className="px-4 py-3 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                              <p className="text-[10px] text-slate-500">{item.sku}</p>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-700">{item.qty}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">{formatCurrency(item.price)}</td>
                            <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tạm tính</span><span className="font-medium">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discountOrder > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Giảm giá</span><span className="font-medium text-rose-500">-{formatCurrency(selectedOrder.discountOrder)}</span>
                    </div>
                  )}
                  {selectedOrder.shipFee > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Phí ship</span><span className="font-medium">{formatCurrency(selectedOrder.shipFee)}</span>
                    </div>
                  )}
                  {(selectedOrder.vat || 0) > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>VAT</span><span className="font-medium">{formatCurrency(selectedOrder.vat || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900 text-base">Tổng cộng</span>
                    <span className="font-black text-blue-600 text-lg">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  {selectedOrder.cashReceived > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Tiền khách đưa</span><span className="font-medium">{formatCurrency(selectedOrder.cashReceived)}</span>
                    </div>
                  )}
                  {(selectedOrder.cashChange || 0) > 0 && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Tiền thối lại</span><span className="font-medium text-emerald-600">{formatCurrency(selectedOrder.cashChange || 0)}</span>
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex justify-between text-sm pt-1 border-t border-dashed border-slate-300">
                      <span className="text-slate-500">Lợi nhuận</span>
                      <span className={`font-bold ${(selectedOrder.profit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(selectedOrder.profit || 0)} ({(selectedOrder.margin || 0).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick payment status toggle */}
                {(selectedOrder.paymentStatus !== PaymentStatus.PAID) && (
                  <button
                    onClick={() => {
                      setData(prev => ({ ...prev, orders: prev.orders.map(ord => ord.id === selectedOrder.id ? { ...ord, paymentStatus: PaymentStatus.PAID, paidAmount: ord.total } : ord) }));
                      setSelectedOrder(prev => prev ? { ...prev, paymentStatus: PaymentStatus.PAID, paidAmount: prev.total } : null);
                    }}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Xác nhận đã thanh toán đủ
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'pos': return <POSView />;
      case 'inventory': return <InventoryView />;
      case 'orders': return <OrdersView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Sổ Bán Hàng Pro</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Enterprise Edition</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={ShoppingCart} label="Bán hàng (POS)" active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} />
            <SidebarItem icon={Package} label="Kho hàng" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <SidebarItem icon={ClipboardList} label="Đơn hàng" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
            <SidebarItem icon={BarChart3} label="Báo cáo & Thuế" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <SidebarItem icon={Settings} label="Cài đặt" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <UserCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{data.currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{data.currentUser.role}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors" title="Đăng xuất">
                <LogOut size={18} />
              </button>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Hỗ trợ kỹ thuật</p>
              <p className="text-xs text-slate-600 leading-relaxed">Hệ thống đang hoạt động ổn định. Phiên bản v2.4.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
              <span>Hệ thống</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 font-medium capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhanh..."
                className="bg-transparent border-none outline-none text-sm w-40"
              />
            </div>
            <button
              onClick={() => { setShowApiKeyModal(true); setApiKeyInput(data.settings.geminiApiKey); }}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              <Key size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700 hidden md:inline">Settings</span>
              <span className="text-[10px] font-bold text-rose-500 hidden md:inline">Lấy API key để sử dụng app</span>
            </button>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-400 uppercase">Hôm nay</p>
                <p className="text-sm font-bold text-slate-900">{dayjs().format('DD [Tháng] MM, YYYY')}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Key size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Cấu hình API Key</h2>
              <p className="text-sm text-slate-500 mt-2">Nhập Gemini API Key để sử dụng các tính năng AI trong ứng dụng.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">API Key</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  autoFocus
                />
              </div>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              >
                <Sparkles size={14} />
                👉 Lấy API Key miễn phí tại Google AI Studio
              </a>
              <div className="flex gap-3 pt-2">
                {data.settings.geminiApiKey && (
                  <button
                    onClick={() => setShowApiKeyModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all"
                  >
                    Hủy
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!apiKeyInput.trim()) {
                      Swal.fire('Thiếu API Key', 'Vui lòng nhập API Key để tiếp tục!', 'warning');
                      return;
                    }
                    setData(prev => ({ ...prev, settings: { ...prev.settings, geminiApiKey: apiKeyInput.trim() } }));
                    setShowApiKeyModal(false);
                    Swal.fire('Thành công', 'API Key đã được lưu!', 'success');
                  }}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Lưu API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PRODUCT MODAL ===== */}
      {productModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {productModal.mode === 'add' ? '➕ Thêm sản phẩm mới' : '✏️ Chỉnh sửa sản phẩm'}
              </h2>
              <button onClick={() => setProductModal(m => ({ ...m, open: false }))} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã SKU {productModal.mode === 'edit' && <span className="text-slate-400">(không đổi)</span>}</label>
                  <input
                    className={`w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm ${productModal.mode === 'edit' ? 'bg-slate-50 text-slate-400' : ''}`}
                    value={productModal.product.sku || ''}
                    disabled={productModal.mode === 'edit'}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, sku: e.target.value } }))}
                    placeholder="VD: SP001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên sản phẩm *</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    value={productModal.product.name || ''}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, name: e.target.value } }))}
                    placeholder="Tên sản phẩm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Danh mục *</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm bg-white"
                    value={productModal.product.category || ''}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, category: e.target.value } }))}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {Array.from(new Set(data.products.map(p => p.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__new__">+ Danh mục mới...</option>
                  </select>
                  {productModal.product.category === '__new__' && (
                    <input
                      className="w-full mt-2 px-3 py-2 rounded-xl border border-blue-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      placeholder="Nhập tên danh mục mới"
                      autoFocus
                      onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, category: e.target.value || '__new__' } }))}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nhà cung cấp</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    value={productModal.product.supplier || ''}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, supplier: e.target.value } }))}
                    placeholder="Tên nhà cung cấp"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá bán (₫)</label>
                  <input type="number" min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    value={productModal.product.salePrice || ''}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, salePrice: Number(e.target.value) } }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá vốn (₫)</label>
                  <input type="number" min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    value={productModal.product.costAvg || ''}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, costAvg: Number(e.target.value) } }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tồn kho hiện tại</label>
                  <input type="number" min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    value={productModal.product.stock ?? ''}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, stock: Number(e.target.value) } }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tồn tối thiểu</label>
                  <input type="number" min="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    value={productModal.product.minStock ?? ''}
                    onChange={e => setProductModal(m => ({ ...m, product: { ...m.product, minStock: Number(e.target.value) } }))}
                    placeholder="5"
                  />
                </div>
              </div>
              {!!(productModal.product.salePrice && productModal.product.costAvg && productModal.product.salePrice > productModal.product.costAvg) && (
                <div className="bg-emerald-50 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
                  💰 Biên lợi nhuận: {(((productModal.product.salePrice! - productModal.product.costAvg!) / productModal.product.salePrice!) * 100).toFixed(1)}% ({formatCurrency(productModal.product.salePrice! - productModal.product.costAvg!)}/sp)
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setProductModal(m => ({ ...m, open: false }))}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >Hủy</button>
              <button
                onClick={() => {
                  const p = productModal.product;
                  const cat = (p.category === '__new__' || !p.category) ? '' : p.category;
                  if (!p.sku || !p.name || !cat) {
                    Swal.fire('Thiếu thông tin', 'Vui lòng nhập đủ SKU, Tên và Danh mục!', 'warning');
                    return;
                  }
                  if (productModal.mode === 'add') {
                    if (data.products.some(x => x.sku === p.sku)) {
                      Swal.fire('Lỗi', 'SKU đã tồn tại!', 'error');
                      return;
                    }
                    const newProd: Product = {
                      sku: p.sku!, name: p.name!, category: cat,
                      supplier: p.supplier || '', salePrice: p.salePrice || 0,
                      costAvg: p.costAvg || 0, stock: p.stock || 0,
                      minStock: p.minStock || 5, active: true
                    };
                    setData(prev => ({ ...prev, products: [...prev.products, newProd] }));
                    Swal.fire('✅ Thành công', `Đã thêm "${newProd.name}"!`, 'success');
                  } else {
                    const updated: Product = { ...p as Product, category: cat };
                    setData(prev => ({ ...prev, products: prev.products.map(x => x.sku === updated.sku ? updated : x) }));
                    Swal.fire('✅ Đã lưu', `Cập nhật "${updated.name}" thành công!`, 'success');
                  }
                  setProductModal(m => ({ ...m, open: false }));
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                {productModal.mode === 'add' ? '➕ Thêm sản phẩm' : '💾 Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
