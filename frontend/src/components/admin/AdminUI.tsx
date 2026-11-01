import React from 'react';
import { AlertCircle, LucideIcon, RefreshCw } from 'lucide-react';

export const Panel: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => (
  <section className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const StatCard: React.FC<{
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: React.ReactNode;
  tone?: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo';
}> = ({ icon: Icon, label, value, hint, tone = 'sky' }) => {
  const tones = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      {hint && <div className="mt-1 text-[11px] font-medium text-slate-500">{hint}</div>}
    </div>
  );
};

export const LoadingState: React.FC = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-center">
    <AlertCircle className="w-8 h-8 text-rose-500" />
    <p className="text-sm font-semibold text-slate-700">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700"
    >
      <RefreshCw className="w-3.5 h-3.5" /> Thử lại
    </button>
  </div>
);

export const PageHeading: React.FC<{ eyebrow: string; title: string; description: string; actions?: React.ReactNode }> = ({
  eyebrow,
  title,
  description,
  actions,
}) => (
  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
    <div>
      <p className="text-[11px] font-bold text-sky-700 tracking-wider uppercase mb-1">{eyebrow}</p>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">{description}</p>
    </div>
    {actions && <div className="flex flex-wrap items-end gap-2">{actions}</div>}
  </div>
);

export const MonthInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; max?: string }> = ({
  label,
  value,
  onChange,
  max,
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    <input
      type="month"
      value={value}
      max={max}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      className="min-h-[40px] px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
    />
  </label>
);
