import React from 'react';
import { Bell, MapPin, Calendar, User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentRouteTitle?: string;
  billingPeriod?: string;
  currentUser?: { fullName: string; role: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRouteTitle = 'Tuyến A01 - P. Bến Nghé',
  billingPeriod = 'Kỳ 04/2025',
  currentUser,
  onLogout,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold border border-sky-100">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span>{currentRouteTitle}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{billingPeriod}</span>
        </div>
      </div>


      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-sky-700 text-white flex items-center justify-center font-semibold text-xs shadow-sm">
            {currentUser?.fullName ? (
              currentUser.fullName.split(' ').slice(-1)[0][0]?.toUpperCase()
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {currentUser?.fullName || 'Nhân viên ghi số'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              {currentUser?.role === 'ADMIN'
                ? 'Quản trị viên'
                : currentUser?.role === 'CUSTOMER'
                ? 'Khách hàng cấp nước'
                : 'Nhân viên ghi số'}
            </p>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Đăng xuất / Quay về Đăng nhập"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

