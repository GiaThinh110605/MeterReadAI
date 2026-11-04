import React from 'react';
import {
  CreditCard,
  TrendingUp,
  Gauge,
  Clock,
  Droplet,
  Camera,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import { CustomerOverviewData } from '../../types';

interface CustomerOverviewViewProps {
  data: CustomerOverviewData;
  onNavigateToInvoices: () => void;
  onOpenPhotoModal: () => void;
  onPayNow: () => void;
}

export const CustomerOverviewView: React.FC<CustomerOverviewViewProps> = ({
  data,
  onNavigateToInvoices,
  onOpenPhotoModal,
  onPayNow,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Xin chào, {data.customerName}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mã KH: {data.customerCode} • Đồng hồ: {data.meterCode}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50/50 rounded-2xl p-6 border border-sky-100/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TIỀN NƯỚC {data.currentBill.period.toUpperCase()}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                data.currentBill.status === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {data.currentBill.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold text-[#0369a1] tracking-tight">
            {data.currentBill.amount.toLocaleString('vi-VN')} đ
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
            <div className="flex items-center gap-1 font-medium">
              <Droplet className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
              <span>{data.currentBill.consumption} m³</span>
            </div>
            <span>•</span>
            <span>Hạn thanh toán: {data.currentBill.dueDate}</span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={onPayNow}
            disabled={data.currentBill.status === 'PAID'}
            className="flex items-center gap-2 px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {data.currentBill.status === 'PAID' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã thanh toán xong</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Thanh toán ngay</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              TIÊU THỤ
            </span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {data.stats.consumption} <span className="text-sm font-normal text-slate-500">m³</span>
            </div>
            <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↗</span>
              <span>{data.stats.diffText}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              CHỈ SỐ MỚI
            </span>
            <Gauge className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {data.stats.currentIndex.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data.stats.currentDate}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              KỲ TRƯỚC
            </span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {data.stats.previousIndex.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {data.stats.previousDate}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Tiêu thụ
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Đơn vị tính: m³
          </span>
        </div>

        <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-6 px-2 sm:px-8 border-b border-slate-100">
          {data.chartData.map((item, index) => {
            const hasData = item.consumption !== null;
            const heightPercent = hasData ? Math.min(100, (item.consumption! / 25) * 100) : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
                {hasData ? (
                  <>
                    <span className="text-xs font-bold text-slate-700 mb-2 group-hover:text-sky-600 transition-colors">
                      {item.consumption}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                        item.isCurrent
                          ? 'bg-[#0369a1]'
                          : 'bg-sky-200 group-hover:bg-sky-300'
                      }`}
                    />
                  </>
                ) : (
                  <div className="w-full max-w-[48px] h-6 rounded-t-lg bg-slate-50 border border-dashed border-slate-200 mb-0 flex items-center justify-center text-[10px] text-slate-400">
                    --
                  </div>
                )}
                <span className={`text-xs font-semibold mt-3 ${item.isCurrent ? 'text-[#0369a1] font-bold' : 'text-slate-500'}`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hoá đơn gần nhất</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kỳ đối soát định kỳ tháng 9
            </p>
          </div>

          {data.latestInvoice ? (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {data.latestInvoice.period} • {data.latestInvoice.amount.toLocaleString('vi-VN')} đ
                </p>
                <span
                  className={`text-[10px] font-semibold mt-0.5 inline-block ${
                    data.latestInvoice.status === 'PAID'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {data.latestInvoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
              <button
                type="button"
                onClick={onNavigateToInvoices}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Xem</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              Chưa có hoá đơn nào được phát hành
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ảnh chỉ số</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bằng chứng chốt chỉ số định kỳ
            </p>
          </div>

          {data.latestPhoto ? (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={data.latestPhoto.imageUrl}
                    alt="Đồng hồ"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Chỉ số: {data.latestPhoto.readingIndex.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {data.latestPhoto.capturedDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenPhotoModal}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Xem ảnh</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              Chưa có ảnh chụp chỉ số kỳ này
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

