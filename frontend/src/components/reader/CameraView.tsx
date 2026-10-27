import React, { useRef, useState } from 'react';
import { Camera, RefreshCw, AlertTriangle, Scan, UploadCloud } from 'lucide-react';

interface CameraViewProps {
  imageSrc: string;
  confidence: number;
  isScanning: boolean;
  onRetake: () => void;
  onScanAI: () => void;
  onReportAbnormal: () => void;
  onUploadCustomImage: (file: File) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  imageSrc,
  confidence,
  isScanning,
  onRetake,
  onScanAI,
  onReportAbnormal,
  onUploadCustomImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomImage(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Hình ảnh hiện trường</h3>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
            Trực tiếp từ camera
          </span>
        </div>

        {/* Viewfinder Frame */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center border border-slate-200">
          <img
            src={imageSrc}
            alt="Mặt số đồng hồ nước"
            className="w-full h-full object-cover"
          />

          {/* AI Bounding Box Overlay */}
          <div className="absolute inset-x-[20%] inset-y-[32%] border-2 border-dashed border-sky-400 bg-sky-500/10 rounded-lg pointer-events-none flex flex-col justify-between p-2">
            <div className="flex items-center justify-between">
              <span className="bg-sky-600/90 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
                OCR DIAL BOX #01
              </span>
              <span className="bg-emerald-600/90 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow">
                {(confidence * 100).toFixed(1)}% CONF
              </span>
            </div>

            {isScanning && (
              <div className="absolute inset-0 bg-sky-400/20 flex items-center justify-center">
                <div className="h-0.5 w-full bg-sky-300 shadow-[0_0_8px_#38bdf8] animate-pulse"></div>
              </div>
            )}
          </div>

          {/* HUD Metadata Overlay */}
          <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <span>14/04/2025 09:42:18</span>
            <span>10.7769° N, 106.7009° E</span>
          </div>
        </div>

        {/* Action Buttons row 1 */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Chụp lại / Đổi ảnh</span>
          </button>

          <button
            onClick={onScanAI}
            disabled={isScanning}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Scan className={`w-4 h-4 text-sky-600 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Đang phân tích...' : 'Quét lại AI'}</span>
          </button>
        </div>

        {/* Action Button: Báo bất thường */}
        <button
          onClick={onReportAbnormal}
          className="w-full mt-3 py-2 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Báo bất thường mặt số / Đứt niêm chì</span>
        </button>
      </div>
    </div>
  );
};
