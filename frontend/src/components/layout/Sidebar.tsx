import React from 'react';
import { Route, History, Droplet, X } from 'lucide-react';

interface SidebarProps {
  currentPage: 'routes' | 'reading' | 'history' | 'login' | 'register' | 'customer';
  onNavigate: (page: 'routes' | 'history' | 'login' | 'register' | 'customer') => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const content = (
    <div className="flex flex-col justify-between h-full bg-white">
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-sm shadow-sky-200">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-sky-900 leading-none">WaterFlow</h1>
              <p className="text-[10px] tracking-wider text-slate-400 font-semibold uppercase mt-0.5">
                HỆ THỐNG CẤP NƯỚC
              </p>
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

        <div className="p-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-2">
              PHÂN HỆ TÁC NGHIỆP
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  onNavigate('routes');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                  currentPage === 'routes' || currentPage === 'reading'
                    ? 'bg-sky-50 text-sky-700 shadow-sm shadow-sky-50 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Route className={`w-4 h-4 ${currentPage === 'routes' || currentPage === 'reading' ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>Tuyến đường</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('history');
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                  currentPage === 'history'
                    ? 'bg-sky-50 text-sky-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <History className={`w-4 h-4 ${currentPage === 'history' ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>Lịch sử ghi số</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] font-semibold text-emerald-700">Hệ thống sẵn sàng</span>
        </div>
        <div className="pt-2 border-t border-slate-200/60">
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">WaterFlow Mobile</p>
          <p className="text-xs font-bold text-slate-700 mt-0.5">Phiên bản Sản xuất</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between h-screen sticky top-0 shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
