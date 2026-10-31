import React from 'react';
import { Lock, TrendingUp, Phone, Edit3, Camera, History } from 'lucide-react';
import { PriorityAlert } from '../../types';

interface PriorityCustomerCardProps {
  alerts: PriorityAlert[];
  onActionClick: (alert: PriorityAlert) => void;
}

export const PriorityCustomerCard: React.FC<PriorityCustomerCardProps> = ({ alerts, onActionClick }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-tight">
            Khách hàng cần ưu tiên xử lý trong tuyến
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Các trường hợp khóa cổng, nghi ngờ rò rỉ hoặc sai lệch lưu lượng cần kiểm tra lại ngay trong ngày.
          </p>
        </div>
        <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-100">
          {alerts.length} Điểm chú ý
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((item) => {
          const isLock = item.issueType.includes('Khóa');
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isLock ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {isLock ? <Lock className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{item.customerName}</h4>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                      Mã ĐH: {item.meterCode}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      isLock ? 'bg-rose-100/80 text-rose-700' : 'bg-amber-100/80 text-amber-700'
                    }`}>
                      {item.issueType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    {item.address} {item.issueDescription && `• ${item.issueDescription}`}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {isLock ? (
                  <>
                    <a
                      href={`tel:${item.phone || '0918234567'}`}
                      className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Gọi khách</span>
                    </a>
                    <button
                      onClick={() => onActionClick(item)}
                      className="px-3 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-sky-800/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Ghi lại ngay</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onActionClick(item)}
                      className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chụp xác minh</span>
                    </button>
                    <button
                      onClick={() => window.alert('Đang xem lịch sử đo 12 kỳ của khách hàng')}
                      className="px-3 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-sky-800/10"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Xem lịch sử đo</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
