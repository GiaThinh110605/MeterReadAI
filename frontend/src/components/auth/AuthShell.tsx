import React from 'react';
import { Droplet, Headphones } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Khung chung cho UI 1 (Đăng nhập) và UI 2 (Đăng ký): logo, thẻ form giữa màn hình, chân trang hỗ trợ. */
export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-slate-50 to-slate-100">
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-sky-100/60 px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white shadow-md shadow-sky-200">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <p className="mt-3 text-lg font-black text-sky-900 tracking-tight">WaterFlow</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>
          </div>
          {children}
        </div>
        <div className="mt-4 text-center text-xs text-slate-600">{footer}</div>
      </div>
    </main>

    <footer className="border-t border-slate-200 bg-white/70">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-500">
        <span>© {new Date().getFullYear()} WaterFlow Portal · Hệ thống quản lý dịch vụ cấp nước đô thị thông minh</span>
        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
          <Headphones className="w-3.5 h-3.5 text-sky-600" />
          Hỗ trợ: <span className="text-sky-700">1900 1289</span>
        </span>
      </div>
    </footer>
  </div>
);
