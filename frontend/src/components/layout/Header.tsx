import React from 'react';
import { Bell, MapPin, Calendar, User } from 'lucide-react';

interface HeaderProps {
  currentRouteTitle?: string;
  billingPeriod?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentRouteTitle = 'Tuyến A01 - P. Bến Nghé',
  billingPeriod = 'Kỳ 04/2025'
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

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-sky-700 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">Nguyễn Tuấn</p>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">NV Ghi số #NV-4881</p>
          </div>
        </div>
      </div>
    </header>
  );
};
