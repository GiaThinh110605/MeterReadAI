import React, { useState } from 'react';
import { AlertTriangle, X, Send } from 'lucide-react';

interface AbnormalityModalProps {
  isOpen: boolean;
  meterId: number;
  meterCode: string;
  customerName: string;
  onClose: () => void;
  onSubmit: (reportType: string, description: string) => Promise<void>;
}

export const AbnormalityModal: React.FC<AbnormalityModalProps> = ({
  isOpen,
  meterId,
  meterCode,
  customerName,
  onClose,
  onSubmit
}) => {
  const [reportType, setReportType] = useState('LOCKED_DOOR');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    try {
      await onSubmit(reportType, description);
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Lập biên bản bất thường / Báo sự cố</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
          <p className="text-slate-500">Khách hàng: <strong className="text-slate-800">{customerName}</strong></p>
          <p className="text-slate-500 mt-1">Mã đồng hồ: <strong className="text-slate-800">{meterCode}</strong> (ID: {meterId})</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Loại sự cố hiện trường</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="LOCKED_DOOR">Khóa cổng / Khóa cửa không tiếp cận được</option>
              <option value="BROKEN_GLASS">Bể mặt kính / Mặt số đọng nước mờ</option>
              <option value="BROKEN_SEAL">Đứt chì niêm phong / Nghi ngờ gian lận</option>
              <option value="NEGATIVE_CONSUMPTION">Chỉ số mới nhỏ hơn chỉ số cũ (I_mới &lt; I_cũ)</option>
              <option value="LEAK_SUSPECTED">Rò rỉ sau đồng hồ / Tiêu thụ tăng vọt bất thường</option>
              <option value="OTHER">Sự cố kỹ thuật khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết hiện trường</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập ghi chú chi tiết (ví dụ: Hẹn chủ nhà sau 15h, kính bị nứt vỡ...)"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Đang gửi...' : 'Gửi biên bản'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
