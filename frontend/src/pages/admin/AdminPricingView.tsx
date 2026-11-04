import React, { useEffect, useState } from 'react';
import {
  Droplet,
  Percent,
  ShieldAlert,
  Calendar,
  History,
  Plus,
  Edit2,
  Download,
  CheckCircle2,
  Info,
  Layers,
  Lock,
  Smartphone,
  X,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminPricingData, AdminTariffTierItem, TariffHistoryItem } from '../../types';

export const AdminPricingView: React.FC = () => {
  const [data, setData] = useState<AdminPricingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // History modal states
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [histories, setHistories] = useState<TariffHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Add tariff modal states
  const [isAddTariffModalOpen, setIsAddTariffModalOpen] = useState(false);
  const [isSubmittingTariff, setIsSubmittingTariff] = useState(false);
  const [tariffForm, setTariffForm] = useState({
    name: 'Biểu tính đơn giá bậc thang sinh hoạt',
    customer_type: 'HỘ GIA ĐÌNH SINH HOẠT',
    decision_number: 'QĐ 412/QĐ-UBND 2026',
    effective_date: new Date().toLocaleDateString('vi-VN'),
    note: 'Ban hành biểu giá mới theo quy chuẩn sinh hoạt đô thị',
    tier_1_price: 6700,
    tier_2_price: 7000,
    tier_3_price: 8500,
    tier_4_price: 15000,
  });

  // Edit single tier modal states
  const [editingTier, setEditingTier] = useState<AdminTariffTierItem | null>(null);
  const [editTierPrice, setEditTierPrice] = useState<number>(0);
  const [isSubmittingTier, setIsSubmittingTier] = useState(false);

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getAdminPricing();
      setData(res);
      // Pre-fill tariff form with current tier prices
      if (res.tiers && res.tiers.length >= 4) {
        setTariffForm((prev) => ({
          ...prev,
          tier_1_price: res.tiers[0].unit_price,
          tier_2_price: res.tiers[1].unit_price,
          tier_3_price: res.tiers[2].unit_price,
          tier_4_price: res.tiers[3].unit_price,
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải biểu giá');
    } finally {
      setIsLoading(false);
    }
  };

  const openHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    try {
      setIsHistoryLoading(true);
      const histData = await api.getPricingHistory();
      setHistories(histData);
    } catch (err: any) {
      console.error('Error fetching tariff history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleCreateTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingTariff(true);
      const res = await api.createAdminTariff({
        name: tariffForm.name,
        customer_type: tariffForm.customer_type,
        decision_number: tariffForm.decision_number,
        effective_date: tariffForm.effective_date,
        note: tariffForm.note,
        tier_1_price: Number(tariffForm.tier_1_price),
        tier_2_price: Number(tariffForm.tier_2_price),
        tier_3_price: Number(tariffForm.tier_3_price),
        tier_4_price: Number(tariffForm.tier_4_price),
      });
      setData(res);
      setIsAddTariffModalOpen(false);
      showToast('Đã ban hành biểu giá mới thành công!');
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi tạo biểu giá mới');
    } finally {
      setIsSubmittingTariff(false);
    }
  };

  const handleUpdateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    try {
      setIsSubmittingTier(true);
      await api.updateTierPrice(editingTier.id, Number(editTierPrice));
      await fetchPricing();
      setEditingTier(null);
      showToast(`Đã cập nhật đơn giá cho ${editingTier.tier_name}!`);
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi cập nhật đơn giá');
    } finally {
      setIsSubmittingTier(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-semibold mb-3">{error}</p>
        <button
          onClick={fetchPricing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const pricing = data!;

  // Dynamic simulation calculation using actual database pricing
  const t1Price = pricing.tiers[0]?.unit_price || 6700;
  const t2Price = pricing.tiers[1]?.unit_price || 7000;
  const simT1Amount = 10 * t1Price;
  const simT2Amount = 8 * t2Price;
  const simSubtotal = simT1Amount + simT2Amount;
  const simVat = simSubtotal * 0.05;
  const simEnv = simSubtotal * 0.10;
  const simTotal = simSubtotal + simVat + simEnv;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            DANH MỤC BIỂU PHÍ • Quy chuẩn QĐ-UBND 2026
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Quản lý biểu giá
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cấu hình đơn giá nước sinh hoạt, kinh doanh và bậc thang lũy tiến theo quy định
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openHistoryModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Lịch sử thay đổi giá</span>
          </button>
          <button
            onClick={() => setIsAddTariffModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm biểu giá</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              LOẠI HÌNH ÁP DỤNG
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-extrabold text-slate-800">
              {pricing.customer_type}
            </div>
            <div className="flex items-center space-x-1.5 mt-2 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Lũy tiến 4 bậc bắt buộc</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              THUẾ GTGT
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-800">
              {pricing.vat_percentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              Theo Thông tư số 219/2013/TT-BTC
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              PHÍ BẢO VỆ MÔI TRƯỜNG
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-800">
              {pricing.env_fee_percentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">
              Áp dụng trên giá gốc tính nước
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              KỲ KẾ TOÁN HIỆU LỰC
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-base font-extrabold text-slate-800">
              {pricing.effective_period}
            </div>
            <div className="text-[11px] text-blue-600 font-semibold mt-2">
              Đang đồng bộ {pricing.synced_meters_count.toLocaleString('vi-VN')} đồng hồ
            </div>
          </div>
        </div>
      </div>

      {/* Active Tiers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-800">Biểu giá hiện hành</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 uppercase">
                HỆ THỐNG 4 BẬC TIÊU CHUẨN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Biểu phí định ngạch áp dụng tự động cho toàn bộ hợp đồng sử dụng nước sinh hoạt dân cư
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Đơn vị: <span className="font-bold text-slate-700">VNĐ / m³</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">BẬC</th>
                <th className="py-3.5 px-5">MỨC TIÊU THỤ</th>
                <th className="py-3.5 px-5">ĐƠN GIÁ</th>
                <th className="py-3.5 px-5">NGÀY ÁP DỤNG</th>
                <th className="py-3.5 px-5">TRẠNG THÁI</th>
                <th className="py-3.5 px-5 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pricing.tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center">
                        {tier.tier_order}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{tier.tier_name}</div>
                        <div className="text-[11px] text-slate-400">{tier.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-semibold text-slate-700">
                    {tier.max_volume ? `${tier.min_volume} – ${tier.max_volume} m³` : `Trên ${tier.min_volume - 1} m³`}
                  </td>
                  <td className="py-4 px-5 font-extrabold text-blue-600 text-sm">
                    {formatVND(tier.unit_price)}/m³
                  </td>
                  <td className="py-4 px-5 text-slate-600 font-medium">
                    {tier.effective_date}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{tier.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => {
                        setEditingTier(tier);
                        setEditTierPrice(tier.unit_price);
                      }}
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{pricing.surcharge_note}</span>
          </div>
          <div className="font-semibold text-slate-700">
            Quyết định phê duyệt: <span className="font-mono">{pricing.approval_doc}</span>
          </div>
        </div>
      </div>

      {/* Invoice Simulation & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-800">
                  Minh họa tính toán hóa đơn mẫu
                </h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-extrabold rounded">
                  TIÊU THỤ MẪU: 18 M³
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Mô phỏng tự động theo thuật toán tính cước lũy tiến
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              PHÂN BỔ CHỈ SỐ QUA CÁC BẬC NGẠCH
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div style={{ width: '55.5%' }} className="bg-blue-600 h-full"></div>
              <div style={{ width: '44.5%' }} className="bg-sky-400 h-full"></div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Bậc 1: 10 m³ (Tối đa bậc)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>Bậc 2: 8 m³ (Còn dư)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>Bậc 3 & 4: 0 m³</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>Bậc 1: 10 m³ × {formatVND(t1Price)}</span>
              <span className="font-bold">{formatVND(simT1Amount)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Bậc 2: 8 m³ × {formatVND(t2Price)}</span>
              <span className="font-bold">{formatVND(simT2Amount)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-800 font-bold pt-2 border-t border-slate-100">
              <span>Tổng tiền nước thô:</span>
              <span>{formatVND(simSubtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>Thuế GTGT (5%):</span>
              <span>+ {formatVND(simVat)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>Phí bảo vệ môi trường (10%):</span>
              <span>+ {formatVND(simEnv)}</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">TỔNG THANH TOÁN THỰC TẾ</div>
              <div className="text-[11px] text-slate-500">Bao gồm VAT & phí BVMT</div>
            </div>
            <div className="text-2xl font-extrabold text-blue-600">
              {formatVND(simTotal)}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Lưu ý pháp lý & nghiệp vụ
              </h3>
              <p className="text-xs text-slate-500 mt-1">Quy chế ban hành giá cước</p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Hiệu lực chu kỳ tiếp theo</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Biểu giá mới chỉ áp dụng cho kỳ ghi số tiếp theo, không tự động ghi đè hóa đơn lịch sử đã phát hành.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Tính toàn vẹn dữ liệu kế toán</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Các hóa đơn đang ở trạng thái Chờ thanh toán sẽ giữ nguyên đơn giá tại thời điểm chốt sổ ghi số để đảm bảo tính pháp lý về đối soát ngân quỹ.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">Đồng bộ thiết bị cầm tay</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Khi cập nhật bảng giá, máy ghi số di động của nhân viên tuyến đường sẽ tự động nạp bảng giá mới sau 00:00 ngày có hiệu lực.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Văn bản pháp lý đính kèm</div>
                <div className="text-[11px] text-slate-400 font-mono">QD_GIA_NUOC_2026_SO412.PDF (1.8 MB)</div>
              </div>
            </div>
            <button
              onClick={() => alert('Văn bản quyết định đã được lưu trữ trong hồ sơ số hóa.')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Lịch sử thay đổi giá */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Lịch sử thay đổi biểu giá</h3>
                  <p className="text-xs text-slate-500">Nhật ký ban hành và điều chỉnh đơn giá nước sinh hoạt</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {isHistoryLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : histories.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Chưa có lịch sử thay đổi biểu giá nào
                </div>
              ) : (
                <div className="space-y-3">
                  {histories.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            {h.decision_number}
                          </span>
                          <span className="font-bold text-slate-800 text-xs">{h.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{h.created_at}</span>
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60">
                        {h.tier_summary}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <div>
                          Người thực hiện: <span className="font-semibold text-slate-700">{h.changed_by}</span>
                        </div>
                        <div>
                          Hiệu lực từ: <span className="font-semibold text-blue-600">{h.effective_date}</span>
                        </div>
                      </div>

                      {h.note && (
                        <div className="text-[11px] text-slate-400 italic">
                          * {h.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Thêm biểu giá mới */}
      {isAddTariffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Ban hành biểu giá mới</h3>
                  <p className="text-xs text-slate-500">Cấu hình biểu giá bậc thang sinh hoạt cho chu kỳ mới</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTariffModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTariff} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Tên biểu giá</label>
                  <input
                    type="text"
                    required
                    value={tariffForm.name}
                    onChange={(e) => setTariffForm({ ...tariffForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="VD: Biểu tính đơn giá bậc thang sinh hoạt 2026"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Số hiệu quyết định</label>
                  <input
                    type="text"
                    required
                    value={tariffForm.decision_number}
                    onChange={(e) => setTariffForm({ ...tariffForm, decision_number: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="VD: QĐ 412/QĐ-UBND"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ngày hiệu lực</label>
                  <input
                    type="text"
                    required
                    value={tariffForm.effective_date}
                    onChange={(e) => setTariffForm({ ...tariffForm, effective_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    placeholder="VD: 01/10/2026"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Đơn giá các bậc tiêu thụ (VNĐ / m³)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <label className="text-xs font-bold text-blue-700">Bậc 1 (≤10 m³)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={tariffForm.tier_1_price}
                      onChange={(e) => setTariffForm({ ...tariffForm, tier_1_price: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <label className="text-xs font-bold text-blue-700">Bậc 2 (10-20 m³)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={tariffForm.tier_2_price}
                      onChange={(e) => setTariffForm({ ...tariffForm, tier_2_price: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <label className="text-xs font-bold text-blue-700">Bậc 3 (20-30 m³)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={tariffForm.tier_3_price}
                      onChange={(e) => setTariffForm({ ...tariffForm, tier_3_price: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <label className="text-xs font-bold text-blue-700">Bậc 4 (&gt;30 m³)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={tariffForm.tier_4_price}
                      onChange={(e) => setTariffForm({ ...tariffForm, tier_4_price: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ghi chú ban hành</label>
                <textarea
                  rows={2}
                  value={tariffForm.note}
                  onChange={(e) => setTariffForm({ ...tariffForm, note: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="Lý do điều chỉnh biểu giá..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Ban hành biểu giá mới sẽ lưu trữ biểu giá hiện tại vào lịch sử và tự động áp dụng biểu giá này cho kỳ hóa đơn tiếp theo.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddTariffModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTariff}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingTariff ? 'Đang lưu...' : 'Ban hành biểu giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh sửa đơn giá từng bậc */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chỉnh sửa đơn giá</h3>
                  <p className="text-xs text-slate-500">{editingTier.tier_name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTier(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTier} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mức tiêu thụ ngạch</label>
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700">
                  {editingTier.max_volume
                    ? `Từ ${editingTier.min_volume} m³ đến ${editingTier.max_volume} m³`
                    : `Trên ${editingTier.min_volume - 1} m³`}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Đơn giá mới (VNĐ / m³)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={editTierPrice}
                  onChange={(e) => setEditTierPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold text-blue-600"
                  placeholder="Nhập đơn giá mới..."
                />
                <div className="text-[11px] text-slate-400">
                  Đơn giá cũ: {formatVND(editingTier.unit_price)}/m³
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTier}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingTier ? 'Đang cập nhật...' : 'Cập nhật đơn giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
