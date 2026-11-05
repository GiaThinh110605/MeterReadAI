import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  FileCheck2,
  Camera,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintListItem, ComplaintAuditDetail, ComplaintStatsSummary } from '../../types';

export const AdminComplaintsView: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [auditDetail, setAuditDetail] = useState<ComplaintAuditDetail | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('PENDING');
  const [search, setSearch] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  });
  const [stats, setStats] = useState<ComplaintStatsSummary>({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    ai_accuracy_percent: 96.8,
    ai_confidence_avg: 96.8,
    ai_margin_error: 0.4,
  });

  const fetchCounts = async () => {
    try {
      const all = await api.getAdminComplaints();
      const total = all.length;
      const pending = all.filter((c) => c.status === 'PENDING').length;
      const in_progress = all.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'INVESTIGATING').length;
      const resolved = all.filter((c) => c.status === 'RESOLVED' || c.status === 'REJECTED').length;
      setCounts({ total, pending, in_progress, resolved });

      const realStats = await api.getAdminComplaintStats();
      setStats(realStats);
    } catch {
      // ignore
    }
  };

  const fetchList = async () => {
    try {
      setIsLoadingList(true);
      const res = await api.getAdminComplaints(filterTab === 'ALL' ? undefined : filterTab);
      setComplaints(res);
      if (res.length > 0 && !res.find((c) => c.id === selectedId)) {
        setSelectedId(res[0].id);
      }
      fetchCounts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filterTab]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedId) return;
      try {
        setIsLoadingDetail(true);
        const res = await api.getAdminComplaintDetail(selectedId);
        setAuditDetail(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedId]);

  const handleDecision = async (decision: 'ACCEPT' | 'REJECT' | 'RE_INSPECT') => {
    try {
      const res = await api.makeComplaintDecision(selectedId, {
        decision,
        actual_reading: auditDetail?.actual_curr_index || auditDetail?.customer_photo_reading || undefined,
      });
      setDecisionSuccess(res.message);
      fetchList();
      fetchCounts();
      setTimeout(() => setDecisionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Thao tác thất bại');
    }
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.ticket_code.toLowerCase().includes(s) ||
      c.customer_name.toLowerCase().includes(s) ||
      c.meter_code.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            ĐỐI SOÁT MINH CHỨNG ẢNH CHỤP ĐỒNG HỒ VÀ PHÂN ĐỊNH PHẢN ÁNH KHÁCH HÀNG
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5">
            Xử lý khiếu nại
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>
              CHỜ XỬ LÝ: <strong className="text-blue-600">{stats.pending} cần duyệt</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              TỶ LỆ CHÍNH XÁC AI OCR:{' '}
              <strong className="text-emerald-600">
                {stats.ai_accuracy_percent}% (±{stats.ai_margin_error}%)
              </strong>
            </span>
          </div>
        </div>
      </div>

      {decisionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{decisionSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[760px]">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  filterTab === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả {counts.total}
              </button>
              <button
                onClick={() => setFilterTab('PENDING')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  filterTab === 'PENDING' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chờ xử lý {counts.pending}
              </button>
              <button
                onClick={() => setFilterTab('IN_PROGRESS')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  filterTab === 'IN_PROGRESS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đang xử lý {counts.in_progress}
              </button>
              <button
                onClick={() => setFilterTab('RESOLVED')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  filterTab === 'RESOLVED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đã xong {counts.resolved}
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, khách hàng, mã ĐH..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Không có phiếu phản ánh / khiếu nại nào
              </div>
            ) : (
              filteredComplaints.map((item) => {
                const isSelected = item.id === selectedId;
                const isPending = item.status === 'PENDING';
                const isInProgress = item.status === 'IN_PROGRESS';
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-700">{item.ticket_code}</span>
                        {isPending && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 font-bold text-[10px]">
                            Chờ xử lý
                          </span>
                        )}
                        {isInProgress && (
                          <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-600 font-bold text-[10px]">
                            Đang xử lý
                          </span>
                        )}
                        {item.status === 'RESOLVED' && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                            Đã giải quyết
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400">{item.time_ago}</span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-slate-800">{item.customer_name}</span>
                      <span className="text-[11px] font-mono text-slate-400">Mã ĐH: {item.meter_code}</span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 line-clamp-1">{item.issue_type} - {item.description}</div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60 text-[11px]">
                      <span className="font-bold text-rose-600">{item.diff_text}</span>
                      <span className="font-semibold text-blue-600">{item.sub_tag}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !auditDetail ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400 text-sm">
              <AlertTriangle className="w-12 h-12 text-slate-300 mb-2" />
              <span>Chưa có thông tin khiếu nại được chọn</span>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {auditDetail.customer_name.slice(-2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-extrabold text-slate-800">
                        {auditDetail.customer_name}
                      </h2>
                      <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                        {auditDetail.meter_code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{auditDetail.customer_address}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="text-slate-400">
                    Ngày tiếp nhận: <strong className="text-slate-700">{auditDetail.receive_date}</strong>
                  </div>
                  <div className="text-[11px] font-bold text-blue-600 uppercase mt-0.5">
                    {auditDetail.route_name}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ý KIẾN PHẢN ÁNH TỪ KHÁCH HÀNG
                </div>
                <p className="italic leading-relaxed">
                  "{auditDetail.customer_quote}"
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Đối chiếu minh chứng thực tế</span>
                  </h3>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                    ĐỘ PHÂN GIẢI CAO & GIÁM ĐỊNH AI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">1. Ảnh khách hàng gửi</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Chính diện • Rõ nét
                      </span>
                    </div>

                    <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center h-44">
                      <img
                        src={auditDetail.customer_photo_url || "/uploads/raw/3_57cb2efe_raw.jpg"}
                        alt="Customer Meter"
                        className="object-cover w-full h-full opacity-90"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded">
                        {auditDetail.customer_photo_roi}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-emerald-400 text-[10px] font-mono font-bold rounded">
                        Độ tin cậy: {auditDetail.customer_photo_confidence}%
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-black/80 backdrop-blur-xs rounded text-white flex items-center justify-between text-xs font-bold">
                        <span>Giá trị đọc:</span>
                        <span className="text-emerald-400 font-mono text-sm">{auditDetail.customer_photo_reading.toLocaleString('vi-VN')} m³</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{auditDetail.customer_photo_time}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{auditDetail.customer_photo_note}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">2. Ảnh nhân viên hiện trường</span>
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">
                        Chói lóa • Góc nghiêng
                      </span>
                    </div>

                    <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center h-44">
                      <img
                        src={auditDetail.staff_photo_url || "/uploads/raw/1_31d7c35b_raw.jpg"}
                        alt="Staff Meter"
                        className="object-cover w-full h-full opacity-90"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-mono font-bold rounded">
                        {auditDetail.staff_photo_roi}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-amber-400 text-[10px] font-mono font-bold rounded">
                        Độ tin cậy: {auditDetail.staff_photo_confidence}%
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-black/80 backdrop-blur-xs rounded text-white flex items-center justify-between text-xs font-bold">
                        <span>AI ban đầu:</span>
                        <span className="text-rose-400 font-mono text-sm">{auditDetail.staff_photo_reading.toLocaleString('vi-VN')} m³</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>NV: {auditDetail.staff_photo_staff} • {auditDetail.staff_photo_time}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-rose-600 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{auditDetail.staff_photo_note}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Bảng đối soát chỉ số & Tiền nước
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    ĐƠN GIÁ ĐỊNH MỨC SH-01
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">KHOẢN MỤC ĐỐI SOÁT</th>
                        <th className="py-2.5 px-3 text-right">CHỈ SỐ CŨ (M³)</th>
                        <th className="py-2.5 px-3 text-right">CHỈ SỐ MỚI (M³)</th>
                        <th className="py-2.5 px-3 text-right">TIÊU THỤ</th>
                        <th className="py-2.5 px-3 text-right">THÀNH TIỀN (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 text-slate-700 font-medium flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          <span>Hóa đơn hệ thống ghi nhận</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{auditDetail.original_prev_index}</td>
                        <td className="py-2.5 px-3 text-right text-slate-800 font-bold">{auditDetail.original_curr_index}</td>
                        <td className="py-2.5 px-3 text-right text-slate-800 font-bold">{auditDetail.original_consumption} m³</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">{formatVND(auditDetail.original_amount)}</td>
                      </tr>
                      <tr className="bg-emerald-50/30">
                        <td className="py-2.5 px-3 text-emerald-800 font-bold flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Thực tế theo khách phản ánh</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{auditDetail.actual_prev_index}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{auditDetail.actual_curr_index}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{auditDetail.actual_consumption} m³</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700">{formatVND(auditDetail.actual_amount)}</td>
                      </tr>
                      <tr className="bg-rose-50/40 font-bold">
                        <td className="py-2.5 px-3 text-rose-700 flex items-center space-x-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                          <span>Chênh lệch đề xuất điều chỉnh</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-extrabold">{auditDetail.diff_consumption} m³</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 font-extrabold">{formatVND(auditDetail.diff_amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Phê duyệt & Hành động quyết định
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    THAO TÁC CÓ LƯU KÝ KIỂM TOÁN
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => handleDecision('ACCEPT')}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-sm shadow-emerald-600/20 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Chấp nhận khiếu nại (1.248 m³)</span>
                  </button>

                  <button
                    onClick={() => handleDecision('REJECT')}
                    className="py-3 px-4 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Từ chối khiếu nại</span>
                  </button>

                  <button
                    onClick={() => handleDecision('RE_INSPECT')}
                    className="py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4 text-slate-500" />
                    <span>Yêu cầu phúc tra hiện trường</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ⓘ Khi chọn "Chấp nhận khiếu nại", hệ thống WaterFlow sẽ tự động khởi tạo Hóa đơn điều chỉnh HD-DC-0942 và gửi thông báo SMS/Zalo kèm biên lai số cho khách hàng.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

