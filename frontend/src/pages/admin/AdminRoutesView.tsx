import React, { useEffect, useState } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Plus,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminRoutesSummary, AdminRouteItem } from '../../types';

interface AdminRoutesViewProps {
  onAssignClick: (routeId?: number) => void;
}

export const AdminRoutesView: React.FC<AdminRoutesViewProps> = ({ onAssignClick }) => {
  const [data, setData] = useState<AdminRoutesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'UNASSIGNED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    route_name: '',
    route_code: '',
    ward: '',
    district: 'Quận 1',
    description: '',
    priority_order: 1,
  });
  const itemsPerPage = 5;

  const fetchRoutes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getAdminRoutes();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tuyến');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.route_name.trim()) {
      setFormError('Vui lòng nhập tên tuyến đường');
      return;
    }
    if (!formData.ward.trim()) {
      setFormError('Vui lòng nhập phường/xã');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createAdminRoute({
        route_name: formData.route_name.trim(),
        route_code: formData.route_code.trim() || undefined,
        ward: formData.ward.trim(),
        district: formData.district.trim() || 'Quận 1',
        description: formData.description.trim() || undefined,
        priority_order: Number(formData.priority_order) || 1,
      });
      setIsAddModalOpen(false);
      setFormData({
        route_name: '',
        route_code: '',
        ward: '',
        district: 'Quận 1',
        description: '',
        priority_order: 1,
      });
      await fetchRoutes();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo tuyến đường');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoute = async (r: AdminRouteItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tuyến ${r.route_name} (${r.route_code})?`)) {
      return;
    }
    try {
      await api.deleteAdminRoute(r.id);
      await fetchRoutes();
    } catch (err: any) {
      alert(err.message || 'Xóa tuyến đường thất bại');
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
          onClick={fetchRoutes}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const summary = data!;
  const allRoutes = summary.routes;

  const filteredRoutes = allRoutes.filter((r) => {
    const matchesSearch =
      r.route_code.toLowerCase().includes(search.toLowerCase()) ||
      r.route_name.toLowerCase().includes(search.toLowerCase()) ||
      r.ward.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'ACTIVE') return r.assigned_employee_id !== null && r.status === 'Đang hoạt động';
    if (filterTab === 'UNASSIGNED') return r.assigned_employee_id === null || r.status === 'Chưa phân công';
    return true;
  });

  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage) || 1;
  const paginatedRoutes = filteredRoutes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name?: string | null) => {
    if (!name) return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            HẠ TẦNG CẤP NƯỚC • PHÂN BỔ VÙNG PHỤC VỤ
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Quản lý tuyến đường
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh mục mạng lưới và quản lý tuyến cấp nước địa bàn
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAssignClick()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-500" />
            <span>Phân công tuyến</span>
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm tuyến</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TỔNG SỐ TUYẾN
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{summary.total_routes}</span>
              <span className="text-xs text-slate-500 font-medium">tuyến lộ trình</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% định vị GIS</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ĐANG VẬN HÀNH
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{summary.active_routes}</span>
              <span className="text-xs text-slate-500 font-medium">tuyến ổn định</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Áp lực đạt chuẩn (2.4 bar)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CHƯA PHÂN CÔNG
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {String(summary.unassigned_routes).padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-500 font-medium">cần gán nhân sự</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Kỳ ghi số: 05 ngày tới</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TỔNG ĐIỂM ĐẤU NỐI
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{summary.total_customers}</span>
              <span className="text-xs text-slate-500 font-medium">hộ dân</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-blue-600">
              <span>⚡ +14 hộ mới tuần này</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tuyến đường, mã tuyến..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => {
                  setFilterTab('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({summary.total_routes})
              </button>
              <button
                onClick={() => {
                  setFilterTab('ACTIVE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'ACTIVE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đang hoạt động ({summary.active_routes})
              </button>
              <button
                onClick={() => {
                  setFilterTab('UNASSIGNED');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'UNASSIGNED'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chưa phân công ({summary.unassigned_routes})
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase">TIẾN ĐỘ THU THẬP CHỈ SỐ</div>
              <div className="font-extrabold text-slate-800">
                {summary.recorded_customers} / {summary.total_customers} hộ ({summary.progress_percentage}%)
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin-slow"></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">MÃ TUYẾN</th>
                <th className="py-3 px-4">TÊN TUYẾN</th>
                <th className="py-3 px-4">KHU VỰC / PHƯỜNG XÃ</th>
                <th className="py-3 px-4 text-center">SỐ KHÁCH HÀNG</th>
                <th className="py-3 px-4">NHÂN VIÊN PHỤ TRÁCH</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <MapPin className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                      <p className="text-sm font-semibold text-slate-600">Chưa có tuyến đường nào trong danh sách</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Nhấn nút <strong>"+ Thêm tuyến"</strong> ở trên để tạo tuyến cấp nước mới
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRoutes.map((r) => {
                  const isUnassigned = r.status === 'Chưa phân công';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            isUnassigned
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {r.route_code}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{r.route_name}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.ward}, {r.district}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {r.total_meters}
                      </td>
                      <td className="py-3 px-4">
                        {isUnassigned ? (
                          <div className="flex items-center space-x-2 text-slate-400">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                              ✕
                            </div>
                            <span>Chưa phân công</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                              {getInitials(r.assigned_employee_name)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800">
                                {r.assigned_employee_name}
                              </span>
                              <span className="text-slate-400 ml-1 text-[11px]">
                                ({r.assigned_employee_code})
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isUnassigned ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Chưa phân công</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>Đang hoạt động</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {isUnassigned ? (
                          <button
                            onClick={() => onAssignClick(r.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            Phân công
                          </button>
                        ) : (
                          <button
                            onClick={() => onAssignClick(r.id)}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Phân công lại
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRoute(r)}
                          className="text-rose-600 hover:text-rose-700 font-semibold"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị {(currentPage - 1) * itemsPerPage + (filteredRoutes.length > 0 ? 1 : 0)} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredRoutes.length)} trong tổng số{' '}
            {filteredRoutes.length} tuyến đường
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg font-semibold text-xs ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Thêm tuyến đường mới</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRoute} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên tuyến đường <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tuyến A01 – Phường Bến Nghé"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã tuyến (Để trống tự sinh)
                  </label>
                  <input
                    type="text"
                    placeholder="Tự sinh: A01, A02..."
                    value={formData.route_code}
                    onChange={(e) => setFormData({ ...formData, route_code: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thứ tự ưu tiên
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.priority_order}
                    onChange={(e) => setFormData({ ...formData, priority_order: Number(e.target.value) || 1 })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phường / Xã <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Phường Bến Nghé"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quận / Huyện
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả lộ trình tuyến
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trục đường Nguyễn Du - Nguyễn Trãi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tuyến đường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

