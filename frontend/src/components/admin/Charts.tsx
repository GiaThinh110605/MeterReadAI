import React from 'react';

/* Biểu đồ nhẹ viết bằng SVG/Tailwind, không cần thêm thư viện. */

interface BarDatum {
  label: string;
  /** Các đoạn xếp chồng của 1 cột, vẽ từ dưới lên */
  segments: { value: number; className: string; name: string }[];
  title?: string;
}

interface StackedBarChartProps {
  data: BarDatum[];
  formatValue: (v: number) => string;
  height?: number;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, formatValue, height = 200 }) => {
  const max = Math.max(1, ...data.map((d) => d.segments.reduce((s, x) => s + x.value, 0)));
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }} role="img" aria-label="Biểu đồ cột">
      {data.map((d) => {
        const total = d.segments.reduce((s, x) => s + x.value, 0);
        return (
          <div key={d.label} className="flex-1 min-w-0 h-full flex flex-col items-center justify-end group">
            <span className="text-[10px] font-bold text-slate-600 mb-1 whitespace-nowrap">
              {total > 0 ? formatValue(total) : '—'}
            </span>
            <div
              className="w-full max-w-[44px] flex flex-col-reverse rounded-t-lg overflow-hidden bg-slate-100"
              style={{ height: `${(total / max) * 78}%`, minHeight: 2 }}
              title={d.title ?? d.segments.map((s) => `${s.name}: ${formatValue(s.value)}`).join('\n')}
            >
              {d.segments.map((s) => (
                <div
                  key={s.name}
                  className={`${s.className} transition-opacity group-hover:opacity-90`}
                  style={{ height: total ? `${(s.value / total) * 100}%` : 0 }}
                />
              ))}
            </div>
            <span className="mt-1.5 text-[10px] font-semibold text-slate-500 whitespace-nowrap">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

interface DonutProps {
  percent: number;
  label: string;
  colorClass?: string;
  size?: number;
}

export const Donut: React.FC<DonutProps> = ({ percent, label, colorClass = 'text-emerald-500', size = 132 }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" className="stroke-slate-100" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          stroke="currentColor"
          className={colorClass}
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900">{clamped.toFixed(1)}%</span>
        <span className="text-[10px] font-semibold text-slate-500">{label}</span>
      </div>
    </div>
  );
};

interface HBarItem {
  label: string;
  value: number;
  hint?: string;
}

export const HorizontalBars: React.FC<{ items: HBarItem[]; formatValue: (v: number) => string; barClass?: string }> = ({
  items,
  formatValue,
  barClass = 'bg-sky-500',
}) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="text-xs text-slate-400 py-6 text-center">Chưa có dữ liệu</p>;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-center justify-between text-xs mb-1 gap-2">
            <span className="font-semibold text-slate-700 truncate">{item.label}</span>
            <span className="font-bold text-slate-900 whitespace-nowrap">
              {formatValue(item.value)}
              {item.hint && <span className="ml-1 font-medium text-slate-400">{item.hint}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full rounded-full ${barClass}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export const Legend: React.FC<{ items: { name: string; className: string }[] }> = ({ items }) => (
  <div className="flex flex-wrap items-center gap-3">
    {items.map((i) => (
      <span key={i.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <span className={`w-2.5 h-2.5 rounded-sm ${i.className}`} />
        {i.name}
      </span>
    ))}
  </div>
);
