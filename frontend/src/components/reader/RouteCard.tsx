import React from 'react';
import { MapPin, ArrowRight, Clock, Building2 } from 'lucide-react';
import { RouteItem } from '../../types';

interface RouteCardProps {
  route: RouteItem;
  onOpenRoute: (routeId: number) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onOpenRoute }) => {
  const isPrimary = route.priority === 1;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all">
      <div>
        {/* Status header badge & % */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md ${
              isPrimary ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {isPrimary ? 'ƯU TIÊN SỐ 1' : 'TUYẾN KẾ TIẾP'}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className={`w-2 h-2 rounded-full ${isPrimary ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              {route.status === 'IN_PROGRESS' ? 'Đang tác nghiệp' : 'Tạm dừng'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-sky-900">{route.percentComplete}%</span>
            <span className="text-[11px] font-semibold text-slate-400 block -mt-1">
              {route.recordedMeters} / {route.totalMeters} HỘ
            </span>
          </div>
        </div>

        {/* Route Title & Location */}
        <h3 className="text-base font-bold text-slate-900 leading-snug">{route.routeName}</h3>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{route.description || `${route.ward}, ${route.district}`}</span>
        </p>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-sky-600" style={{ width: `${(route.recordedMeters / route.totalMeters) * 100}%` }} />
          <div className="bg-rose-500" style={{ width: `${(route.abnormalMeters / route.totalMeters) * 100}%` }} />
        </div>

        {/* Metrics breakdown */}
        <div className="grid grid-cols-3 gap-2 py-4 my-3 border-y border-slate-100 text-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">ĐÃ GHI</p>
            <p className="text-lg font-black text-emerald-600">{route.recordedMeters}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">CHƯA GHI</p>
            <p className="text-lg font-black text-sky-700">{route.pendingMeters}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">BẤT THƯỜNG</p>
            <p className="text-lg font-black text-rose-600">{route.abnormalMeters}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-5">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {isPrimary ? 'Đồng hồ công nghiệp: 04 điểm' : 'Hộ gia đình cư dân: 20 điểm'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {isPrimary ? 'Cập nhật lần cuối: 10 phút trước' : 'Quãng đường còn: ~1.4 km'}
          </span>
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={() => onOpenRoute(route.id)}
        className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
          isPrimary
            ? 'bg-sky-800 text-white hover:bg-sky-900 shadow-md shadow-sky-900/10'
            : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
        }`}
      >
        <span>{isPrimary ? 'Mở bàn làm việc ghi số' : 'Tiếp tục ghi số'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
