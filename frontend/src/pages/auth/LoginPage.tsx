import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Lock, User } from 'lucide-react';
import { AuthShell } from '../../components/auth/AuthShell';
import { FormField } from '../../components/auth/FormField';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onGoToRegister: () => void;
}

/** UI 1 – Đăng nhập WaterFlow (dùng chung cho Khách hàng, Nhân viên ghi số, Quản trị viên). */
export const LoginPage: React.FC<LoginPageProps> = ({ onGoToRegister }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgotHint, setShowForgotHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập email/số điện thoại và mật khẩu');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password }, remember);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Cổng dịch vụ khách hàng cấp nước trực tuyến"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <button type="button" onClick={onGoToRegister} className="font-bold text-sky-700 hover:underline">
            Đăng ký ngay
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <FormField
          label="Email / Số điện thoại"
          icon={User}
          placeholder="Nhập email hoặc số điện thoại của bạn"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <FormField
          label="Mật khẩu"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Ghi nhớ đăng nhập
          </label>
          <button
            type="button"
            onClick={() => setShowForgotHint((v) => !v)}
            className="font-semibold text-sky-700 hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>
        {showForgotHint && (
          <p className="text-[11px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            Vui lòng liên hệ tổng đài <strong>1900 1289</strong> hoặc quầy giao dịch để được cấp lại mật khẩu.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-sm font-bold shadow-md shadow-sky-200 transition-colors"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Đăng nhập <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
};
