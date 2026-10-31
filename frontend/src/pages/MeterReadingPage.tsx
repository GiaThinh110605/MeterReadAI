import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  RotateCw,
  Search,
  CheckCircle2,
  Lock,
  Clock,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { MeterItem, TariffCalculation } from '../types';
import { CameraView } from '../components/reader/CameraView';
import { AIRecognitionCard } from '../components/reader/AIRecognitionCard';
import { TierPriceBreakdown } from '../components/reader/TierPriceBreakdown';
import { AbnormalityModal } from '../components/common/AbnormalityModal';

interface MeterReadingPageProps {
  routeId: number;
  onBackToRoutes: () => void;
}

export const MeterReadingPage: React.FC<MeterReadingPageProps> = ({ routeId, onBackToRoutes }) => {
  const [meters, setMeters] = useState<MeterItem[]>([]);
  const [selectedMeterId, setSelectedMeterId] = useState<number>(1);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'RECORDED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI and Reading state
  const [currentImage, setCurrentImage] = useState<string>('https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80');
  const [aiSequence, setAiSequence] = useState<string>('01258');
  const [aiConfidence, setAiConfidence] = useState<number>(0.986);
  const [confirmedIndex, setConfirmedIndex] = useState<number>(1258);
  const [correctionReason, setCorrectionReason] = useState<string>('');
  
  // Status states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tariffData, setTariffData] = useState<TariffCalculation | null>(null);
  const [showAbnormalModal, setShowAbnormalModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getRouteMeters(routeId).then((data) => {
      setMeters(data);
      if (data.length > 0) {
        setSelectedMeterId(data[0].id);
      }
    });
  }, [routeId]);

  const selectedMeter = meters.find((m) => m.id === selectedMeterId) || meters[0];

  // Recalculate bill whenever index changes
  useEffect(() => {
    if (selectedMeter) {
      const consumption = Math.max(0, confirmedIndex - selectedMeter.previousIndex);
      api.calculateTariff(consumption).then(setTariffData);
    }
  }, [confirmedIndex, selectedMeter]);

  const handleSelectMeter = (meter: MeterItem) => {
    setSelectedMeterId(meter.id);
    if (meter.currentIndex) {
      setConfirmedIndex(meter.currentIndex);
      setAiSequence(meter.currentIndex.toString().padStart(5, '0'));
    } else {
      // Default sample prediction for unread meters
      setConfirmedIndex(meter.previousIndex + 18);
      setAiSequence((meter.previousIndex + 18).toString().padStart(5, '0'));
    }
    setCorrectionReason('');
  };

  const handleScanAI = async () => {
    setIsScanning(true);
    try {
      // Create sample blob from current image
      const res = await fetch(currentImage);
      const blob = await res.blob();
      const aiRes = await api.predictAI(selectedMeter.id, blob);
      setAiSequence(aiRes.prediction.predictedSequence);
      setConfirmedIndex(aiRes.prediction.numericalValue);
      setAiConfidence(aiRes.prediction.confidence);
      setToastMessage('Đã quét và phân tích xong chỉ số qua YOLO11-seg + CRNN!');
    } catch {
      // Keep optimistic mock result on network fallback
      setAiSequence('01258');
      setConfirmedIndex(1258);
      setAiConfidence(0.986);
      setToastMessage('Đã cập nhật chỉ số nhận diện!');
    } finally {
      setIsScanning(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleUploadImage = async (file: File) => {
    setIsScanning(true);
    const localUrl = URL.createObjectURL(file);
    setCurrentImage(localUrl);
    try {
      const aiRes = await api.predictAI(selectedMeter.id, file);
      setAiSequence(aiRes.prediction.predictedSequence);
      setConfirmedIndex(aiRes.prediction.numericalValue);
      setAiConfidence(aiRes.prediction.confidence);
      setToastMessage('Nhận diện ảnh mới thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi xử lý ảnh');
    } finally {
      setIsScanning(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSubmitReading = async () => {
    if (!selectedMeter) return;
    setIsSubmitting(true);
    try {
      const isMod = confirmedIndex !== Number(aiSequence);
      await api.submitReading({
        meterId: selectedMeter.id,
        billingPeriod: '2025-04',
        confirmedIndex,
        isModified: isMod,
        originalAIValue: aiSequence,
        correctionReason: isMod ? correctionReason : undefined,
        imageUrl: currentImage,
        recordedBy: 'NV-4881'
      });

      // Update local state
      setMeters((prev) =>
        prev.map((m) =>
          m.id === selectedMeter.id
            ? { ...m, currentIndex: confirmedIndex, readingStatus: 'RECORDED' }
            : m
        )
      );

      setToastMessage(`Đã gửi thành công chỉ số ${confirmedIndex} m³ cho khách hàng ${selectedMeter.customerName}!`);

      // Auto-advance to next pending meter
      const currentIndex = meters.findIndex((m) => m.id === selectedMeter.id);
      const nextMeter = meters.slice(currentIndex + 1).find((m) => m.readingStatus === 'PENDING');
      if (nextMeter) {
        handleSelectMeter(nextMeter);
      }
    } catch (err: any) {
      alert(err.message || 'Không thể lưu chỉ số');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleReportAbnormality = async (reportType: string, description: string) => {
    if (!selectedMeter) return;
    await api.reportAbnormality({
      meterId: selectedMeter.id,
      reportType,
      description,
      reportedBy: 'NV-4881'
    });
    setMeters((prev) =>
      prev.map((m) =>
        m.id === selectedMeter.id ? { ...m, readingStatus: 'ABNORMAL', notes: description } : m
      )
    );
    setToastMessage(`Đã lập biên bản sự cố cho đồng hồ ${selectedMeter.meterCode}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredMeters = meters.filter((m) => {
    const matchesSearch =
      m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.meterCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'PENDING') return m.readingStatus === 'PENDING' || m.readingStatus === 'LOCKED';
    if (filterTab === 'RECORDED') return m.readingStatus === 'RECORDED';
    return true;
  });

  const nextPendingMeter = meters.find((m) => m.id !== selectedMeter?.id && m.readingStatus === 'PENDING');

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-sky-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBackToRoutes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chọn tuyến khác</span>
          </button>

          <span className="text-slate-300">/</span>
          <span className="text-sm font-extrabold text-slate-800">
            {routeId === 2 ? 'Tuyến A02 – Phường Đa Kao, Quận 1' : 'Tuyến A01 – Khu phố 1, P. Bến Nghé'}
          </span>

          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
            TRỰC TUYẾN
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <RotateCw className="w-3 h-3" />
            Đồng bộ gần nhất: 1 phút trước
          </span>
        </div>

        <button
          onClick={() => setShowAbnormalModal(true)}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-center transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Báo ca khẩn cấp</span>
        </button>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Route list & meter search (4 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TIẾN ĐỘ KỲ 04/2025
              </span>
              <span className="font-extrabold text-sky-900">72%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-sky-950">18 <span className="text-xs font-bold text-slate-400">/ 25 hộ</span></span>
              <span className="text-[11px] font-semibold text-slate-500">Hoàn tất tuyến</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2 flex">
              <div className="bg-sky-600" style={{ width: '72%' }} />
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm số nhà, mã ĐH, tên KH..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/70 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                filterTab === 'ALL' ? 'bg-sky-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({meters.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                filterTab === 'PENDING' ? 'bg-sky-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa ghi (7)
            </button>
            <button
              onClick={() => setFilterTab('RECORDED')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                filterTab === 'RECORDED' ? 'bg-sky-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã ghi (17)
            </button>
          </div>

          {/* Meter List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredMeters.map((meter) => {
              const isSelected = meter.id === selectedMeter?.id;
              const isRecorded = meter.readingStatus === 'RECORDED';
              const isLocked = meter.readingStatus === 'LOCKED';

              return (
                <div
                  key={meter.id}
                  onClick={() => handleSelectMeter(meter)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50/90 border-sky-400 shadow-sm ring-1 ring-sky-300'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{meter.customerName}</h4>
                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <span className="px-1.5 py-0.5 bg-sky-200 text-sky-900 text-[9px] font-extrabold rounded">
                          ĐANG CHỌN
                        </span>
                      )}
                      {isRecorded ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã ghi
                        </span>
                      ) : isLocked ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Khóa cửa
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-full">
                          Chưa ghi
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{meter.address}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
                    <span>MĐH: <strong className="text-slate-600">{meter.meterCode}</strong></span>
                    {isRecorded ? (
                      <span className="text-emerald-700 font-extrabold">{meter.currentIndex?.toLocaleString('vi-VN')} m³</span>
                    ) : isLocked ? (
                      <span className="text-rose-600 font-semibold">{meter.notes}</span>
                    ) : (
                      <span>Kỳ trước: {meter.previousIndex} m³</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            7 điểm đo còn lại trong ca • <strong>Tự động chuyển tiếp khi lưu</strong>
          </div>
        </div>

        {/* Center Column: Camera viewfinder & Tier breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Customer summary card */}
          {selectedMeter && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 font-extrabold text-base flex items-center justify-center shrink-0">
                {selectedMeter.customerName.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{selectedMeter.customerName}</h3>
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold rounded">
                      {selectedMeter.meterType}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-0.5">{selectedMeter.address}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span># <strong>{selectedMeter.meterCode}</strong></span>
                  <span>Cỡ ĐH: <strong>{selectedMeter.meterSize}</strong></span>
                  <span>Hạn mức: <strong>{selectedMeter.standardTierLimit} m³ (Bậc 1-2)</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Camera Viewfinder Component */}
          <CameraView
            imageSrc={currentImage}
            confidence={aiConfidence}
            isScanning={isScanning}
            onRetake={() => setCurrentImage('https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80')}
            onScanAI={handleScanAI}
            onReportAbnormal={() => setShowAbnormalModal(true)}
            onUploadCustomImage={handleUploadImage}
          />

          {/* Progressive Tier Price Breakdown Component */}
          {selectedMeter && (
            <TierPriceBreakdown
              tariffData={tariffData}
              consumption={Math.max(0, confirmedIndex - selectedMeter.previousIndex)}
            />
          )}
        </div>

        {/* Right Column: AI Result & Submit reading (4 cols) */}
        <div className="lg:col-span-4">
          {selectedMeter && (
            <AIRecognitionCard
              previousIndex={selectedMeter.previousIndex}
              aiPredictedSequence={aiSequence}
              aiConfidence={aiConfidence}
              confirmedIndex={confirmedIndex}
              onChangeConfirmedIndex={setConfirmedIndex}
              correctionReason={correctionReason}
              onChangeCorrectionReason={setCorrectionReason}
              onSubmit={handleSubmitReading}
              isSubmitting={isSubmitting}
              nextCustomerName={nextPendingMeter ? `${nextPendingMeter.customerName} (${nextPendingMeter.address})` : 'Đã hoàn tất toàn tuyến!'}
            />
          )}
        </div>
      </div>

      {/* Abnormality Modal */}
      {selectedMeter && (
        <AbnormalityModal
          isOpen={showAbnormalModal}
          meterId={selectedMeter.id}
          meterCode={selectedMeter.meterCode}
          customerName={selectedMeter.customerName}
          onClose={() => setShowAbnormalModal(false)}
          onSubmit={handleReportAbnormality}
        />
      )}
    </div>
  );
};
