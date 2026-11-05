import React, { useRef } from 'react';
import { Camera, AlertTriangle, Scan, UploadCloud } from 'lucide-react';

interface CameraViewProps {
  imageSrc: string;
  confidence: number;
  detectedSequence?: string;
  isScanning: boolean;
  visualization?: {
    bbox?: number[];
    polygon?: { x: number; y: number }[];
    imageWidth?: number;
    imageHeight?: number;
  } | null;
  onRetake: () => void;
  onScanAI: () => void;
  onReportAbnormal: () => void;
  onUploadCustomImage: (file: File) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  imageSrc,
  confidence,
  detectedSequence,
  isScanning,
  visualization,
  onScanAI,
  onReportAbnormal,
  onUploadCustomImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';
      onUploadCustomImage(file);
    }
  };

  const bbox = visualization?.bbox;
  const polygon = visualization?.polygon;
  const hasDetection =
    confidence > 0 &&
    Boolean(visualization && bbox && bbox.length === 4);

  const imgW = visualization?.imageWidth || 1000;
  const imgH = visualization?.imageHeight || 1000;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Hình ảnh hiện trường</h3>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
            Trực tiếp từ camera
          </span>
        </div>

        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center border border-slate-200">
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt="Mặt số đồng hồ nước"
                className="w-full h-full object-contain"
              />

              {hasDetection && bbox && bbox.length === 4 && (
                <>
                  <svg
                    viewBox={`0 0 ${imgW} ${imgH}`}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {polygon && polygon.length >= 3 ? (
                      <polygon
                        points={polygon.map((p) => `${p.x},${p.y}`).join(' ')}
                        fill="rgba(14, 165, 233, 0.18)"
                        stroke="#0284c7"
                        strokeWidth={Math.max(2, Math.round(imgW * 0.004))}
                        strokeDasharray="8 4"
                      />
                    ) : (
                      <rect
                        x={bbox[0]}
                        y={bbox[1]}
                        width={bbox[2] - bbox[0]}
                        height={bbox[3] - bbox[1]}
                        fill="rgba(14, 165, 233, 0.18)"
                        stroke="#0284c7"
                        strokeWidth={Math.max(2, Math.round(imgW * 0.004))}
                        rx={6}
                      />
                    )}
                  </svg>

                  {detectedSequence && (
                    <div
                      className="absolute pointer-events-none flex items-center"
                      style={{
                        left: `${Math.max(4, Math.min(80, (bbox[0] / imgW) * 100))}%`,
                        top: `${Math.max(4, Math.min(85, (bbox[1] / imgH) * 100 - 6))}%`,
                      }}
                    >
                      <span className="bg-sky-950/90 border border-sky-400 backdrop-blur-sm text-sky-200 font-mono text-xs font-black px-2 py-0.5 rounded-lg shadow-lg tracking-wider">
                        {detectedSequence}
                      </span>
                    </div>
                  )}
                </>
              )}

              {isScanning && (
                <div className="absolute inset-0 bg-sky-500/20 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none">
                  <div className="h-1 w-3/4 bg-sky-300 shadow-[0_0_12px_#38bdf8] rounded-full animate-pulse mb-3"></div>
                  <span className="text-white text-xs font-bold bg-slate-900/80 px-3 py-1 rounded-full">
                    Đang phân tích hình ảnh...
                  </span>
                </div>
              )}

              {!isScanning && confidence === 0 && (
                <div className="absolute top-3 inset-x-3 bg-amber-500/95 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl text-center shadow-lg pointer-events-none">
                  Không tìm thấy mặt số hoặc độ tin cậy thấp. Vui lòng căn góc chụp hoặc nhập tay.
                </div>
              )}

              <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[10px] font-semibold text-white/90 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg pointer-events-none">
                <span>{new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</span>
                <span>10.7769° N, 106.7009° E</span>
              </div>
            </>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-900/80 transition-colors w-full h-full"
            >
              <Camera className="w-12 h-12 text-slate-500 mb-2 stroke-1" />
              <p className="text-sm font-semibold text-slate-300">Nhấn để chụp hoặc tải ảnh đồng hồ</p>
              <p className="text-xs text-slate-500 mt-1">YOLO11-seg sẽ phân tích mặt số tự động</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
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
            disabled={isScanning || !imageSrc}
            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Scan className={`w-4 h-4 text-sky-600 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Đang phân tích...' : 'Quét lại AI'}</span>
          </button>
        </div>

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
