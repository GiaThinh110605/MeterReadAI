import React, { useCallback, useEffect, useState } from 'react';
import { BadgePercent, Cpu, Download, Droplets, Wallet } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminReportData } from '../../types/admin';
import { Donut, HorizontalBars, Legend, StackedBarChart } from '../../components/admin/Charts';
import { ErrorState, LoadingState, MonthInput, PageHeading, Panel, StatCard } from '../../components/admin/AdminUI';
import {
  ABNORMALITY_LABELS,
  formatCompactVND,
  formatNumber,
  formatPeriod,
  formatVND,
} from '../../components/admin/format';

/** Xuất bảng số liệu theo tháng ra CSV (mở được bằng Excel, có BOM để giữ tiếng Việt). */
function downloadCsv(report: AdminReportData) {
  const header = ['Kỳ', 'Số lượt ghi', 'Sản lượng (m3)', 'Số hóa đơn', 'Doanh thu (đ)', 'Đã thu (đ)', 'Còn nợ (đ)'];
  const rows = report.monthly.map((m) => [
    m.period, m.readingsCount, m.consumption, m.invoiceCount, m.revenue, m.paidAmount, m.unpaidAmount,
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `bao-cao-waterflow_${report.fromPeriod}_${report.toPeriod}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** UI 18 – Thống kê báo cáo Admin */
export const AdminReportsPage: React.FC = () => {
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [data, setData] = useState<AdminReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getReport(range.from, range.to)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [range]);

  useEffect(load, [load]);

  if (loading && !data) return <LoadingState />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { totals, ai } = data;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeading
        eyebrow={`Báo cáo • ${formatPeriod(data.fromPeriod)} – ${formatPeriod(data.toPeriod)}`}
        title="Thống kê báo cáo"
        description="Phân tích sản lượng, doanh thu – công nợ, chất lượng nhận diện AI và hiệu suất ghi số theo kỳ."
        actions={
          <>
            <MonthInput label="Từ kỳ" value={data.fromPeriod} max={data.toPeriod} onChange={(v) => setRange({ from: v, to: data.toPeriod })} />
            <MonthInput label="Đến kỳ" value={data.toPeriod} onChange={(v) => setRange({ from: data.fromPeriod, to: v })} />
            <button
              onClick={() => downloadCsv(data)}
              className="min-h-[40px] flex items-center gap-1.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
            >
              <Download className="w-4 h-4" /> Xuất CSV
            </button>
          </>
        }
      />
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${loading ? 'opacity-60' : ''}`}>
        <StatCard
          icon={Droplets}
          tone="indigo"
          label="Tổng sản lượng"
          value={`${formatNumber(totals.consumption)} m³`}
          hint={`TB ${formatNumber(totals.averageConsumptionPerReading)} m³ / lượt ghi`}
        />
        <StatCard icon={Wallet} tone="emerald" label="Tổng doanh thu" value={formatVND(totals.revenue)} hint={`Đã thu ${formatVND(totals.paidAmount)}`} />
        <StatCard icon={BadgePercent} tone="amber" label="Tỷ lệ thu tiền" value={`${totals.collectionRate}%`} hint={`Còn nợ ${formatVND(totals.unpaidAmount)}`} />
        <StatCard icon={Cpu} label="AI đọc đúng" value={`${ai.accuracyRate}%`} hint={`${ai.corrected}/${ai.totalReadings} lượt phải sửa`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Sản lượng tiêu thụ theo tháng" subtitle="Tổng m³ đã chốt mỗi kỳ">
          <StackedBarChart
            formatValue={(v) => formatNumber(v)}
            data={data.monthly.map((m) => ({
              label: formatPeriod(m.period),
              segments: [{ name: 'Sản lượng (m³)', value: m.consumption, className: 'bg-indigo-500' }],
            }))}
          />
        </Panel>
        <Panel
          title="Doanh thu & công nợ theo tháng"
          subtitle="Tổng tiền hóa đơn phát hành"
          action={<Legend items={[{ name: 'Đã thu', className: 'bg-emerald-500' }, { name: 'Còn nợ', className: 'bg-rose-400' }]} />}
        >
          <StackedBarChart
            formatValue={formatCompactVND}
            data={data.monthly.map((m) => ({
              label: formatPeriod(m.period),
              segments: [
                { name: 'Đã thu', value: m.paidAmount, className: 'bg-emerald-500' },
                { name: 'Còn nợ', value: m.unpaidAmount, className: 'bg-rose-400' },
              ],
            }))}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Chất lượng nhận diện AI" subtitle="YOLO11n-seg + CRNN">
          <div className="flex flex-col items-center gap-3">
            <Donut percent={ai.accuracyRate} label="giữ nguyên" />
            <p className="text-[11px] text-slate-500 text-center">
              {ai.acceptedAsIs} lượt nhân viên xác nhận đúng kết quả AI, {ai.corrected} lượt phải sửa (có lưu vết lý do).
            </p>
          </div>
        </Panel>
        <Panel title="Tiêu thụ theo loại khách hàng" subtitle="m³ trong khoảng báo cáo">
          <HorizontalBars
            formatValue={(v) => `${formatNumber(v)} m³`}
            items={data.consumptionByMeterType.map((c) => ({ label: c.label, value: c.value, hint: `(${c.count} lượt)` }))}
          />
        </Panel>
        <Panel title="Sự cố hiện trường theo loại" subtitle="Số biên bản bất thường">
          <HorizontalBars
            barClass="bg-amber-500"
            formatValue={(v) => `${v}`}
            items={data.abnormalitiesByType.map((a) => ({ label: ABNORMALITY_LABELS[a.label] ?? a.label, value: a.count }))}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Top 5 khách hàng tiêu thụ nhiều nhất">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-2 font-bold">Khách hàng</th>
                  <th className="pb-2 font-bold">Loại</th>
                  <th className="pb-2 font-bold text-right">Sản lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.topConsumers.map((t) => (
                  <tr key={t.meterCode}>
                    <td className="py-2.5 pr-3">
                      <p className="font-bold text-slate-800">{t.customerName}</p>
                      <p className="text-[11px] text-slate-500">{t.meterCode}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600">{t.meterType}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 whitespace-nowrap">{formatNumber(t.consumption)} m³</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Hiệu suất nhân viên ghi số" subtitle="Số lượt ghi và tỷ lệ phải sửa kết quả AI">
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-2 font-bold">Nhân viên</th>
                  <th className="pb-2 font-bold text-right">Lượt ghi</th>
                  <th className="pb-2 font-bold text-right">Đã sửa</th>
                  <th className="pb-2 font-bold text-right">Tỷ lệ sửa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.employeePerformance.map((e) => (
                  <tr key={e.employeeCode}>
                    <td className="py-2.5 pr-3">
                      <p className="font-bold text-slate-800">{e.fullName}</p>
                      <p className="text-[11px] text-slate-500">{e.employeeCode}</p>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{e.readings}</td>
                    <td className="py-2.5 text-right text-slate-600">{e.corrected}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">{e.correctionRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};
