import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Cpu, Droplets, Gauge, Wallet } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { AdminDashboardData } from '../../types/admin';
import { Donut, Legend } from '../../components/admin/Charts';
import { ErrorState, LoadingState, MonthInput, PageHeading, Panel, StatCard } from '../../components/admin/AdminUI';
import {
  ABNORMALITY_LABELS,
  ROUTE_STATUS_LABELS,
  formatDateTime,
  formatNumber,
  formatPeriod,
  formatVND,
} from '../../components/admin/format';

const METER_SEGMENTS = [
  { key: 'recorded', name: 'Đã ghi', className: 'bg-emerald-500' },
  { key: 'pending', name: 'Chưa ghi', className: 'bg-slate-300' },
  { key: 'abnormal', name: 'Bất thường', className: 'bg-amber-500' },
  { key: 'locked', name: 'Khóa cửa', className: 'bg-rose-400' },
] as const;

/** UI 12 – Tổng quan Admin */
export const AdminDashboardPage: React.FC<{ onOpenReports: () => void }> = ({ onOpenReports }) => {
  const [period, setPeriod] = useState<string | undefined>(undefined);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .getDashboard(period)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(load, [load]);

  if (loading && !data) return <LoadingState />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { meters, revenue, ai } = data;
  const change = data.consumptionChangePercent;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <PageHeading
        eyebrow={`Bảng điều hành • Kỳ ${formatPeriod(data.billingPeriod)}`}
        title="Tổng quan hệ thống"
        description="Theo dõi tiến độ ghi số, sản lượng tiêu thụ, doanh thu và độ chính xác AI của toàn mạng lưới cấp nước."
        actions={<MonthInput label="Kỳ ghi số" value={data.billingPeriod} onChange={setPeriod} />}
      />
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${loading ? 'opacity-60' : ''}`}>
        <StatCard
          icon={Gauge}
          label="Tiến độ ghi số"
          value={`${meters.progressPercent}%`}
          hint={`${meters.recorded}/${meters.total} đồng hồ đã ghi`}
        />
        <StatCard
          icon={Droplets}
          tone="indigo"
          label="Sản lượng tiêu thụ"
          value={`${formatNumber(data.totalConsumption)} m³`}
          hint={
            change === null ? (
              'Chưa có số liệu kỳ trước'
            ) : (
              <span className={`inline-flex items-center gap-0.5 font-bold ${change >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(change)}% so với kỳ trước
              </span>
            )
          }
        />
        <StatCard
          icon={Wallet}
          tone="emerald"
          label="Doanh thu phát hành"
          value={formatVND(revenue.totalAmount)}
          hint={
            revenue.invoiceCount === 0
              ? 'Chưa phát hành hóa đơn kỳ này'
              : `Đã thu ${revenue.collectionRate}% • ${revenue.invoiceCount} hóa đơn`
          }
        />
        <StatCard
          icon={AlertTriangle}
          tone="amber"
          label="Sự cố chờ xử lý"
          value={String(data.pendingAbnormalities)}
          hint={`${data.totalReaders} nhân viên ghi số • ${data.totalCustomers} khách hàng`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel
          className="lg:col-span-2"
          title="Trạng thái đồng hồ toàn hệ thống"
          subtitle={`${meters.total} đồng hồ trên ${data.routes.length} tuyến`}
        >
          <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
            {METER_SEGMENTS.map((s) => (
              <div
                key={s.key}
                className={s.className}
                style={{ width: `${meters.total ? (meters[s.key] / meters.total) * 100 : 0}%` }}
                title={`${s.name}: ${meters[s.key]}`}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {METER_SEGMENTS.map((s) => (
              <div key={s.key} className="rounded-xl bg-slate-50 px-3 py-2">
                <Legend items={[{ name: s.name, className: s.className }]} />
                <p className="text-lg font-black text-slate-900 mt-0.5">{meters[s.key]}</p>
              </div>
            ))}
          </div>

          <h4 className="mt-6 mb-3 text-xs font-bold text-slate-700">Tiến độ theo tuyến</h4>
          <ul className="space-y-3">
            {data.routes.map((r) => (
              <li key={r.routeId}>
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className="font-semibold text-slate-700 truncate">{r.routeName}</span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                      {ROUTE_STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    <span className="font-bold text-slate-900">
                      {r.recordedMeters}/{r.totalMeters}
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${r.percentComplete}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Độ chính xác AI" subtitle="Tỷ lệ nhân viên giữ nguyên kết quả AI đọc">
          <div className="flex flex-col items-center gap-4">
            <Donut percent={ai.accuracyRate} label="đọc đúng" />
            <div className="w-full grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-emerald-50 py-2">
                <p className="text-lg font-black text-emerald-700">{ai.acceptedAsIs}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Giữ nguyên</p>
              </div>
              <div className="rounded-xl bg-amber-50 py-2">
                <p className="text-lg font-black text-amber-700">{ai.corrected}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase">Phải sửa</p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Cpu className="w-3.5 h-3.5" /> {ai.totalReadings} lượt ghi có kết quả AI trong kỳ
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title="Công nợ kỳ này" subtitle="Hóa đơn đã phát hành trong kỳ">
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-500 font-medium">Tổng phát hành</dt>
              <dd className="font-bold text-slate-900">{formatVND(revenue.totalAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 font-medium">Đã thu</dt>
              <dd className="font-bold text-emerald-600">{formatVND(revenue.paidAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 font-medium">Còn nợ</dt>
              <dd className="font-bold text-rose-600">{formatVND(revenue.unpaidAmount)}</dd>
            </div>
          </dl>
          <div className="mt-4 h-2 rounded-full bg-rose-100 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${revenue.collectionRate}%` }} />
          </div>
          <button
            onClick={onOpenReports}
            className="mt-5 w-full min-h-[40px] rounded-xl border border-sky-200 text-xs font-bold text-sky-700 hover:bg-sky-50"
          >
            Xem báo cáo thống kê chi tiết →
          </button>
        </Panel>

        <Panel className="lg:col-span-2" title="Sự cố hiện trường gần đây" subtitle="5 biên bản bất thường mới nhất">
          {data.recentAbnormalities.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có sự cố nào</p>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-xs min-w-[520px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="pb-2 font-bold">Đồng hồ</th>
                    <th className="pb-2 font-bold">Loại sự cố</th>
                    <th className="pb-2 font-bold">Thời gian</th>
                    <th className="pb-2 font-bold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentAbnormalities.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2.5 pr-3">
                        <p className="font-bold text-slate-800">{a.meterCode}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{a.customerName}</p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="font-semibold text-slate-700">{ABNORMALITY_LABELS[a.reportType] ?? a.reportType}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[220px]" title={a.description}>
                          {a.description}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-500 whitespace-nowrap">{formatDateTime(a.reportedAt)}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                            a.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {a.status === 'PENDING' ? 'Chờ xử lý' : 'Đã xử lý'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};
