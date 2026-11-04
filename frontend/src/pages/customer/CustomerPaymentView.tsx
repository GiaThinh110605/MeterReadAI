import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  ShieldCheck,
  FileText,
  Headphones,
  Clock,
  QrCode,
  Wallet,
  CreditCard,
  Building2,
  Info,
  Droplet,
} from 'lucide-react';
import { CustomerInvoiceItem } from '../../types';

interface CustomerPaymentViewProps {
  invoice: CustomerInvoiceItem;
  customerName?: string;
  customerCode?: string;
  meterCode?: string;
  address?: string;
  onBack: () => void;
  onPaymentSuccess: (invoiceId: number) => Promise<void>;
}

export const CustomerPaymentView: React.FC<CustomerPaymentViewProps> = ({
  invoice,
  customerName = 'Nguyễn Văn An',
  customerCode = 'KH000123',
  meterCode = 'DH001245 (Tầng 1)',
  address = '45 Lê Văn Sỹ, P. 13, Q. 3',
  onBack,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<'vietqr' | 'ewallet' | 'atm' | 'intl'>('vietqr');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(532);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      await onPaymentSuccess(invoice.id);
      setIsSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotalWater = 195000;
  const vatAmount = 9750;
  const envFee = 40250;
  const totalAmount = invoice.amount || 245000;

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Thanh toán thành công
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            Đã thanh toán {totalAmount.toLocaleString('vi-VN')} đ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hóa đơn {invoice.invoiceCode} • Kỳ {invoice.period} đã được quyết toán.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-left max-w-md mx-auto space-y-3 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Mã giao dịch:</span>
            <span className="font-mono font-semibold text-slate-800">TXN{Date.now().toString().slice(-8)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Phương thức:</span>
            <span className="font-semibold text-slate-800">VietQR (Tự động khớp lệnh)</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Thời gian:</span>
            <span className="font-semibold text-slate-800">Vừa xong</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-800 font-bold">
            <span>Trạng thái cấp nước:</span>
            <span className="text-emerald-600">Duy trì liên tục</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          Quay lại danh sách Hóa đơn
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại danh sách Hóa đơn</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Thanh toán hóa đơn
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
              • Kỳ 09/2026 • Hạn đóng 30/09/2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-100/80 w-fit">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Giao dịch giữ trong</span>
          <span className="font-mono text-rose-600 font-bold">{formatTimer(timeLeft)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              BƯỚC 1: CHỌN PHƯƠNG THỨC THANH TOÁN
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Miễn phí phí thanh toán</span>
            </span>
          </div>

          <div
            onClick={() => setMethod('vietqr')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
              method === 'vietqr'
                ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={method === 'vietqr'}
                  onChange={() => setMethod('vietqr')}
                  className="w-4 h-4 text-sky-600 mt-1 cursor-pointer"
                />
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Mã VietQR / Quét mã ngân hàng
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      KHUYẾN DÙNG
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tự động khớp lệnh 24/7 • Xác nhận tức thì sau 3 giây
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-slate-100">VCB</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100">MB</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100">TCB</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100">+40</span>
              </div>
            </div>

            {method === 'vietqr' && (
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
                <div className="bg-slate-50/70 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                    <div className="relative w-52 h-52 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=https://waterflow.vn/pay/${invoice.invoiceCode}`}
                        alt="Mã VietQR"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 rounded-xl bg-[#0369a1] text-white flex items-center justify-center font-extrabold text-xs shadow-md border-2 border-white">
                          WF
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-3 flex items-center gap-1.5">
                      <span>📷 Mở app Ngân hàng để quét mã</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Ngân hàng thụ hưởng</span>
                    <span className="font-bold text-slate-900">Vietcombank (Hội sở chính)</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Chủ tài khoản</span>
                    <span className="font-bold text-slate-900 uppercase">CONG TY CAP NUOC WATERFLOW</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">1900 128 9999</span>
                      <button
                        type="button"
                        onClick={() => handleCopy('1900 128 9999', 'account')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                        title="Sao chép"
                      >
                        {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Nội dung chuyển khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-800 text-sm">{invoice.invoiceCode.replace('#', '')}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(invoice.invoiceCode.replace('#', ''), 'content')}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
                        title="Sao chép"
                      >
                        {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hệ thống tự động điền số tiền và mã hóa đơn chính xác 100%</span>
                </p>
              </div>
            )}
          </div>

          <div
            onClick={() => setMethod('ewallet')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex items-center justify-between ${
              method === 'ewallet'
                ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={method === 'ewallet'}
                onChange={() => setMethod('ewallet')}
                className="w-4 h-4 text-sky-600 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Ví điện tử</span>
                <p className="text-xs text-slate-500">Thanh toán một chạm qua app ví</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-100">MoMo</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">ZaloPay</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">VNPay</span>
            </div>
          </div>

          <div
            onClick={() => setMethod('atm')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex items-center justify-between ${
              method === 'atm'
                ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={method === 'atm'}
                onChange={() => setMethod('atm')}
                className="w-4 h-4 text-sky-600 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Thẻ ATM nội địa (Napas)</span>
                <p className="text-xs text-slate-500">Internet Banking hơn 40 ngân hàng</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Napas 247
            </span>
          </div>

          <div
            onClick={() => setMethod('intl')}
            className={`rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex items-center justify-between ${
              method === 'intl'
                ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-500/10'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="paymentMethod"
                checked={method === 'intl'}
                onChange={() => setMethod('intl')}
                className="w-4 h-4 text-sky-600 cursor-pointer"
              />
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Thẻ quốc tế</span>
                <p className="text-xs text-slate-500">Visa, Mastercard, JCB</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-100">VISA</span>
              <span className="px-2 py-0.5 rounded bg-slate-100">MC</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-slate-900">Chỉ số tiêu thụ tự động cập nhật</p>
              <p className="text-slate-600 leading-relaxed">
                Ngay khi nhận thanh toán, trạng thái cấp nước duy trì liên tục và biên lai điện tử gửi về SMS/Email của bạn.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              BƯỚC 2: XÁC NHẬN HÓA ĐƠN
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Mã: {invoice.invoiceCode.replace('#', '')}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 text-sm">{customerName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {customerCode}
              </span>
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>Đồng hồ đo:</span>
              <span className="font-semibold text-slate-800">{meterCode}</span>
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>Địa chỉ cấp nước:</span>
              <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">{address}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-sky-600" />
                <span>Lượng nước tiêu thụ</span>
              </span>
              <span className="font-bold text-slate-900">{invoice.volume} m³</span>
            </div>

            <div className="flex justify-between">
              <span>Tiền nước sinh hoạt</span>
              <span className="font-medium text-slate-800">{subtotalWater.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="flex justify-between">
              <span>Thuế GTGT (5%)</span>
              <span className="font-medium text-slate-800">{vatAmount.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="flex justify-between">
              <span>Phí BV môi trường (10%)</span>
              <span className="font-medium text-slate-800">{envFee.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Phí giao dịch trực tuyến</span>
              <span>Miễn phí (0 đ)</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-semibold uppercase">Tổng tiền thanh toán</span>
              <span className="text-3xl font-extrabold text-[#0284c7] tracking-tight">
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-right mt-0.5">
              Đã bao gồm đầy đủ thuế và phí bảo vệ môi trường
            </p>
          </div>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Xác nhận thanh toán {totalAmount.toLocaleString('vi-VN')} đ</span>
              </>
            )}
          </button>

          <div className="pt-2 text-[11px] text-slate-500 space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-4 text-slate-700 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bảo mật mã hóa SSL 256-bit</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Hóa đơn điện tử VAT</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
              Biên lai điện tử hợp chuẩn Tổng cục Thuế được gửi tự động qua SMS và Zalo sau khi giao dịch thành công.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1 text-slate-500">
              <Headphones className="w-3.5 h-3.5" />
              <span>Cần trợ giúp thanh toán?</span>
            </span>
            <a href="tel:19001289" className="font-bold text-sky-800 hover:underline">
              1900 1289 (24/7)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

