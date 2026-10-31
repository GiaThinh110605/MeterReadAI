import React from 'react';
import { Target, CheckCircle2, AlertOctagon, ArrowRight, Cloud, History } from 'lucide-react';

interface AIRecognitionCardProps {
  previousIndex: number;
  aiPredictedSequence: string;
  aiConfidence: number;
  confirmedIndex: number;
  onChangeConfirmedIndex: (val: number) => void;
  correctionReason: string;
  onChangeCorrectionReason: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  nextCustomerName?: string;
}

export const AIRecognitionCard: React.FC<AIRecognitionCardProps> = ({
  previousIndex,
  aiPredictedSequence,
  aiConfidence,
  confirmedIndex,
  onChangeConfirmedIndex,
  correctionReason,
  onChangeCorrectionReason,
  onSubmit,
  isSubmitting,
  nextCustomerName = 'Trần Văn Bình (125 Nguyễn Trãi)'
}) => {
  const consumption = Math.round((confirmedIndex - previousIndex) * 100) / 100;
  const isModified = confirmedIndex !== Number(aiPredictedSequence);
  const isInvalid = confirmedIndex < previousIndex;

  const quickReasons = [
    'Mặt kính chói sáng làm mờ số cuối',
    'Chữ số bị trôi lửng giữa 2 nấc',
    'Góc chụp nghiêng do vị trí hẹp'
  ];

  return (
    <div className="space-y-4">
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
            {previousIndex.toLocaleString('vi-VN')}
          </span>
          <span className="text-xs font-bold text-slate-500 ml-1">m³</span>
        </div>
      </div>

      {/* 2. Kết quả AI nhận diện Card */}
      <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-sky-800 font-bold text-xs">
            <Target className="w-4 h-4 text-sky-600" />
            <span>KẾT QUẢ AI NHẬN DIỆN</span>
          </div>
          <span className="px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>{(aiConfidence * 100).toFixed(1)}% độ tin cậy</span>
          </span>
        </div>

        {/* Big numbers */}
        <div className="flex items-baseline justify-between mt-3">
          <div>
            <span className="text-4xl font-black text-sky-950 tracking-tight">
              {confirmedIndex.toLocaleString('vi-VN')}
            </span>
            <span className="text-base font-bold text-sky-800 ml-1">m³</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">TIÊU THỤ TÍNH TOÁN</span>
            <span className={`text-xl font-extrabold ${consumption >= 0 ? 'text-sky-800' : 'text-rose-600'}`}>
              {consumption >= 0 ? `+${consumption}` : consumption} m³
            </span>
          </div>
        </div>

        {/* Manual Edit Input Box */}
        <div className="mt-4 pt-4 border-t border-sky-200/60">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Chỉnh sửa thủ công nếu phát hiện sai sót:</span>
            <span className="text-[11px] text-sky-600 font-medium">Tự động tính lại</span>
          </div>

          <input
            type="number"
            step="1"
            value={confirmedIndex}
            onChange={(e) => onChangeConfirmedIndex(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-white border border-sky-200 focus:border-sky-500 rounded-xl text-lg font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
          />

          {/* Audit trail reason (shown when edited) */}
          {isModified && (
            <div className="mt-3 p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl animate-in fade-in duration-200">
              <label className="block text-[11px] font-bold text-amber-900 mb-1">
                Lý do chỉnh sửa (Bắt buộc theo Audit Trail) *
              </label>
              <input
                type="text"
                required
                value={correctionReason}
                onChange={(e) => onChangeCorrectionReason(e.target.value)}
                placeholder="Nhập lý do con người xác minh lại..."
                className="w-full px-3 py-2 bg-white border border-amber-200 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {quickReasons.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => onChangeCorrectionReason(qr)}
                    className="text-[10px] px-2 py-0.5 bg-amber-100/60 hover:bg-amber-100 text-amber-900 rounded font-medium"
                  >
                    + {qr}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Automatic Validation Banner */}
      {isInvalid ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold text-rose-900">Vi phạm ràng buộc nghiệp vụ (I_mới &lt; I_cũ)!</p>
            <p className="mt-0.5 text-rose-700">
              Chỉ số mới ({confirmedIndex}) nhỏ hơn chỉ số cũ ({previousIndex}). Hệ thống từ chối lưu theo quy chuẩn kỹ thuật. Vui lòng kiểm tra lại hoặc lập Biên bản bất thường.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-950">Chỉ số hợp lệ - Đã kiểm tra sai số tự động</p>
            <p className="mt-0.5 text-emerald-700">
              Mức tiêu thụ {consumption} m³ nằm trong hạn mức tiêu chuẩn (Tháng trước: 16 m³). Không phát hiện rò rỉ ngầm.
            </p>
          </div>
        </div>
      )}

      {/* 4. Main CTA Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting || isInvalid || (isModified && !correctionReason.trim())}
        className="w-full py-4 px-6 rounded-2xl bg-sky-800 hover:bg-sky-900 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-800/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span>{isSubmitting ? 'Đang gửi chỉ số...' : 'Xác nhận & Gửi chỉ số'}</span>
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* 5. Footer synchronization cues */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
        <span className="flex items-center gap-1">
          <Cloud className="w-3.5 h-3.5 text-slate-400" />
          <span>Đồng bộ tức thì lên máy chủ trung tâm</span>
        </span>
        <button
          onClick={() => alert('Đang mở bảng tra cứu 12 tháng lịch sử')}
          className="text-sky-700 hover:underline flex items-center gap-1 font-semibold"
        >
          <History className="w-3.5 h-3.5" />
          <span>Xem lịch sử 12 tháng</span>
        </button>
      </div>

      <div className="p-3 bg-slate-100/70 rounded-xl text-center text-xs text-slate-500 font-medium">
        Sau khi gửi, hệ thống tự động chuyển sang: <strong className="text-slate-700">{nextCustomerName}</strong>
      </div>
    </div>
  );
};
