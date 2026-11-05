import React, { useEffect, useState } from 'react';
import {
  Users,
  MapPin,
  FileText,
  AlertTriangle,
  Calendar,
  SlidersHorizontal,
  Download,
  RotateCw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminOverviewStats } from '../../types';

interface AdminOverviewViewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<AdminOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleResolve = async (complaintId: number) => {
    try {
      setResolvingId(complaintId);
      await api.resolveAdminComplaint(complaintId);
      await fetchOverview();
    } catch (err: any) {
      alert(err.message || 'Xử lý thất bại');
    } finally {
      setResolvingId(null);
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-semibold mb-3">{error}</p>
        <button
          onClick={fetchOverview}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const stats = data!;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            HẠ TẦNG ĐIỀU HÀNH • Đô thị thông minh
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Tổng quan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tình hình hoạt động hệ thống và phân bổ nguồn lực cấp nước
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Kỳ: Tháng {stats.billing_period}</span>
          </div>
          <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              NHÂN VIÊN
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{stats.total_employees}</span>
              <span className="text-xs text-slate-500 font-medium">nhân sự</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{stats.online_employees} đang trực tuyến</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TUYẾN ĐƯỜNG
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{stats.total_routes}</span>
              <span className="text-xs text-slate-500 font-medium">tuyến cấp</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{stats.assigned_routes} đã phân công ghi số</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              HÓA ĐƠN THÁNG NÀY
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {stats.total_invoices_month.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">hóa đơn</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Phát hành: {stats.issue_percentage}% chỉ số</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              KHIẾU NẠI CHỜ XỬ LÝ
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{stats.pending_complaints}</span>
              <span className="text-xs text-slate-500 font-medium">yêu cầu</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{stats.high_priority_complaints} trường hợp ưu tiên cao</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Hóa đơn tháng này</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tiến độ thu nộp phí nước sinh hoạt và sản xuất - Kỳ {stats.billing_period}
                </p>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                TỔNG: {new Intl.NumberFormat('vi-VN').format(stats.total_revenue_expected)} Đ
              </div>
            </div>

            <div className="mt-6">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${stats.paid_percentage}%` }}
                  className="bg-emerald-500 h-full"
                ></div>
                <div
                  style={{ width: `${stats.unpaid_percentage}%` }}
                  className="bg-sky-400 h-full"
                ></div>
                <div
                  style={{ width: `${stats.overdue_percentage}%` }}
                  className="bg-rose-500 h-full"
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mt-2.5">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Đã thu: {stats.paid_percentage}%</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  <span>Chưa thu: {stats.unpaid_percentage}%</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Quá hạn: {stats.overdue_percentage}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ĐÃ THANH TOÁN</span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {stats.paid_percentage}%
                  </span>
                </div>
                <div className="text-base font-extrabold text-slate-800 mt-1">
                  {formatVND(stats.paid_amount)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stats.paid_count} hóa đơn</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CHƯA THANH TOÁN</span>
                  <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                    {stats.unpaid_percentage}%
                  </span>
                </div>
                <div className="text-base font-extrabold text-slate-800 mt-1">
                  {formatVND(stats.unpaid_amount)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stats.unpaid_count} hóa đơn</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">QUÁ HẠN</span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    {stats.overdue_percentage}%
                  </span>
                </div>
                <div className="text-base font-extrabold text-rose-600 mt-1">
                  {formatVND(stats.overdue_amount)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stats.overdue_count} hóa đơn</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <RotateCw className="w-4 h-4 text-slate-400 animate-spin-slow" />
              <div>
                <span className="font-semibold text-slate-700">Đồng bộ tự động cổng VNPay & MoMo</span>
                <span className="text-slate-400 ml-2">Cập nhật gần nhất lúc: {stats.last_sync_time}</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Tra soát kỳ
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Khiếu nại cần xử lý</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ưu tiên phản ánh khẩn từ hộ dân & cơ quan
                </p>
              </div>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold">
                {stats.high_priority_complaints} khẩn cấp
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {stats.urgent_complaints.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Hiện không có khiếu nại khẩn cấp nào cần xử lý
                </div>
              ) : (
                stats.urgent_complaints.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">{item.customer_name}</span>
                        <span className="text-[11px] text-slate-400">
                          Đồng hồ #{item.meter_code} • {item.route_name}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-rose-600 flex items-center space-x-1">
                        <span>! {item.issue_type}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1.5 shrink-0 ml-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Chờ xử lý
                      </span>
                      <button
                        onClick={() => handleResolve(item.id)}
                        disabled={resolvingId === item.id}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        {resolvingId === item.id ? 'Đang xử lý...' : 'Xử lý ngay'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('complaints')}
            className="w-full mt-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Xem tất cả khiếu nại ({stats.pending_complaints})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

