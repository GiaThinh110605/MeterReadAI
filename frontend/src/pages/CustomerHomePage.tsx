import React from 'react';
import { Droplet, LogOut } from 'lucide-react';
import { AuthUser } from '../types/auth';

/**
 * Màn hình tạm cho vai trò Khách hàng sau khi đăng nhập / đăng ký.
 * Cổng khách hàng đầy đủ (UI 3–8) do thành viên khác phụ trách sẽ thay thế component này.
 */
export const CustomerHomePage: React.FC<{ user: AuthUser; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white">
          <Droplet className="w-5 h-5 fill-white" />
        </div>
        <span className="text-base font-bold text-sky-900">WaterFlow</span>
      </div>
      <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600">
        <LogOut className="w-4 h-4" /> Đăng xuất
      </button>
    </header>
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-black text-slate-900">Xin chào, {user.fullName}!</h1>
      <p className="mt-2 text-sm text-slate-500">
        Bạn đã đăng nhập thành công vào Cổng khách hàng WaterFlow ({user.email}).
      </p>
      <p className="mt-6 text-xs text-slate-400">Cổng khách hàng (hóa đơn, lịch sử tiêu thụ, thanh toán) đang được hoàn thiện.</p>
    </main>
  </div>
);
