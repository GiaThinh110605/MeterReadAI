import React, { useEffect, useState } from 'react';
import { Cloud, FileCheck, SlidersHorizontal, PhoneCall, Navigation } from 'lucide-react';
import { api } from '../services/api';
import { AssignedRoutesData, PriorityAlert } from '../types';
import { ShiftSummaryCard } from '../components/reader/ShiftSummaryCard';
import { RouteCard } from '../components/reader/RouteCard';
import { PriorityCustomerCard } from '../components/reader/PriorityCustomerCard';

interface RouteManagementPageProps {
  onOpenMeterReading: (routeId: number) => void;
}

export const RouteManagementPage: React.FC<RouteManagementPageProps> = ({ onOpenMeterReading }) => {
  const [data, setData] = useState<AssignedRoutesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAssignedRoutes().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handlePriorityAction = (alert: PriorityAlert) => {
    onOpenMeterReading(alert.routeCode === 'A02' ? 2 : 1);
  };

  if (loading || !data) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Sub-header and sync state badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-sky-700 tracking-wider uppercase mb-1">
            <span>HIỆN TRƯỜNG TÁC NGHIỆP</span>
            <span>•</span>
            <span>ĐỢT ĐỌC SỐ KỲ 04/2025</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý tuyến đọc chỉ số
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
            Theo dõi tiến độ di chuyển, xử lý các điểm đo đồng hồ nước trọng yếu và đồng bộ biên lai thực địa tức thời.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Đám mây đồng bộ: <strong>Trực tuyến</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Sẵn sàng gửi biên lai</span>
          </div>
        </div>
      </div>

      {/* Shift Overview Card */}
      <ShiftSummaryCard
        progressPercent={data.shiftProgressPercent}
        totalMeters={data.totalMetersInShift}
        recordedMeters={data.recordedMetersInShift}
        pendingMeters={data.pendingMetersInShift}
        abnormalMeters={data.abnormalMetersInShift}
        startTime={data.startTime}
        estimatedEndTime={data.estimatedEndTime}
      />

      {/* Assigned Routes section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-extrabold text-slate-900">Danh sách tuyến được phân công</h3>
            <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-xs font-bold rounded-full">
              {data.routes.length} Tuyến trọng điểm
            </span>
          </div>

          <button
            onClick={() => alert('Đang sắp xếp tối ưu lộ trình di chuyển bản đồ')}
            className="flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-900"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tùy chỉnh thứ tự lộ trình</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onOpenRoute={onOpenMeterReading}
            />
          ))}
        </div>
      </div>

      {/* Priority customers card */}
      <PriorityCustomerCard
        alerts={data.priorityAlerts}
        onActionClick={handlePriorityAction}
      />

      {/* Field Support & GPS accuracy footer */}
      <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-sky-700 shrink-0" />
          <span>
            Cần hỗ trợ kỹ thuật hiện trường hoặc mở khóa niêm phong: Gọi hotline điều hành <strong>1900 1288 (Phím 2)</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            GPS Định vị nhân viên: <strong>Hoạt động chính xác (Bán kính 4m)</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
