import React, { useEffect, useState } from 'react';
import { History, CheckCircle2, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { MeterItem } from '../types';

interface HistoryPageProps {
  onBack: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const [meters, setMeters] = useState<MeterItem[]>([]);

  useEffect(() => {
    api.getRouteMeters(1).then(setMeters);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900">Lịch sử ghi số - Đối soát thực địa</h2>
            <p className="text-xs text-slate-500">Đối soát các điểm đo đã chốt chỉ số và các biên bản bất thường.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <th className="p-4">Mã ĐH</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Địa chỉ</th>
              <th className="p-4 text-right">Chỉ số cũ</th>
              <th className="p-4 text-right">Chỉ số chốt</th>
              <th className="p-4 text-right">Tiêu thụ</th>
              <th className="p-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meters.map((m) => {
              const consumption = m.currentIndex ? m.currentIndex - m.previousIndex : 0;
              return (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-sky-800">{m.meterCode}</td>
                  <td className="p-4 font-semibold text-slate-800">{m.customerName}</td>
                  <td className="p-4 text-slate-500">{m.address}</td>
                  <td className="p-4 text-right font-medium text-slate-600">{m.previousIndex} m³</td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {m.currentIndex ? `${m.currentIndex} m³` : '—'}
                  </td>
                  <td className="p-4 text-right font-bold text-sky-700">
                    {m.currentIndex ? `+${consumption} m³` : '—'}
                  </td>
                  <td className="p-4 text-center">
                    {m.readingStatus === 'RECORDED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Đã chốt
                      </span>
                    ) : m.readingStatus === 'LOCKED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> Khóa cửa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                        <Clock className="w-3 h-3" /> Chưa ghi
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
