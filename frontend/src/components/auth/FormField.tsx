import React, { useId, useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  icon: LucideIcon;
  error?: string;
}

/** Ô nhập có icon, nhãn, thông báo lỗi; type="password" tự có nút ẩn/hiện mật khẩu. */
export const FormField: React.FC<FormFieldProps> = ({ label, icon: Icon, error, type = 'text', ...inputProps }) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 transition-colors focus-within:ring-2 ${
          error
            ? 'border-rose-300 focus-within:ring-rose-100'
            : 'border-slate-200 focus-within:border-sky-500 focus-within:ring-sky-100'
        }`}
      >
        <Icon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full min-h-[44px] bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="p-1.5 -mr-1 text-slate-400 hover:text-slate-600 rounded-lg"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
};
