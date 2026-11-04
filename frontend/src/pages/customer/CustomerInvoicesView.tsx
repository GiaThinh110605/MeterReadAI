import React, { useState } from 'react';
import {
  Download,
  Share2,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  Droplet,
  ExternalLink,
} from 'lucide-react';
import { CustomerInvoiceItem } from '../../types';

interface CustomerInvoicesViewProps {
  invoices: CustomerInvoiceItem[];
  onPayInvoice: (invoiceId: number) => Promise<void>;
  onOpenPhotoModal: () => void;
}

export const CustomerInvoicesView: React.FC<CustomerInvoicesViewProps> = ({
  invoices,
  onPayInvoice,
  onOpenPhotoModal,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number>(
    invoices[0]?.id || 1
  );
  const [isPaying, setIsPaying] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'UNPAID') return inv.status === 'UNPAID';
    if (filter === 'PAID') return inv.status === 'PAID';
    return true;
  });

  const selectedInvoice =
    invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];

  const handlePay = async () => {
    if (!selectedInvoice || selectedInvoice.status === 'PAID') return;
    setIsPaying(true);
    try {
      await onPayInvoice(selectedInvoice.id);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              LỊCH SỬ & QUYẾT TOÁN
            </p>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Hóa đơn
            </h1>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                filter === 'ALL'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả {invoices.length}
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNPAID')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                filter === 'UNPAID'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa thanh toán{' '}
              {invoices.filter((i) => i.status === 'UNPAID').length}
            </button>
            <button
              type="button"
              onClick={() => setFilter('PAID')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                filter === 'PAID'
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã thanh toán
            </button>
          </div>

          <div className="space-y-3">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => {
                const isSelected = inv.id === selectedInvoiceId;
                const isUnpaid = inv.status === 'UNPAID';
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-500/10'
                        : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                          <Droplet className="w-3.5 h-3.5 fill-sky-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {inv.period}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isUnpaid
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isUnpaid ? 'Chưa thanh toán' : 'Đã thanh toán'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1">
                      Mã HĐ: {inv.invoiceCode}
                    </p>

                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          SỐ TIỀN CẦN TRẢ
                        </p>
                        <p className="text-lg font-extrabold text-slate-900">
                          {inv.amount.toLocaleString('vi-VN')}{' '}
                          <span className="text-xs font-normal">đ</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          KHỐI LƯỢNG
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {inv.volume} m³
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        {isUnpaid
                          ? `Hạn: ${inv.dueDate}`
                          : `Thanh toán: ${inv.paidDate}`}
                      </span>
                      <span className="text-sky-600 font-semibold flex items-center gap-0.5">
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-xs text-slate-500">
                Không tìm thấy hóa đơn nào trong mục này.
              </div>
            )}
          </div>
        </div>

        {selectedInvoice ? (
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  HÓA ĐƠN ĐIỆN TỬ
                </p>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  Chi tiết hóa đơn {selectedInvoice.invoiceCode}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Kỳ tiêu thụ: {selectedInvoice.period}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    selectedInvoice.status === 'UNPAID'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedInvoice.status === 'UNPAID'
                    ? 'Chưa thanh toán'
                    : 'Đã thanh toán'}
                </span>
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200"
                  title="Tải hóa đơn PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200"
                  title="Chia sẻ"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedInvoice.amount.toLocaleString('vi-VN')} đ
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2">
                CHỈ SỐ ĐO ĐẠC
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Chỉ số cũ
                  </p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {selectedInvoice.previousIndex.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">28/08/2026</p>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-center">
                  <p className="text-[10px] text-sky-700 uppercase font-semibold">
                    Chỉ số mới
                  </p>
                  <p className="text-base font-bold text-sky-800 mt-0.5">
                    {selectedInvoice.currentIndex.toLocaleString('vi-VN')}
                  </p>
                  <p className="text-[10px] text-sky-600 mt-0.5">28/09/2026</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Tiêu thụ
                  </p>
                  <p className="text-base font-bold text-slate-800 mt-0.5">
                    {selectedInvoice.volume} m³
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    +{selectedInvoice.diffVolume} m³ so kỳ trước
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  BIỂU PHÍ SINH HOẠT BẬC THANG
                </p>
                <span className="text-[10px] text-slate-400">
                  Theo QĐ số 38/UBND
                </span>
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100 mb-4">
                <div className="bg-sky-500 h-full w-[55%]"></div>
                <div className="bg-indigo-600 h-full w-[45%]"></div>
              </div>

              <div className="space-y-2 text-xs">
                {selectedInvoice.tiers.map((t) => (
                  <div
                    key={t.tierOrder}
                    className="flex items-center justify-between text-slate-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <span>
                        {t.name} ({t.volume} m³ ×{' '}
                        {t.unitPrice.toLocaleString('vi-VN')} đ)
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {t.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between text-slate-700 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    <span>Thuế GTGT & Phí BVMT (VAT 5% + BVMT 10%)</span>
                  </span>
                  <span className="font-semibold text-slate-900">
                    {selectedInvoice.taxAndEnvFee.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Tổng cộng thanh toán
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Đã bao gồm thuế và các loại phí
                    </p>
                  </div>
                  <p className="text-xl font-extrabold text-[#0369a1]">
                    {selectedInvoice.amount.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  ẢNH CHỤP MINH CHỨNG CHỈ SỐ
                </p>
                <button
                  type="button"
                  onClick={onOpenPhotoModal}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem kích thước gốc</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                <div
                  onClick={onOpenPhotoModal}
                  className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={selectedInvoice.photoUrl}
                    alt="Đồng hồ nước"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Chỉ số đã đối soát tự động</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Ảnh chụp bởi nhân viên thu đo {selectedInvoice.recordedBy}
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    {selectedInvoice.recordedAt} • Đồng hồ{' '}
                    {selectedInvoice.meterSerial}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handlePay}
                disabled={selectedInvoice.status === 'PAID' || isPaying}
                className="w-full py-3 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {selectedInvoice.status === 'PAID' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hóa đơn này đã được thanh toán</span>
                  </>
                ) : isPaying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      Thanh toán {selectedInvoice.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
            <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chưa có hóa đơn nào</h3>
            <p className="text-xs text-slate-400 mt-1">Thông tin chi tiết hóa đơn sẽ xuất hiện sau khi hệ thống tạo hóa đơn.</p>
          </div>
        )}
      </div>
    </div>
  );
};

