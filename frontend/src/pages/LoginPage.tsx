import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Headphones,
  Droplet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { LoginFormData, UserAuthSession } from '../types';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: UserAuthSession) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = formData.identifier.trim();
    if (!identifier) {
      setErrorMessage('Vui lòng nhập Email hoặc Số điện thoại của bạn');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Vui lòng nhập Mật khẩu');
      return;
    }

    setIsLoading(true);

    try {
      const user = await api.login({
        ...formData,
        identifier,
      });
      setIsLoading(false);
      setSuccessToast(`Đăng nhập thành công! Chào mừng ${user.fullName}`);
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Đăng nhập không thành công');
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập - WaterFlow"
      currentPage="login"
      onSwitchPage={(page) => {
        if (page === 'register') onNavigateToRegister();
      }}
    >
      <div className="flex-1 flex flex-col justify-between py-10 px-4 sm:px-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[420px] bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-200 mb-3">
              <Droplet className="w-6 h-6 fill-white" />
            </div>

            <h1 className="text-base font-bold text-slate-900 tracking-tight text-center">
              WaterFlow
            </h1>
            <h2 className="text-sm font-semibold text-slate-800 mt-1 text-center">
              Đăng nhập
            </h2>
            <p className="text-xs text-slate-500 mt-1 text-center max-w-[280px]">
              Cổng dịch vụ khách hàng cấp nước trực tuyến
            </p>

            {errorMessage && (
              <div
                role="alert"
                className="w-full mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successToast && (
              <div
                role="status"
                className="w-full mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successToast}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5"
                >
                  EMAIL / SỐ ĐIỆN THOẠI
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    value={formData.identifier}
                    onChange={(e) =>
                      setFormData({ ...formData, identifier: e.target.value })
                    }
                    placeholder="Nhập email hoặc số điện thoại của bạn"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase mb-1.5"
                >
                  MẬT KHẨU
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-600">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-slate-600 hover:text-sky-600 font-medium transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-xl font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng nhập</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="font-semibold text-slate-800 hover:text-sky-600 hover:underline transition-colors"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        <footer className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 pt-6 border-t border-slate-100 gap-2">
          <span>© 2026 WaterFlow Portal</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Headphones className="w-3.5 h-3.5 text-slate-500" />
            <span>Hỗ trợ:</span>
            <span className="font-bold text-slate-800">1900 1289</span>
          </div>
        </footer>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Khôi phục mật khẩu</h3>
            <p className="text-xs text-slate-500 mt-1">
              Nhập email hoặc số điện thoại đã đăng ký để nhận mã xác thực OTP.
            </p>

            {forgotSubmitted ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
                Mã xác thực đã được gửi qua SMS/Email. Vui lòng kiểm tra hộp thư!
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                  className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg font-medium"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Email hoặc số điện thoại"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotInput.trim()) setForgotSubmitted(true);
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
