import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { AuthShell } from '../../components/auth/AuthShell';
import { FormField } from '../../components/auth/FormField';
import { useAuth } from '../../context/AuthContext';
import { RegisterPayload } from '../../types/auth';

interface RegisterPageProps {
  onGoToLogin: () => void;
}

type Errors = Partial<Record<keyof RegisterPayload, string>>;

const EMPTY_FORM: RegisterPayload = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

/** Kiểm tra phía client – trùng quy tắc với backend (RegisterRequest) để báo lỗi ngay khi nhập. */
function validate(form: RegisterPayload): Errors {
  const errors: Errors = {};
  if (form.fullName.trim().length < 2) errors.fullName = 'Vui lòng nhập họ và tên';
  if (!/^0\d{9,10}$/.test(form.phone.replace(/[\s.-]/g, ''))) {
    errors.phone = 'Số điện thoại gồm 10–11 số, bắt đầu bằng 0';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Email không hợp lệ';
  if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = 'Tối thiểu 8 ký tự, gồm cả chữ và số';
  }
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  if (!form.acceptTerms) errors.acceptTerms = 'Bạn cần đồng ý điều khoản để tiếp tục';
  return errors;
}

/** UI 2 – Đăng ký tài khoản Khách hàng WaterFlow. */
export const RegisterPage: React.FC<RegisterPageProps> = ({ onGoToLogin }) => {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setServerError(null);
    setSubmitting(true);
    try {
      await register({ ...form, fullName: form.fullName.trim(), email: form.email.trim() });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Đăng ký"
      subtitle="Tạo tài khoản theo dõi và thanh toán tiền nước"
      footer={
        <>
          Đã có tài khoản?{' '}
          <button type="button" onClick={onGoToLogin} className="font-bold text-sky-700 hover:underline">
            Đăng nhập
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {serverError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <FormField
          label="Họ và tên"
          icon={User}
          placeholder="Ví dụ: Nguyễn Văn An"
          autoComplete="name"
          value={form.fullName}
          error={errors.fullName}
          onChange={(e) => update('fullName', e.target.value)}
        />
        <FormField
          label="Số điện thoại"
          icon={Phone}
          type="tel"
          placeholder="0901 234 567"
          autoComplete="tel"
          value={form.phone}
          error={errors.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <FormField
          label="Email"
          icon={Mail}
          type="email"
          placeholder="nguyenvanan@example.com"
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => update('email', e.target.value)}
        />
        <FormField
          label="Mật khẩu"
          icon={Lock}
          type="password"
          placeholder="Tối thiểu 8 ký tự, có chữ và số"
          autoComplete="new-password"
          value={form.password}
          error={errors.password}
          onChange={(e) => update('password', e.target.value)}
        />
        <FormField
          label="Xác nhận mật khẩu"
          icon={ShieldCheck}
          type="password"
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
        />

        <div>
          <label className="flex items-start gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => update('acceptTerms', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              Tôi đồng ý với <span className="font-semibold text-sky-700">Điều khoản sử dụng</span> &amp;{' '}
              <span className="font-semibold text-sky-700">Quy định cấp nước</span>
            </span>
          </label>
          {errors.acceptTerms && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.acceptTerms}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-sm font-bold shadow-md shadow-sky-200 transition-colors"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Đăng ký tài khoản <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};
