import React, { useState } from 'react';
import {
  Download,
  Waves,
  TrendingUp,
  Droplet,
  ChevronRight,
  Camera,
  CreditCard,
  Info,
} from 'lucide-react';
import { CustomerInvoiceItem } from '../../types';

interface CustomerHistoryViewProps {
  invoices: CustomerInvoiceItem[];
  meterSerial?: string;
  onOpenPhotoModal: () => void;
  onPayNow: (invoiceId: number) => void;
  onNavigateToTicket: () => void;
}

export const CustomerHistoryView: React.FC<CustomerHistoryViewProps> = ({
  invoices,
  meterSerial = 'WF-79012',
  onOpenPhotoModal,
  onPayNow,
  onNavigateToTicket,
}) => {
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'all'>('6m');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tháng 09/2026');

  const historyBars = [
    { period: '04/26', volume: 16, isCurrent: false },
    { period: '05/26', volume: 17, isCurrent: false },
    { period: '06/26', volume: 15, isCurrent: false },
    { period: '07/26', volume: 20, isCurrent: false },
    { period: '08/26', volume: 16, isCurrent: false },
    { period: '09/26', volume: 18, isCurrent: true },
  ];

  const currentInvoice = invoices[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            ĐỐI SOÁT DỮ LIỆU • {meterSerial}
          </p>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            Lịch sử tiêu thụ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi lượng nước tiêu thụ và đối soát chỉ số qua các kỳ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '6m'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 tháng gần nhất
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('12m')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === '12m'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 tháng
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất dữ liệu</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TRUNG BÌNH THÁNG
            </span>
            <Waves className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              17.2 <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↓</span>
              <span>1.5 m³ so với cùng kỳ năm trước</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              THÁNG CAO NHẤT
            </span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              20 <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              • Ghi nhận tại Kỳ 07/2026
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              THÁNG THẤP NHẤT
            </span>
            <Droplet className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              15 <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              • Ghi nhận tại Kỳ 06/2026
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Biểu đồ tiêu thụ qua các kỳ (m³)
              </h2>
              <p className="text-xs text-slate-400">
                Đối chiếu xu hướng và định mức tham chiếu
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0369a1]"></span>
                <span>Kỳ hiện tại</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 border-b-2 border-dashed border-slate-400"></span>
                <span>Mức TB (17 m³)</span>
              </span>
            </div>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-4 border-b border-slate-100 relative">
            <div className="absolute left-0 right-0 top-16 border-b border-dashed border-slate-300 pointer-events-none" />

            {historyBars.map((b, i) => {
              const hPercent = (b.volume / 25) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className={`text-xs mb-2 ${b.isCurrent ? 'font-bold text-[#0369a1]' : 'text-slate-500'}`}>
                    {b.volume}
                  </span>
                  <div
                    style={{ height: `${hPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                      b.isCurrent ? 'bg-[#0369a1]' : 'bg-sky-200 group-hover:bg-sky-300'
                    }`}
                  />
                  <span className={`text-xs mt-3 ${b.isCurrent ? 'font-bold text-[#0369a1]' : 'text-slate-500'}`}>
                    {b.period}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CHI TIẾT KỲ ĐANG CHỌN
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {selectedPeriod}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
              • Đang mở
            </span>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">
              TIÊU THỤ CHU KỲ
            </p>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              18 <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">
              ↗ +2 m³ (+12.5%) SO KỲ 08/2026
            </p>
          </div>

          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1.5">
              PHÂN BỔ ĐỊNH MỨC SINH HOẠT
            </p>
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100 mb-2">
              <div className="bg-sky-500 h-full w-[55%]"></div>
              <div className="bg-indigo-600 h-full w-[45%]"></div>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>• Bậc 1 (0 – 10 m³): 10 m³</span>
              <span>• Bậc 2 (10 – 20 m³): 8 m³</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                <img
                  src={currentInvoice?.photoUrl || "/uploads/raw/1_bee59a99_raw.jpg"}
                  alt="Đồng hồ"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Ảnh chụp đồng hồ</p>
                <p className="text-[10px] text-slate-400">Ghi nhận: 28/09/2026</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPhotoModal}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-sky-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Xem ảnh</span>
            </button>
          </div>

          {currentInvoice && (
            <button
              type="button"
              onClick={() => onPayNow(currentInvoice.id)}
              disabled={currentInvoice.status === 'PAID'}
              className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>
                {currentInvoice.status === 'PAID'
                  ? 'Đã thanh toán kỳ này'
                  : `Thanh toán kỳ này (${currentInvoice.amount.toLocaleString('vi-VN')} đ)`}
              </span>
            </button>
          )}

          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>Chỉ số có sai lệch? Bạn có thể gửi yêu cầu </span>
              <button
                type="button"
                onClick={onNavigateToTicket}
                className="font-bold underline text-sky-700 hover:text-sky-900"
              >
                Phúc tra đồng hồ
              </button>
              <span> trong 48h.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Chi tiết các kỳ tiêu thụ
          </h2>
          <span className="text-xs text-slate-400">Hiển thị 5 kỳ gần nhất</span>
        </div>

        <div className="space-y-2">
          {invoices.map((inv, idx) => (
            <div
              key={inv.id}
              onClick={() => setSelectedPeriod(inv.period)}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60 transition-all flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                  <span className="text-[9px] uppercase text-slate-400 leading-none">KỲ</span>
                  <span className="text-xs leading-none mt-0.5">0{9 - idx}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{inv.period}</span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                        Hiện tại
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Chỉ số: {inv.previousIndex.toLocaleString('vi-VN')} → {inv.currentIndex.toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{inv.volume} m³</p>
                  <p className="text-[11px] text-slate-500">{inv.amount.toLocaleString('vi-VN')} đ</p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inv.status === 'UNPAID'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {inv.status === 'UNPAID' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                </span>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

