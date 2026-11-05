import React from 'react';
import {
  CheckCircle2,
  Camera,
  MapPin,
  Clock,
  UserCheck,
  ArrowRight,
  RotateCcw,
  Receipt,
  Droplet
} from 'lucide-react';
import { MeterItem, TariffCalculation } from '../../types';
import { TierPriceBreakdown } from './TierPriceBreakdown';

interface RecordedMeterViewProps {
  meter: MeterItem;
  imageSrc: string;
  confirmedIndex: number;
  aiSequence: string;
  tariffData: TariffCalculation | null;
  onEditAgain: () => void;
  onNextPending?: () => void;
  nextCustomerName?: string;
}

export const RecordedMeterView: React.FC<RecordedMeterViewProps> = ({
  meter,
  imageSrc,
  confirmedIndex,
  aiSequence,
  tariffData,
  onEditAgain,
  onNextPending,
  nextCustomerName
}) => {
  const consumption = Math.max(0, confirmedIndex - meter.previousIndex);
  const formatVND = (val: number) =>
    new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' đ';

  const displaySequence = aiSequence || confirmedIndex.toString().padStart(5, '0');
  const recordedPhotoUrl = imageSrc || meter.imageUrl || '/uploads/raw/1_bee59a99_raw.jpg';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* CỘT GIỮA (7 COLS): ẢNH MINH CHỨNG & BẬC THANG GIÁ */}
      <div className="lg:col-span-7 space-y-4">
        {/* Customer Header Info */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-base flex items-center justify-center shrink-0">
            {meter.customerName.slice(0, 2).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">{meter.customerName}</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                  {meter.meterType}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-extrabold rounded-full flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ĐÃ GHI THÀNH CÔNG
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{meter.address}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-medium">
              <span>MĐH: <strong className="text-slate-700">{meter.meterCode}</strong></span>
              <span>Cỡ: <strong className="text-slate-700">{meter.meterSize}</strong></span>
              <span>Định mức: <strong className="text-slate-700">{meter.standardTierLimit} m³ (Bậc 1-2)</strong></span>
            </div>
          </div>
        </div>

        {/* ẢNH MINH CHỨNG ĐÃ GHI NHẬN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Hình ảnh đồng hồ đã chốt số
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ĐÃ LƯU HỆ THỐNG • MINH CHỨNG SỐ
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
            <img
              src={recordedPhotoUrl}
              alt="Minh chứng đồng hồ"
              className="w-full h-full object-cover"
            />

            {/* Overlays */}
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/80 backdrop-blur-xs text-white text-xs font-mono font-bold rounded-lg border border-white/20 shadow-md">
              Chỉ số chốt: <span className="text-emerald-400 text-base font-extrabold">{confirmedIndex.toLocaleString('vi-VN')} m³</span>
            </div>

            <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-600/90 text-white text-[10px] font-bold rounded-lg shadow-sm">
              Độ tin cậy AI: 98.6%
            </div>

            <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-black/80 backdrop-blur-xs rounded-xl text-white flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium text-[11px]">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thời gian: {meter.readingDate || '04/11/2026 • 15:30'}</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">GPS: 10.7769° N, 106.7009° E</span>
            </div>
          </div>
        </div>

        {/* BẬC THANG TÍNH GIÁ TIỀN NƯỚC */}
        <TierPriceBreakdown tariffData={tariffData} consumption={consumption} />
      </div>

      {/* CỘT PHẢI (5 COLS): KẾT QUẢ & THÔNG TIN HÓA ĐƠN TIỀN NƯỚC */}
      <div className="lg:col-span-5 space-y-4">
        {/* 1. Chỉ số kỳ trước */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              CHỈ SỐ KỲ TRƯỚC (THÁNG 03)
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Ngày chốt: 14/03/2025
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              {meter.previousIndex.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs font-bold text-slate-500 ml-1">m³</span>
          </div>
        </div>

        {/* 2. Thẻ kết quả chốt số & tiêu thụ */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>KẾT QUẢ ĐÃ GHI NHẬN</span>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full shadow-sm">
              ĐÃ KHÓA SỐ
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-4xl font-black text-emerald-950 tracking-tight">
                {confirmedIndex.toLocaleString('vi-VN')}
              </span>
              <span className="text-base font-bold text-emerald-800 ml-1">m³</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                TIÊU THỤ TRONG KỲ
              </span>
              <span className="text-2xl font-black text-emerald-700">
                +{consumption} m³
              </span>
            </div>
          </div>

          {/* Dãy số mặt số đồng hồ nước */}
          <div className="p-3 bg-white/80 border border-emerald-200/80 rounded-xl flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900">Mặt số chốt:</span>
            <div className="flex items-center gap-1 font-mono text-base font-black text-emerald-950 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 shadow-inner">
              {displaySequence.split('').map((char, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded ${
                    char === '0' ? 'text-slate-400 bg-white' : 'text-emerald-900 bg-emerald-50 font-black'
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Bảng quyết toán tiền nước kỳ này */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
              <Receipt className="w-4 h-4 text-sky-600" />
              <span>TỔNG HỢP TIỀN NƯỚC KỲ 04/2025</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">BIỂU SH-01</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tiền nước theo bậc thang:</span>
              <span className="font-semibold">{formatVND(tariffData?.waterAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí Bảo vệ môi trường (10%):</span>
              <span className="font-semibold">{formatVND(tariffData?.envFee || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Thuế Giá trị gia tăng (5%):</span>
              <span className="font-semibold">{formatVND(tariffData?.vatAmount || 0)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
              <span className="font-extrabold text-sm">TỔNG TIỀN PHẢI THU:</span>
              <span className="text-xl font-black text-sky-700">
                {formatVND(tariffData?.totalAmount || 0)}
              </span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Chỉ số đã xác thực hợp lệ và tự động sinh hóa đơn điện tử.</span>
          </div>
        </div>

        {/* 4. Các nút tác vụ */}
        <div className="space-y-2.5 pt-1">
          {nextCustomerName && onNextPending && (
            <button
              onClick={onNextPending}
              className="w-full py-3.5 px-4 rounded-xl bg-sky-800 hover:bg-sky-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-800/20 transition-all cursor-pointer"
            >
              <span>Chuyển sang điểm đo tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onEditAgain}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Hiệu chỉnh lại chỉ số (Nếu phát hiện sai sót)</span>
          </button>
        </div>

        {nextCustomerName && (
          <div className="p-3 bg-slate-100/70 rounded-xl text-center text-xs text-slate-500 font-medium">
            Hộ kế tiếp cần ghi: <strong className="text-slate-700">{nextCustomerName}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
