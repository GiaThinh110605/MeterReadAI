import React, { useEffect, useState } from 'react';
import {
  Droplet,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  Activity,
  FileCheck,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminReportsData } from '../../types';

export const AdminReportsView: React.FC = () => {
  const [data, setData] = useState<AdminReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('Tháng 09/2026');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleExportReport = () => {
    const url = api.getExportReportsUrl(period);
    showToast(`Đang tải báo cáo tổng hợp ${period}...`);
    window.location.href = url;
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getAdminReports(period);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Không thể tải báo cáo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

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
          onClick={fetchReports}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const reports = data!;

  const maxVal = Math.max(...reports.monthly_trend.map((m) => m.volume_thousands));

  const totalMetersSum = reports.routes.reduce((acc, r) => acc + r.total_meters, 0);
  const totalConsSum = reports.routes.reduce((acc, r) => acc + r.consumption, 0);
  const totalIssuedSum = reports.routes.reduce((acc, r) => acc + r.revenue_issued, 0);
  const totalCollectedSum = reports.routes.reduce((acc, r) => acc + r.revenue_collected, 0);
  const totalDebtSum = reports.routes.reduce((acc, r) => acc + r.debt, 0);
  const avgCollectionRate = totalIssuedSum > 0 ? ((totalCollectedSum / totalIssuedSum) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>DỮ LIỆU THỰC NGHIỆM KỲ QUYẾT TOÁN</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Thống kê & Báo cáo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo doanh thu, sản lượng tiêu thụ và hiệu suất vận hành toàn mạng lưới
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Tháng 09/2026">Kỳ: Tháng 09/2026</option>
              <option value="Tháng 08/2026">Kỳ: Tháng 08/2026</option>
              <option value="Tháng 07/2026">Kỳ: Tháng 07/2026</option>
            </select>
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TỔNG TIÊU THỤ
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {reports.total_consumption.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">m³</span>
            </div>
            <div className="flex items-center space-x-1 mt-2 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{reports.growth_rate}% so với kỳ trước</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              DOANH THU PHÁT SINH
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {reports.revenue_issued_m}
              </span>
              <span className="text-xs text-slate-500 font-medium">M VNĐ</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium">
              Chỉ tiêu kế hoạch <span className="font-bold text-blue-600">92.0%</span> đạt chuẩn
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ĐÃ THANH TOÁN
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {reports.revenue_collected_m}
              </span>
              <span className="text-xs text-slate-500 font-medium">M VNĐ</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div style={{ width: `${reports.collection_rate}%` }} className="bg-emerald-500 h-full"></div>
              </div>
              <span className="text-xs font-bold text-emerald-600">{reports.collection_rate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CHƯA THANH TOÁN
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {reports.debt_m}
              </span>
              <span className="text-xs text-slate-500 font-medium">M VNĐ</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] font-medium text-slate-500">
              <span>Trong hạn: <strong className="text-slate-800">{reports.debt_due_m}M</strong></span>
              <span>Quá hạn: <strong className="text-rose-600">{reports.debt_overdue_m}M</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Sản lượng nước 6 tháng gần nhất
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chu kỳ theo dõi từ T04/2026 đến T09/2026 (Đơn vị tính: nghìn m³)
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-medium text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-sky-200"></span>
                  <span>Các kỳ trước</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                  <span>Kỳ hiện tại (T09)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-end justify-between h-52 px-2 pb-2">
              {reports.monthly_trend.map((item, idx) => {
                const heightPercent = Math.round((item.volume_thousands / (maxVal * 1.15)) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group">
                    <span
                      className={`text-[11px] font-bold mb-2 transition-transform group-hover:-translate-y-1 ${
                        item.is_current ? 'text-blue-600 font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      {item.volume_thousands}k
                    </span>
                    <div className="w-10 sm:w-12 bg-slate-50 rounded-t-xl overflow-hidden flex items-end h-40">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          item.is_current
                            ? 'bg-blue-600 shadow-sm shadow-blue-500/30'
                            : 'bg-sky-200 group-hover:bg-sky-300'
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-3 ${
                        item.is_current ? 'text-blue-600 font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>Tăng trưởng trung bình 3 tháng cuối năm đạt <strong>+3.8%</strong></span>
            </div>
            <div>Cập nhật: 30/09/2026 23:59</div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Thu nợ & Trạng thái hóa đơn
                </h3>
                <p className="text-[11px] text-slate-400">Kỳ {period}</p>
              </div>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: '85.5%' }} className="bg-emerald-500 h-full"></div>
              <div style={{ width: '10.5%' }} className="bg-sky-400 h-full"></div>
              <div style={{ width: '4.0%' }} className="bg-rose-500 h-full"></div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Đã thanh toán</span>
                </div>
                <div className="font-bold">108.2M <span className="text-slate-400 font-normal">(85.5%)</span></div>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  <span>Chưa thu (Trong hạn)</span>
                </div>
                <div className="font-bold">12.1M <span className="text-slate-400 font-normal">(10.5%)</span></div>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Nợ quá hạn (&gt;15 ngày)</span>
                </div>
                <div className="font-bold text-rose-600">6.2M <span className="text-slate-400 font-normal">(4.0%)</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Xử lý khiếu nại dịch vụ
                </h3>
                <p className="text-[11px] text-slate-400">Chỉ số SLA vận hành</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                {reports.sla_ontime_rate}% đúng hạn
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-[10px] font-bold text-slate-400 uppercase">TỔNG TIẾP NHẬN</div>
                <div className="text-base font-extrabold text-slate-800 mt-0.5">
                  {reports.sla_total} <span className="text-[10px] text-slate-400 font-normal">vụ</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50/60 rounded-xl">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">ĐÃ XONG</div>
                <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                  {reports.sla_completed}
                </div>
              </div>

              <div className="p-2.5 bg-sky-50/60 rounded-xl">
                <div className="text-[10px] font-bold text-sky-700 uppercase">CHỜ XỬ LÝ</div>
                <div className="text-base font-extrabold text-sky-700 mt-0.5">
                  {reports.sla_pending}
                </div>
              </div>

              <div className="p-2.5 bg-rose-50/60 rounded-xl">
                <div className="text-[10px] font-bold text-rose-700 uppercase">TỪ CHỐI</div>
                <div className="text-base font-extrabold text-rose-700 mt-0.5">
                  {reports.sla_rejected}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Tốc độ phản hồi bình quân:</span>
              <span className="font-bold text-slate-800">{reports.avg_response_hours} giờ trên mạng lưới</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-800">
                Báo cáo chi tiết theo tuyến cấp nước
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 uppercase">
                4 Phân tuyến chính
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bổ chỉ số đồng hồ, sản lượng tiêu thụ và đối soát công nợ theo phân vùng
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">TUYẾN ĐƯỜNG</th>
                <th className="py-3.5 px-4 text-center">SỐ HỘ</th>
                <th className="py-3.5 px-4 text-right">TỔNG TIÊU THỤ</th>
                <th className="py-3.5 px-4 text-right">DOANH THU PHÁT HÀNH</th>
                <th className="py-3.5 px-4 text-right">ĐÃ THU</th>
                <th className="py-3.5 px-4 text-right">CÒN NỢ</th>
                <th className="py-3.5 px-4 text-center">TỶ LỆ THU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reports.routes.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block mr-2"></span>
                    {r.route_name}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {r.total_meters}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                    {r.consumption.toLocaleString('vi-VN')} m³
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                    {formatVND(r.revenue_issued)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                    {formatVND(r.revenue_collected)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                    {formatVND(r.debt)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700">
                      {r.collection_rate}%
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold text-xs border-t-2 border-slate-200">
                <td className="py-3.5 px-4 text-slate-800 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">∑</span>
                  <span className="font-extrabold">Tổng cộng</span>
                </td>
                <td className="py-3.5 px-4 text-center font-extrabold text-slate-800">
                  {totalMetersSum.toLocaleString('vi-VN')} hộ
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                  {totalConsSum.toLocaleString('vi-VN')} m³
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">
                  {formatVND(totalIssuedSum)}
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                  {formatVND(totalCollectedSum)}
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
                  {formatVND(totalDebtSum)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                    {avgCollectionRate}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Dữ liệu đã chốt công tơ điện tử tự động kỳ {period}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => showToast('Đang trích xuất chỉ số phụ mạng lưới...')}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold cursor-pointer"
            >
              Xem chi tiết chỉ số phụ
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold cursor-pointer"
            >
              In biên bản quyết toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

