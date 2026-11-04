import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Droplet,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  X,
} from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { RegisterFormData, UserAuthSession } from '../types';
import { api } from '../services/api';

interface RegisterPageProps {
  onRegisterSuccess: (user: UserAuthSession) => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage('Vui lòng nhập Họ và tên của bạn');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Số điện thoại không hợp lệ (tối thiểu 10 chữ số)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Địa chỉ Email không đúng định dạng');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('Vui lòng đồng ý với Điều khoản sử dụng & Quy định cấp nước');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = await api.register({
        ...formData,
        fullName: formData.fullName.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
      });
      setIsLoading(false);
      setSuccessToast('Đăng ký tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => {
        onRegisterSuccess(newUser);
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Đăng ký tài khoản thất bại');
    }
  };

  return (
    <AuthLayout
      title="Đăng ký - WaterFlow"
      currentPage="register"
      onSwitchPage={(page) => {
        if (page === 'login') onNavigateToLogin();
      }}
    >
      <div className="flex-1 flex flex-col justify-between py-8 px-4 sm:px-8">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[440px] bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-200 mb-3">
              <Droplet className="w-6 h-6 fill-white" />
            </div>

            <h1 className="text-base font-bold text-slate-900 tracking-tight text-center">
              WaterFlow
            </h1>
            <h2 className="text-sm font-semibold text-slate-800 mt-1 text-center">
              Đăng ký
            </h2>
            <p className="text-xs text-slate-500 mt-1 text-center max-w-[280px]">
              Tạo tài khoản theo dõi và thanh toán tiền nước
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

            <form onSubmit={handleSubmit} className="w-full mt-5 space-y-3.5">
              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-fullname"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Nhập họ và tên"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Nhập số điện thoại"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Nhập địa chỉ email"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full pl-10 pr-10 py-2 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all font-mono"
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

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-10 py-2 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={
                      showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreeTerms: e.target.checked,
                      })
                    }
                    className="w-3.5 h-3.5 rounded text-sky-600 border-slate-300 focus:ring-sky-500 mt-0.5 shrink-0"
                  />
                  <span className="text-xs text-slate-600 leading-tight">
                    Tôi đồng ý với{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-slate-800 font-semibold hover:text-sky-600 underline"
                    >
                      Điều khoản sử dụng & Quy định cấp nước
                    </button>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-xl font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Đăng ký tài khoản</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="font-semibold text-slate-800 hover:text-sky-600 hover:underline transition-colors"
                  >
                    Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        <footer className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-xs text-slate-600 pt-6 border-t border-slate-100 gap-1.5">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-800">WaterFlow</span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-slate-600">
              <span>Hotline hỗ trợ:</span>
              <span className="font-bold text-slate-800">1900 1289</span>
            </div>
          </div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase text-center">
            HỆ THỐNG QUẢN LÝ DỊCH VỤ CẤP NƯỚC ĐÔ THỊ THÔNG MINH
          </p>
        </footer>
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Điều khoản sử dụng & Quy định
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 text-xs text-slate-600 space-y-2.5 custom-scrollbar pr-1">
              <p className="font-semibold text-slate-800">
                1. Quyền lợi và Nghĩa vụ Khách hàng:
              </p>
              <p>
                - Khách hàng được cung cấp nước sạch sinh hoạt liên tục và đúng quy chuẩn chất lượng của Bộ Y tế.
              </p>
              <p>
                - Có trách nhiệm bảo vệ cụm đồng hồ nước, không tự ý tháo dỡ, can thiệp chì niêm phong hoặc thay đổi hiện trạng lắp đặt.
              </p>
              <p className="font-semibold text-slate-800 mt-2">
                2. Tính tiền nước và Chỉ số tiêu thụ:
              </p>
              <p>
                - Chỉ số nước được ghi nhận định kỳ mỗi tháng bằng công nghệ nhận dạng AI kết hợp nhân viên xác nhận.
              </p>
              <p>
                - Tiền nước được tính lũy tiến theo các bậc thang sinh hoạt, cộng 10% phí bảo vệ môi trường và 5% thuế GTGT theo quy định hiện hành.
              </p>
              <p className="font-semibold text-slate-800 mt-2">
                3. Bảo mật Thông tin:
              </p>
              <p>
                - WaterFlow cam kết bảo mật toàn bộ dữ liệu cá nhân, số điện thoại và lịch sử tiêu thụ nước của Quý khách theo chuẩn an toàn thông tin.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, agreeTerms: true }));
                  setShowTermsModal(false);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl shadow-sm"
              >
                Đồng ý & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};
