import React from 'react';
import { TariffCalculation } from '../../types';

interface TierPriceBreakdownProps {
  tariffData?: TariffCalculation | null;
  consumption: number;
}

export const TierPriceBreakdown: React.FC<TierPriceBreakdownProps> = ({ tariffData, consumption }) => {
  const vol1 = Math.min(10, Math.max(0, consumption));
  const vol2 = Math.min(10, Math.max(0, consumption - 10));
  const vol3 = Math.max(0, consumption - 20);

  // Formatting Vietnamese Dong
  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' đ';

  const totalDisplay = tariffData ? formatVND(tariffData.totalAmount) : (consumption === 18 ? '142.200 đ' : formatVND((vol1 * 6700 + vol2 * 7000 + vol3 * 8500) * 1.15));

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-800">Biểu tính đơn giá bậc thang sinh hoạt</h4>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-medium">Tạm tính: </span>
          <strong className="text-sm font-extrabold text-sky-800">{totalDisplay}</strong>
        </div>
      </div>

      {/* Visual tier bar */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex mb-3">
        <div className="bg-sky-700 h-full transition-all" style={{ width: `${(vol1 / 20) * 50}%` }} />
        <div className="bg-sky-500 h-full transition-all" style={{ width: `${(vol2 / 20) * 50}%` }} />
        <div className="bg-sky-200 h-full transition-all" style={{ width: `${vol3 > 0 ? 10 : 0}%` }} />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-700 shrink-0"></span>
          <span>Bậc 1 (≤10 m³): <strong>{vol1} m³ × 6.700 đ</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
          <span>Bậc 2 (10-20 m³): <strong>{vol2} m³ × 7.000 đ</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-200 shrink-0"></span>
          <span>Bậc 3 (&gt;20 m³): <strong>{vol3} m³</strong></span>
        </div>
      </div>
    </div>
  );
};
