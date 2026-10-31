import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ShiftSummaryCardProps {
  progressPercent: number;
  totalMeters: number;
  recordedMeters: number;
  pendingMeters: number;
  abnormalMeters: number;
  startTime: string;
  estimatedEndTime: string;
}

export const ShiftSummaryCard: React.FC<ShiftSummaryCardProps> = ({
  progressPercent,
  totalMeters,
  recordedMeters,
  pendingMeters,
  abnormalMeters,
  startTime,
  estimatedEndTime
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            TỔNG QUAN CA LÀM VIỆC
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-extrabold text-sky-900 tracking-tight">
              {progressPercent}%
            </span>
            <span className="text-sm font-semibold text-slate-600">
              Tiến độ ca hôm nay: <strong className="text-slate-800">{recordedMeters} / {totalMeters} hộ</strong> đã ghi
            </span>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 px-4 py-3 bg-sky-50/60 rounded-xl border border-sky-100">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-sky-950 leading-tight">{recordedMeters}</p>
              <p className="text-[10px] font-bold text-sky-700 tracking-wider uppercase">ĐÃ GHI</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-800 leading-tight">{pendingMeters}</p>
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">CHƯA GHI</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 rounded-xl border border-rose-100">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-rose-700 leading-tight">{abnormalMeters.toString().padStart(2, '0')}</p>
              <p className="text-[10px] font-bold text-rose-600 tracking-wider uppercase">BẤT THƯỜNG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mt-5">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-sky-600 transition-all duration-500"
            style={{ width: `${(recordedMeters / totalMeters) * 100}%` }}
          />
          <div
            className="bg-rose-500 transition-all duration-500"
            style={{ width: `${(abnormalMeters / totalMeters) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-2">
          <span>Khởi động lúc: <strong>{startTime}</strong></span>
          <span>Ước tính hoàn tất: <strong>{estimatedEndTime}</strong></span>
        </div>
      </div>
    </div>
  );
};
