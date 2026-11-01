import React, { useState } from 'react';
import {
  BarChart3,
  ClipboardList,
  Droplet,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageSquareWarning,
  Receipt,
  Users,
  X,
} from 'lucide-react';
import { AuthUser } from '../../types/auth';

export type AdminPage = 'dashboard' | 'reports';

interface NavItem {
  key: string;
  label: string;
  icon: typeof LayoutDashboard;
  page?: AdminPage; // undefined = màn hình do thành viên khác phụ trách, chưa ghép vào
}

// 8 màn hình Admin theo Stitch (UI 12–19)
const NAV_ITEMS: NavItem[] = [
  { key: 'ui12', label: 'Tổng quan', icon: LayoutDashboard, page: 'dashboard' },
  { key: 'ui13', label: 'Quản lý tuyến đường', icon: Map },
  { key: 'ui14', label: 'Phân công tuyến', icon: ClipboardList },
  { key: 'ui15', label: 'Quản lý nhân viên', icon: Users },
  { key: 'ui16', label: 'Quản lý hóa đơn', icon: Receipt },
  { key: 'ui17', label: 'Quản lý biểu giá', icon: FileText },
  { key: 'ui18', label: 'Thống kê báo cáo', icon: BarChart3, page: 'reports' },
  { key: 'ui19', label: 'Xử lý khiếu nại', icon: MessageSquareWarning },
];

interface AdminLayoutProps {
  user: AuthUser;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ user, currentPage, onNavigate, onLogout, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-full">
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-sm shadow-sky-200">
            <Droplet className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sky-900 leading-none">WaterFlow</h1>
            <p className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">Cổng quản trị</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2">Điều hành</p>
          {NAV_ITEMS.map((item) => {
            const active = item.page === currentPage;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                disabled={!item.page}
                onClick={() => {
                  if (item.page) onNavigate(item.page);
                  setMobileOpen(false);
                }}
                title={item.page ? undefined : 'Màn hình đang được thành viên khác phát triển'}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : item.page
                      ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {!item.page && <span className="text-[9px] font-bold uppercase text-slate-300">Sắp có</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Vai trò</p>
        <p className="text-xs font-bold text-slate-700 mt-0.5">Quản trị viên (Admin)</p>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="hidden lg:block sticky top-0 h-screen shrink-0">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          <button
            className="lg:hidden p-2 -ml-2 text-slate-500 rounded-lg hover:bg-slate-50"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <p className="hidden lg:block text-xs font-semibold text-slate-500">
            Hệ thống quản lý dịch vụ cấp nước đô thị thông minh
          </p>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</p>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">{user.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-sm">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 pl-3 ml-1 border-l border-slate-200 text-xs font-semibold text-slate-500 hover:text-rose-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
