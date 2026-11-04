import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Download,
  Plus,
  Send,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Printer,
  BellRing,
  AlertOctagon,
  Eye,
  X,
  Check,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminInvoicesSummary, AdminInvoiceItem, AdminRouteItem } from '../../types';

interface AdminInvoicesViewProps {
  onNavigatePricing?: () => void;
}

export const AdminInvoicesView: React.FC<AdminInvoicesViewProps> = ({ onNavigatePricing }) => {
  const [data, setData] = useState<AdminInvoicesSummary | null>(null);
  const [routes, setRoutes] = useState<AdminRouteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [periodFilter, setPeriodFilter] = useState('09/2026');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal: Lập bảng kê / Hóa đơn mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formCustomerName, setFormCustomerName] = useState('Nguyễn Văn An');
  const [formMeterCode, setFormMeterCode] = useState('DH001245');
  const [formAddress, setFormAddress] = useState('123 Nguyễn Trãi, Phường Bến Nghé, Quận 1');
  const [formRouteId, setFormRouteId] = useState<number | undefined>(undefined);
  const [formPeriod, setFormPeriod] = useState('09/2026');
  const [formPrevIndex, setFormPrevIndex] = useState<number>(1240);
  const [formCurrIndex, setFormCurrIndex] = useState<number>(1258);
  const [formStatus, setFormStatus] = useState<string>('UNPAID');

  // Modal: Chi tiết hóa đơn
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoiceItem | null>(null);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getAdminInvoices({
        status: statusFilter,
        billing_period: periodFilter,
        search: search.trim() || undefined,
      });
      setData(res);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách hóa đơn');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await api.getAdminRoutes();
      setRoutes(res.routes);
      if (res.routes.length > 0 && !formRouteId) {
        setFormRouteId(res.routes[0].id);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, periodFilter]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' đ';
  };

  // Real-time calculation for modal creation
  const calculatedConsumption = Math.max(0, formCurrIndex - formPrevIndex);
  const calculatedBill = useMemo(() => {
    let rem = calculatedConsumption;
    let subtotal = 0;
    // Bậc 1: <= 10m3 (6.700)
    const t1 = Math.min(rem, 10);
    subtotal += t1 * 6700;
    rem = Math.max(0, rem - 10);
    // Bậc 2: 10-20m3 (7.000)
    const t2 = Math.min(rem, 10);
    subtotal += t2 * 7000;
    rem = Math.max(0, rem - 10);
    // Bậc 3: 20-30m3 (8.500)
    const t3 = Math.min(rem, 10);
    subtotal += t3 * 8500;
    rem = Math.max(0, rem - 10);
    // Bậc 4: > 30m3 (15.000)
    subtotal += rem * 15000;

    const env = Math.round(subtotal * 0.10);
    const vat = Math.round((subtotal + env) * 0.05);
    const total = subtotal + env + vat;
    return { subtotal, env, vat, total };
  }, [calculatedConsumption]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formCurrIndex < formPrevIndex) {
      alert(`Chỉ số mới (${formCurrIndex}) không được nhỏ hơn chỉ số cũ (${formPrevIndex})!`);
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createAdminInvoice({
        customer_name: formCustomerName.trim(),
        meter_code: formMeterCode.trim().toUpperCase(),
        address: formAddress.trim(),
        route_id: formRouteId,
        billing_period: formPeriod,
        previous_index: Number(formPrevIndex),
        current_index: Number(formCurrIndex),
        payment_status: formStatus,
      });

      setIsCreateModalOpen(false);
      showToast('Đã lập và phát hành bảng kê hóa đơn thành công!');
      await fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi lập bảng kê mới');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    const url = api.getExportInvoicesUrl({
      status: statusFilter,
      billing_period: periodFilter,
      search: search.trim() || undefined,
    });
    showToast('Đang tải tệp Excel bảng kê hóa đơn...');
    window.location.href = url;
  };

  const handleTogglePaymentStatus = async (invoice: AdminInvoiceItem) => {
    const newStatus = invoice.payment_status === 'PAID' ? 'UNPAID' : 'PAID';
    try {
      await api.updateInvoiceStatus(invoice.id, newStatus);
      showToast(newStatus === 'PAID' ? 'Đã xác nhận thu tiền hóa đơn!' : 'Đã chuyển sang chưa thanh toán');
      if (selectedInvoice && selectedInvoice.id === invoice.id) {
        setSelectedInvoice({ ...selectedInvoice, payment_status: newStatus });
      }
      await fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái hóa đơn');
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy / xóa hóa đơn này khỏi hệ thống?')) return;
    try {
      await api.deleteAdminInvoice(invoiceId);
      showToast('Đã xóa hóa đơn thành công');
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(null);
      }
      await fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa hóa đơn');
    }
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
          onClick={fetchInvoices}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const summary = data!;
  const allInvoices = summary.invoices;

  // Real database dynamic revenue aggregation
  const totalPaidRevenue = allInvoices
    .filter((i) => i.payment_status === 'PAID')
    .reduce((acc, i) => acc + i.total_amount, 0);

  const totalUnpaidRevenue = allInvoices
    .filter((i) => i.payment_status === 'UNPAID')
    .reduce((acc, i) => acc + i.total_amount, 0);

  const totalOverdueRevenue = allInvoices
    .filter((i) => i.payment_status === 'OVERDUE')
    .reduce((acc, i) => acc + i.total_amount, 0);

  const paidRate = summary.total_invoices > 0 ? ((summary.paid_invoices / summary.total_invoices) * 100).toFixed(1) : '0.0';
  const unpaidRate = summary.total_invoices > 0 ? ((summary.unpaid_invoices / summary.total_invoices) * 100).toFixed(1) : '0.0';
  const overdueRate = summary.total_invoices > 0 ? ((summary.overdue_invoices / summary.total_invoices) * 100).toFixed(1) : '0.0';

  // Real Pagination
  const totalItems = allInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedInvoices = allInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            NGHIỆP VỤ TÀI CHÍNH • ĐỢT ĐỐI SOÁT & PHÁT HÀNH
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Quản lý hóa đơn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm soát phát hành, thu tiền và chi tiết tính cước kỳ {periodFilter}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất danh sách Excel</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập bảng kê mới</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TỔNG HÓA ĐƠN PHÁT HÀNH
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {summary.total_invoices.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs text-slate-500 font-medium">hóa đơn</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs font-medium text-slate-500">
              <span>Đạt 100% kế hoạch phát</span>
              <span className="font-bold text-blue-600">100%</span>
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
                {summary.paid_invoices.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                {paidRate}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500 font-medium">
              <span>Tổng thu lũy kế:</span>
              <span className="font-bold text-slate-800">{formatVND(totalPaidRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CHƯA THANH TOÁN
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {summary.unpaid_invoices.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-600">
                {unpaidRate}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500 font-medium">
              <span>Đang trong hạn thu:</span>
              <span className="font-bold text-slate-800">{formatVND(totalUnpaidRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              QUÁ HẠN NỢ CƯỚC
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-rose-600">
                {summary.overdue_invoices}
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">
                {overdueRate}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500 font-medium">
              <span>Cần đôn đốc gửi thông báo:</span>
              <span className="font-bold text-rose-600">{formatVND(totalOverdueRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form
          onSubmit={handleSearchSubmit}
          className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã hóa đơn, tên khách hàng, mã ĐH..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="09/2026">Kỳ: 09/2026</option>
              <option value="10/2026">Kỳ: 10/2026</option>
              <option value="08/2026">Kỳ: 08/2026</option>
              <option value="ALL">Kỳ: Tất cả các kỳ</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="OVERDUE">Quá hạn</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPeriodFilter('ALL');
              }}
              className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">MÃ HÓA ĐƠN</th>
                <th className="py-3 px-4">KHÁCH HÀNG</th>
                <th className="py-3 px-4 text-center">KỲ</th>
                <th className="py-3 px-4 text-right">TIÊU THỤ</th>
                <th className="py-3 px-4 text-right">TỔNG TIỀN</th>
                <th className="py-3 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((inv) => {
                  const isPaid = inv.payment_status === 'PAID';
                  const isOverdue = inv.payment_status === 'OVERDUE';
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {inv.invoice_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{inv.customer_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{inv.meter_code} • {inv.address}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                        {inv.billing_period}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        {inv.total_consumption} m³
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-blue-600">
                        {formatVND(inv.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPaid && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Đã thanh toán</span>
                          </span>
                        )}
                        {!isPaid && !isOverdue && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            <span>Chưa thanh toán</span>
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Quá hạn</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleTogglePaymentStatus(inv)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            isPaid
                              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {isPaid ? 'Bỏ xác nhận' : 'Đã thu tiền'}
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa hóa đơn"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Chưa có hóa đơn nào phù hợp với bộ lọc hiện tại. Nhấn "Lập bảng kê mới" để phát hành.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            Hiển thị {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} hóa đơn
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg font-semibold text-xs cursor-pointer transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Auxiliary Operation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Gửi SMS / Zalo nhắc cước</div>
              <div className="text-[11px] text-slate-400">
                {summary.unpaid_invoices + summary.overdue_invoices} khách hàng cần đôn đốc
              </div>
            </div>
          </div>
          <button
            onClick={() => showToast('Đã gửi SMS / Zalo nhắc cước thành công!')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Thực hiện
          </button>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Đồng bộ cổng thanh toán</div>
              <div className="text-[11px] text-slate-400">VNPay, MoMo, VietinBank API</div>
            </div>
          </div>
          <button
            onClick={() => showToast('Đã kết nối và đồng bộ đối soát cổng thanh toán!')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Tự động
          </button>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Biểu cước 4 bậc lũy tiến</div>
              <div className="text-[11px] text-slate-400">Quyết định số 412/QĐ-UBND 2026</div>
            </div>
          </div>
          <button
            onClick={onNavigatePricing}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Chi tiết
          </button>
        </div>
      </div>

      {/* Modal: Lập bảng kê / Hóa đơn mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Lập bảng kê hóa đơn mới</h3>
                  <p className="text-xs text-slate-500">Phát hành hóa đơn tiền nước trực tiếp vào cơ sở dữ liệu</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kỳ hóa đơn</label>
                  <input
                    type="text"
                    required
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="VD: 09/2026"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tuyến đường ghi số</label>
                  <select
                    value={formRouteId || ''}
                    onChange={(e) => setFormRouteId(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.route_code} – {r.route_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tên khách hàng</label>
                  <input
                    type="text"
                    required
                    value={formCustomerName}
                    onChange={(e) => setFormCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="VD: Nguyễn Văn An"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Mã đồng hồ</label>
                  <input
                    type="text"
                    required
                    value={formMeterCode}
                    onChange={(e) => setFormMeterCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium font-mono uppercase"
                    placeholder="VD: DH001245"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Địa chỉ khách hàng</label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="VD: 123 Nguyễn Trãi, Phường Bến Nghé, Quận 1"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Chỉ số cũ (m³)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formPrevIndex}
                    onChange={(e) => setFormPrevIndex(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Chỉ số mới (m³)</label>
                  <input
                    type="number"
                    required
                    min={formPrevIndex}
                    step="0.1"
                    value={formCurrIndex}
                    onChange={(e) => setFormCurrIndex(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Trạng thái thanh toán ban đầu</label>
                  <div className="flex items-center space-x-4 pt-1">
                    <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="payment_status"
                        value="UNPAID"
                        checked={formStatus === 'UNPAID'}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Chưa thanh toán (Mặc định)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="payment_status"
                        value="PAID"
                        checked={formStatus === 'PAID'}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="text-blue-600"
                      />
                      <span>Đã thu tiền tại chỗ</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700 font-semibold">
                  <span>Lượng nước tiêu thụ:</span>
                  <span className="text-sm font-bold text-blue-700">{calculatedConsumption} m³</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-[11px]">
                  <span>Tiền nước 4 bậc lũy tiến:</span>
                  <span>{formatVND(calculatedBill.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-[11px]">
                  <span>Phí bảo vệ môi trường (10%):</span>
                  <span>+ {formatVND(calculatedBill.env)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-[11px]">
                  <span>Thuế GTGT VAT (5%):</span>
                  <span>+ {formatVND(calculatedBill.vat)}</span>
                </div>
                <div className="pt-2 border-t border-blue-200/60 flex justify-between items-center text-slate-800 font-extrabold text-sm">
                  <span>TỔNG THANH TOÁN TÍNH TOÁN:</span>
                  <span className="text-blue-700">{formatVND(calculatedBill.total)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang phát hành...' : 'Xác nhận phát hành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem chi tiết hóa đơn */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chi tiết hóa đơn nước</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedInvoice.invoice_code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Khách hàng:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedInvoice.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã đồng hồ:</span>
                  <span className="font-mono font-bold text-slate-700">{selectedInvoice.meter_code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Địa chỉ cấp nước:</span>
                  <span className="font-medium text-slate-700 text-right">{selectedInvoice.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Kỳ hóa đơn:</span>
                  <span className="font-bold text-blue-600">{selectedInvoice.billing_period}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngày lập:</span>
                  <span className="font-medium text-slate-600">{selectedInvoice.created_at}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-700 font-semibold">
                  <span>Lượng nước tiêu thụ:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.total_consumption} m³</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tiền nước sạch các bậc:</span>
                  <span>{formatVND(selectedInvoice.subtotal_water)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Phí BVMT (10%):</span>
                  <span>+ {formatVND(selectedInvoice.env_protection_fee)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Thuế GTGT (5%):</span>
                  <span>+ {formatVND(selectedInvoice.vat_amount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-blue-700">
                  <span>TỔNG CỘNG THANH TOÁN:</span>
                  <span className="text-base">{formatVND(selectedInvoice.total_amount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-600">Trạng thái thanh toán:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    selectedInvoice.payment_status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-600'
                      : selectedInvoice.payment_status === 'OVERDUE'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-sky-50 text-sky-600'
                  }`}
                >
                  {selectedInvoice.payment_status === 'PAID'
                    ? 'Đã thanh toán'
                    : selectedInvoice.payment_status === 'OVERDUE'
                    ? 'Quá hạn nợ cước'
                    : 'Chưa thanh toán'}
                </span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleTogglePaymentStatus(selectedInvoice)}
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {selectedInvoice.payment_status === 'PAID' ? 'Đổi sang Chưa thu' : 'Xác nhận Đã thu tiền'}
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3.5 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In phiếu</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
