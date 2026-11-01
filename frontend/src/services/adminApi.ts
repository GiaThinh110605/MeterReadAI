import { AdminDashboardData, AdminReportData } from '../types/admin';
import { authFetch, readError } from './http';

async function getJson<T>(path: string, fallback: string): Promise<T> {
  const res = await authFetch(path);
  if (!res.ok) throw new Error(await readError(res, fallback));
  return res.json();
}

export const adminApi = {
  getDashboard(billingPeriod?: string) {
    const query = billingPeriod ? `?billingPeriod=${encodeURIComponent(billingPeriod)}` : '';
    return getJson<AdminDashboardData>(`/admin/dashboard${query}`, 'Không tải được số liệu tổng quan');
  },

  getReport(fromPeriod?: string, toPeriod?: string) {
    const params = new URLSearchParams();
    if (fromPeriod) params.set('fromPeriod', fromPeriod);
    if (toPeriod) params.set('toPeriod', toPeriod);
    const query = params.toString() ? `?${params}` : '';
    return getJson<AdminReportData>(`/admin/reports/statistics${query}`, 'Không tải được báo cáo thống kê');
  },
};
