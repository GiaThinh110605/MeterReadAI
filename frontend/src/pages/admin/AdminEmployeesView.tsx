import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Award,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Phone,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminEmployeesSummary, AdminEmployeeItem } from '../../types';

export const AdminEmployeesView: React.FC = () => {
  const [data, setData] = useState<AdminEmployeesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '123456',
    employee_code: '',
    team_name: 'Tổ Ghi Số Quận 1',
    assigned_area: 'Quận 1, TP. Hồ Chí Minh',
  });
  const itemsPerPage = 8;

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getAdminEmployees();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.full_name.trim()) {
      setFormError('Vui lòng nhập họ và tên nhân viên');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Vui lòng nhập email');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createAdminEmployee({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password || '123456',
        employee_code: formData.employee_code.trim() || undefined,
        team_name: formData.team_name.trim() || 'Tổ Ghi Số Quận 1',
        assigned_area: formData.assigned_area.trim() || 'Quận 1, TP. Hồ Chí Minh',
      });
      setIsAddModalOpen(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '123456',
        employee_code: '',
        team_name: 'Tổ Ghi Số Quận 1',
        assigned_area: 'Quận 1, TP. Hồ Chí Minh',
      });
      await fetchEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (emp: AdminEmployeeItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${emp.full_name} (${emp.employee_code})?`)) {
      return;
    }
    try {
      await api.deleteAdminEmployee(emp.id);
      await fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Xóa nhân viên thất bại');
    }
  };

  const handleToggleStatus = async (emp: AdminEmployeeItem) => {
    try {
      await api.toggleEmployeeStatus(emp.id);
      await fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Cập nhật trạng thái thất bại');
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
          onClick={fetchEmployees}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const summary = data!;
  const filteredEmployees = summary.employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      emp.phone.includes(search);

    if (!matchesSearch) return false;
    if (filterTab === 'ACTIVE') return emp.is_active;
    if (filterTab === 'PAUSED') return !emp.is_active;
    return true;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name: string) => {
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
            ĐIỀU HÀNH NGUỒN LỰC • ĐỘI NGŨ THỰC ĐỊA
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Quản lý nhân viên
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách đội ngũ nhân viên ghi số hiện trường và điều hành trạm
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TỔNG NHÂN SỰ
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{summary.total_staff}</span>
              <span className="text-xs text-slate-500 font-medium">nhân sự</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{summary.active_staff} trực tuyến</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ĐANG GHI SỐ
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">{summary.active_staff}</span>
              <span className="text-xs text-slate-500 font-medium">nhân viên</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đang tại hiện trường</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TẠM NGỪNG
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {String(summary.paused_staff).padStart(2, '0')}
              </span>
              <span className="text-xs text-slate-500 font-medium">nhân sự</span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-slate-500">
              <span>Nghỉ phép / đào tạo</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TIẾN ĐỘ HOÀN THÀNH
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {summary.completion_rate}%
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-blue-600">
              <span>Đúng hạn chu kỳ</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên nhân viên, mã nhân viên, số điện thoại..."
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
              Tất cả ({summary.total_staff})
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
              Đang hoạt động ({summary.active_staff})
            </button>
            <button
              onClick={() => {
                setFilterTab('PAUSED');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterTab === 'PAUSED'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tạm ngừng ({summary.paused_staff})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">NHÂN VIÊN</th>
                <th className="py-3 px-4">MÃ NV</th>
                <th className="py-3 px-4">SỐ ĐIỆN THOẠI</th>
                <th className="py-3 px-4">TUYẾN PHỤ TRÁCH</th>
                <th className="py-3 px-4">TRẠNG THÁI</th>
                <th className="py-3 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                      <p className="text-sm font-semibold text-slate-600">Chưa có nhân viên nào trong danh sách</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Nhấn nút <strong>"+ Thêm nhân viên"</strong> ở trên để tạo tài khoản nhân viên mới
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">
                          {getInitials(emp.full_name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{emp.full_name}</div>
                          <div className="text-[11px] text-slate-400">{emp.team_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {emp.employee_code}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{emp.phone}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {emp.assigned_route_code ? (
                        <span className="font-semibold text-slate-800">
                          Tuyến {emp.assigned_route_code} ({emp.assigned_route_name})
                        </span>
                      ) : (
                        <span className="text-slate-400">Chưa phân công</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {emp.is_active ? (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Đang hoạt động</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>Tạm ngừng</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-3">
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className="text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        {emp.is_active ? 'Tạm khóa' : 'Mở khóa'}
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="text-rose-600 hover:text-rose-700 font-semibold"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị {(currentPage - 1) * itemsPerPage + (filteredEmployees.length > 0 ? 1 : 0)} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} trong tổng số{' '}
            {filteredEmployees.length} nhân viên
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
                <h3 className="text-base font-bold text-slate-800">Thêm nhân viên mới</h3>
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

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên nhân viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nhanvien@waterflow.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã nhân viên (Để trống tự sinh)
                  </label>
                  <input
                    type="text"
                    placeholder="Tự sinh: NV-5001..."
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu khởi tạo
                  </label>
                  <input
                    type="text"
                    placeholder="Mặc định: 123456"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đội / Tổ công tác
                  </label>
                  <input
                    type="text"
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khu vực phụ trách
                  </label>
                  <input
                    type="text"
                    value={formData.assigned_area}
                    onChange={(e) => setFormData({ ...formData, assigned_area: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
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
                  {isSubmitting ? 'Đang tạo...' : 'Tạo nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

