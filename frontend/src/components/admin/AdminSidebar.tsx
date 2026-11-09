import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Tag,
  FileText,
  AlertCircle,
  BarChart3,
  LogOut,
  Activity,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onSwitchPortal?: (target: 'reader' | 'customer') => void;
  onLogout?: () => void;
  pendingComplaintsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  pendingComplaintsCount = 0,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'routes', label: 'Tuyến đường', icon: MapPin },
    { id: 'employees', label: 'Nhân viên', icon: Users },
    { id: 'pricing', label: 'Biểu giá', icon: Tag },
    { id: 'invoices', label: 'Hóa đơn', icon: FileText },
    {
      id: 'complaints',
      label: 'Khiếu nại',
      icon: AlertCircle,
      badge: pendingComplaintsCount > 0 ? pendingComplaintsCount : undefined,
    },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white">
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-slate-800 tracking-tight text-lg leading-tight">WaterFlow</div>
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">CỔNG QUẢN TRỊ</div>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            DANH MỤC QUẢN LÝ
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-2 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Hạ tầng trực tuyến</span>
            <span className="text-emerald-600 font-semibold ml-auto">99.9%</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Hệ thống cấp nước v2.4.0</div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between h-screen sticky top-0 shadow-sm shrink-0">
        {sidebarContent}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

