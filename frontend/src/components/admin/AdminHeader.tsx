import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';

interface AdminHeaderProps {
  adminName?: string;
  adminRole?: string;
  onToggleMobileSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminName = 'Quản trị viên',
  adminRole = 'Quản trị viên hệ thống',
  onToggleMobileSidebar,
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-2 sm:space-x-3 text-slate-500 text-sm">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors -ml-2"
            aria-label="Mở menu quản trị"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">Cấp nước Đô thị</span>
        <span className="text-slate-300 hidden sm:inline">•</span>
        <span className="hidden sm:inline text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
          PHIÊN BẢN 2.4.0
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <button
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Thông báo"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-800 leading-tight">{adminName}</div>
            <div className="text-[11px] text-slate-400 font-medium">{adminRole}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shadow-sm">
            {getInitials(adminName)}
          </div>
        </div>
      </div>
    </header>
  );
};

