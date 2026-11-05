import React, { useState, useEffect } from 'react';
import {
  Calendar,
  History,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Check,
  MapPin,
  Phone,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminRouteItem, AdminEmployeeItem } from '../../types';

interface AdminAssignRouteViewProps {
  initialRouteId?: number;
  onBack: () => void;
}

export const AdminAssignRouteView: React.FC<AdminAssignRouteViewProps> = ({
  initialRouteId,
  onBack,
}) => {
  const [routes, setRoutes] = useState<AdminRouteItem[]>([]);
  const [employees, setEmployees] = useState<AdminEmployeeItem[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(initialRouteId || null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [notes, setNotes] = useState(
    'Tăng cường rà soát khu vực hẻm 120-128 do có công trình sửa mặt đường. Đảm bảo thu thập chỉ số trước 17h00 ngày 17/10/2026.'
  );
  const [billingPeriod, setBillingPeriod] = useState('10/2026');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, employeesRes] = await Promise.all([
          api.getAdminRoutes(),
          api.getAdminEmployees(),
        ]);
        setRoutes(routesRes.routes);
        setEmployees(employeesRes.employees);

        if (!selectedRouteId && routesRes.routes.length > 0) {
          setSelectedRouteId(routesRes.routes[0].id);
        }
        if (employeesRes.employees.length > 0) {
          setSelectedEmployeeId(employeesRes.employees[0].id);
        }
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchData();
  }, [initialRouteId]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const handleAssign = async () => {
    if (!selectedRouteId || !selectedEmployeeId) {
      alert('Vui lòng chọn đầy đủ tuyến đường và nhân viên ghi số');
      return;
    }
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      const res = await api.assignAdminRoute({
        route_id: selectedRouteId,
        employee_id: selectedEmployeeId,
        billing_period: billingPeriod,
        notes: notes,
      });
      setSuccessMessage(res.message);
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Phân công thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            QUẢN LÝ MẠNG LƯỚI / ĐIỀU PHỐI ĐỊA BÀN
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Phân công tuyến đường
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chỉ định nhân viên ghi số phụ trách các tuyến cấp nước thực địa
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Kỳ ghi chỉ số: {billingPeriod}</span>
          </div>
          <button
            onClick={() => alert('Nhật ký luân chuyển')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Nhật ký luân chuyển</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-extrabold">
                  1
                </span>
                <span>Chọn tuyến đường cần phân công</span>
              </label>
              <span className="text-[10px] text-rose-500 font-bold uppercase">* BẮT BUỘC</span>
            </div>

            <select
              value={selectedRouteId || ''}
              onChange={(e) => setSelectedRouteId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  Tuyến {r.route_code} - {r.route_name} ({r.total_meters} khách hàng) - {r.ward}
                </option>
              ))}
            </select>

            {selectedRoute && (
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Tuyến {selectedRoute.route_code} • {selectedRoute.route_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Khu vực dân cư cao tầng & shophouse liền kề
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Đang cấp nước ổn định</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-100/60 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">QUY MÔ</div>
                    <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                      {selectedRoute.total_meters} hộ
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">CHU KỲ ĐỌC SỐ</div>
                    <div className="text-xs font-extrabold text-slate-800 mt-0.5">15 – 18 hàng tháng</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">KỲ TRƯỚC ĐẠT</div>
                    <div className="text-xs font-extrabold text-emerald-600 mt-0.5">94.2% đúng hạn</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-extrabold">
                  2
                </span>
                <span>Chọn nhân viên ghi số</span>
              </label>
              <span className="text-[10px] text-rose-500 font-bold uppercase">* BẮT BUỘC</span>
            </div>

            <select
              value={selectedEmployeeId || ''}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_code}) — Hiện quản lý: {emp.assigned_meters} KH
                </option>
              ))}
            </select>

            {selectedEmployee && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {selectedEmployee.full_name.slice(-2)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {selectedEmployee.full_name}{' '}
                        <span className="text-slate-400 text-[11px]">
                          {selectedEmployee.employee_code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{selectedEmployee.team_name}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Trực tuyến (App SmartFlow)</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">LIÊN LẠC DI ĐỘNG</div>
                    <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                      {selectedEmployee.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">TẢI VIỆC HIỆN TẠI</div>
                    <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                      1 tuyến • {selectedEmployee.assigned_meters || 110} KH
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">SAU KHI NHẬN</div>
                    <div className="text-xs font-extrabold text-blue-600 mt-0.5">
                      2 tuyến • {(selectedEmployee.assigned_meters || 110) + (selectedRoute?.total_meters || 85)} KH (65%)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-extrabold">
                  3
                </span>
                <span>Ghi chú phân công</span>
              </label>
              <span className="text-[10px] text-slate-400 font-bold uppercase">TÙY CHỌN</span>
            </div>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hủy / Quay lại danh sách</span>
            </button>

            <button
              onClick={handleAssign}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang phân công...' : 'Xác nhận phân công'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <span>Xem trước phân công</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">KỲ {billingPeriod}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex-1">
                  <div className="w-7 h-7 mx-auto rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">
                    Tuyến {selectedRoute?.route_code || 'A01'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedRoute?.total_meters || 85} Khách hàng
                  </div>
                  <div className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">
                    {selectedRoute?.ward || 'P. BẾN NGHÉ'}
                  </div>
                </div>

                <div className="px-3 shrink-0 flex flex-col items-center">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">
                    GIAO VIỆC KỲ {billingPeriod}
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600 my-1" />
                  <div className="text-[10px] font-semibold text-slate-500">15–18/10</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex-1">
                  <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {selectedEmployee?.full_name || 'Nguyễn Văn An'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {selectedEmployee?.employee_code || 'NV-4881'}
                  </div>
                  <div className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">
                    KHẢ DỤNG
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start space-x-2 text-[11px] text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Sẵn sàng phân công:</strong> Tuyến {selectedRoute?.route_code} →{' '}
                  {selectedEmployee?.full_name}. Thông báo và lệnh đọc số sẽ tự động đồng bộ tức thì tới
                  máy quét SmartFlow của nhân viên.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Tình trạng phân bổ địa bàn</h3>
                <p className="text-[11px] text-slate-400">Khu vực Quận 1 • Phường Bến Nghé</p>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-full">
                1 Tuyến chưa có người
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">A01: Nguyễn Trãi (85 KH)</span>
                  <div className="text-[11px] text-slate-400">
                    Đang thiết lập: {selectedEmployee?.full_name}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                  ĐANG THIẾT LẬP
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">A02: Lê Thánh Tôn (112 KH)</span>
                  <div className="text-[11px] text-slate-400">Phụ trách: Trần Minh Quân (NV-3209)</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                  ĐÃ PHÂN CÔNG
                </span>
              </div>

              <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">
                    A03: Pasteur & Lý Tự Trọng (140 KH)
                  </span>
                  <div className="text-[11px] text-rose-600 font-medium">
                    Khuyết người phụ trách — Cần điều phối ngay
                  </div>
                </div>
                <button
                  onClick={() => {
                    const r3 = routes.find((r) => r.route_code === 'A03');
                    if (r3) setSelectedRouteId(r3.id);
                  }}
                  className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded shadow-xs"
                >
                  Gán ngay
                </button>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">A04: Hai Bà Trưng (96 KH)</span>
                  <div className="text-[11px] text-slate-400">Phụ trách: Võ Thị Ánh Tuyết (NV-1904)</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">
                  ĐÃ PHÂN CÔNG
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Tổng tải quản: 433 khách hàng / 4 tuyến</span>
              <span className="font-bold text-blue-600">3/4 Hoàn tất</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

