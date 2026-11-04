import React from 'react';
import { Camera, X, Clock, Receipt } from 'lucide-react';

interface MeterImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewInvoice: () => void;
  period?: string;
  meterSerial?: string;
  readingIndex?: number;
  recordedAt?: string;
  imageUrl?: string;
}

export const MeterImageModal: React.FC<MeterImageModalProps> = ({
  isOpen,
  onClose,
  onViewInvoice,
  period = 'Tháng 09/2026',
  meterSerial = 'WF-79012',
  readingIndex = 1258.0,
  recordedAt = '28/09/2026 • 09:15',
  imageUrl = '/uploads/raw/1_bee59a99_raw.jpg',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Ảnh chỉ số {period}
              </h2>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase">
                MÃ ĐỒNG HỒ: {meterSerial}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mt-4 rounded-xl overflow-hidden bg-slate-900 aspect-[16/10] flex items-center justify-center border border-slate-200">
          <img
            src={imageUrl}
            alt="Ảnh chụp đồng hồ nước"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/20">
            IMG_{meterSerial.replace(/[^a-zA-Z0-9]/g, '')}_20260928.JPG
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold border border-sky-100">
              Chỉ số: {readingIndex.toLocaleString('vi-VN')} m³
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{recordedAt}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewInvoice();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Xem hóa đơn tương ứng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

