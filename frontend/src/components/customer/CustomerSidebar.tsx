import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  History,
  Camera,
  AlertTriangle,
  User,
  LogOut,
  Droplet,
} from 'lucide-react';

export type CustomerTab =
  | 'overview'
  | 'invoices'
  | 'history'
  | 'meter-image'
  | 'complaints'
  | 'payment';

interface CustomerSidebarProps {
  activeTab: CustomerTab;
  onTabChange: (tab: CustomerTab) => void;
  onLogout: () => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const isInvoiceActive = activeTab === 'invoices' || activeTab === 'payment';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-sm shadow-sky-200">
            <Droplet className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sky-900 leading-none">WaterFlow</h1>
            <p className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">
              CỔNG KHÁCH HÀNG
            </p>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2">
            QUẢN LÝ TIÊU THỤ
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => onTabChange('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-white' : 'text-slate-400'}`} />
              <span>Tổng quan</span>
            </button>

            <button
              onClick={() => onTabChange('invoices')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isInvoiceActive
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Receipt className={`w-4 h-4 ${isInvoiceActive ? 'text-white' : 'text-slate-400'}`} />
              <span>Hóa đơn</span>
            </button>


            <button
              onClick={() => onTabChange('history')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-white' : 'text-slate-400'}`} />
              <span>Lịch sử</span>
            </button>

            <button
              onClick={() => onTabChange('meter-image')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'meter-image'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Camera className={`w-4 h-4 ${activeTab === 'meter-image' ? 'text-white' : 'text-slate-400'}`} />
              <span>Ảnh chỉ số</span>
            </button>

            <button
              onClick={() => onTabChange('complaints')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'complaints'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${activeTab === 'complaints' ? 'text-white' : 'text-slate-400'}`} />
              <span>Khiếu nại</span>
            </button>
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all"
        >
          <User className="w-4 h-4 text-slate-400" />
          <span>Tài khoản</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

