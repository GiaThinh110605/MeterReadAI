import React from 'react';
import { Bell } from 'lucide-react';

interface CustomerHeaderProps {
  customerName: string;
  meterSerial: string;
  onOpenNotifications?: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customerName,
  meterSerial,
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'KH';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <p className="text-[10px] tracking-wider font-bold text-slate-400 uppercase">
          CỔNG DỊCH VỤ KHÁCH HÀNG
        </p>
        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
          Xin chào, {customerName}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          <span>Đồng hồ số: {meterSerial}</span>
        </div>

        <button
          type="button"
          className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-sky-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {getInitials(customerName)}
          </div>
          <span className="text-xs font-bold text-slate-700 hidden sm:inline">
            {customerName}
          </span>
        </div>
      </div>
    </header>
  );
};

