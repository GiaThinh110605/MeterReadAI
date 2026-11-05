import React, { useState } from 'react';
import {
  User,
  MapPin,
  Plus,
  Paperclip,
  CheckCircle2,
  Clock,
  PhoneCall,
  ChevronRight,
  UploadCloud,
  Send,
  X,
} from 'lucide-react';
import { CustomerComplaintItem } from '../../types';

interface CustomerComplaintsViewProps {
  complaints: CustomerComplaintItem[];
  customerName?: string;
  customerCode?: string;
  meterCode?: string;
  address?: string;
  onSubmitComplaint: (data: {
    ticketType: string;
    invoiceCode?: string;
    content: string;
    imageUrl?: string;
  }) => Promise<void>;
}

export const CustomerComplaintsView: React.FC<CustomerComplaintsViewProps> = ({
  complaints,
  customerName = 'Nguyễn Văn An',
  customerCode = 'KH000123',
  meterCode = 'DH001245',
  address = '124 Đường Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
  onSubmitComplaint,
}) => {
  const [ticketType, setTicketType] = useState('Sai chỉ số đồng hồ');
  const [invoiceCode, setInvoiceCode] = useState('HD202609001 - Tháng 09/2026 (245.000 đ)');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitComplaint({
        ticketType,
        invoiceCode: invoiceCode.split(' ')[0],
        content: content.trim(),
        imageUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      });
      setContent('');
      setSelectedFile(null);
      setToastMessage('Đã gửi khiếu nại • Mã KN00021 • Chờ xử lý');
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                HỖ TRỢ TRỰC TUYẾN
              </p>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                Khiếu nại & Hỗ trợ
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('complaint-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo khiếu nại</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {customerName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      • Đang dùng nước
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hợp đồng cấp nước hộ dân cư
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                CHÍNH CHỦ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">MÃ KHÁCH HÀNG</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{customerCode}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-400 uppercase font-bold">MÃ ĐỒNG HỒ ĐO</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{meterCode}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{address}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Danh sách yêu cầu
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {complaints.length} phiếu
                </span>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                Sắp xếp: Mới nhất ∨
              </span>
            </div>

            <div className="space-y-3">
              {complaints.length > 0 ? (
                complaints.map((ticket) => {
                  const isProcessing = ticket.status === 'PROCESSING' || ticket.status === 'PENDING';
                  return (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800">
                            {ticket.ticketType}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isProcessing
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isProcessing ? '• Đang xử lý' : '• Đã giải quyết'}
                          </span>
                        </div>

                        <span className="text-xs text-slate-400">
                          {ticket.createdAt}
                        </span>
                      </div>

                      {ticket.invoiceCode && (
                        <p className="text-xs font-semibold text-slate-600">
                          Hóa đơn {ticket.invoiceCode}
                        </p>
                      )}

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {ticket.content}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        {ticket.hasImage ? (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>1 tệp hình ảnh</span>
                          </span>
                        ) : ticket.resolutionNote ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{ticket.resolutionNote}</span>
                          </span>
                        ) : (
                          <span></span>
                        )}

                        <button
                          type="button"
                          className="text-sky-600 font-semibold flex items-center gap-0.5 hover:text-sky-700"
                        >
                          <span>Chi tiết</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
                  Chưa có phiếu khiếu nại nào. Bạn có thể gửi phản ánh bằng biểu mẫu bên cạnh.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                HÌNH ẢNH HIỆN TRƯỜNG GẦN NHẤT
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {meterCode}-LOG
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                <img
                  src="/uploads/raw/1_bee59a99_raw.jpg"
                  alt="Hiện trường 1"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                  30/08/2026
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200">
                <img
                  src="/uploads/raw/3_57cb2efe_raw.jpg"
                  alt="Hiện trường 2"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                  14/08/2026
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4" id="complaint-form">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Khiếu nại mới</h2>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                PHIẾU TIẾP NHẬN
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại khiếu nại
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-white"
              >
                <option value="Sai chỉ số đồng hồ">Sai chỉ số đồng hồ</option>
                <option value="Áp lực nước yếu">Áp lực nước yếu</option>
                <option value="Rò rỉ trước đồng hồ">Rò rỉ trước đồng hồ</option>
                <option value="Nghi ngờ đồng hồ chạy nhanh">Nghi ngờ đồng hồ chạy nhanh</option>
                <option value="Khác">Vấn đề khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hóa đơn liên quan
              </label>
              <input
                type="text"
                value={invoiceCode}
                onChange={(e) => setInvoiceCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 bg-slate-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Nội dung phản ánh
                </label>
                <span className="text-[10px] text-slate-400">Tối đa 500 ký tự</span>
              </div>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                placeholder="Mô tả ngắn gọn vấn đề gặp phải..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 resize-none placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thêm ảnh minh chứng đồng hồ
              </label>
              <label className="w-full border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">
                  {selectedFile ? selectedFile.name : 'Kéo thả ảnh hoặc chọn tệp'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Hỗ trợ JPG, PNG (Tối đa 10MB)
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi khiếu nại</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400">
              Thời gian phản hồi cam kết trong vòng 24 giờ làm việc
            </p>
          </form>

          <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  TỔNG ĐÀI SỰ CỐ 24/7
                </p>
                <p className="text-sm font-bold text-slate-900">1900 1289</p>
              </div>
            </div>

            <a
              href="tel:19001289"
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-sky-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Gọi ngay
            </a>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-fadeIn border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

