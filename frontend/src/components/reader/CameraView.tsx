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
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={Math.max(2, Math.round(imgW * 0.0035))}
                        strokeDasharray="8 4"
                      />
                    ) : (
                      <rect
                        x={bbox[0]}
                        y={bbox[1]}
                        width={bbox[2] - bbox[0]}
                        height={bbox[3] - bbox[1]}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={Math.max(2, Math.round(imgW * 0.0035))}
                        rx={6}
                      />
                    )}
                  </svg>

                  {/* Hiển thị số nhận diện ở góc trên khung ảnh (HUD Badge), tuyệt đối KHÔNG đè lên vùng mặt số */}
                  {detectedSequence && (
                    <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-2 bg-slate-900/85 border border-sky-400/60 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300">AI Nhận diện:</span>
                      <span className="font-mono text-sm font-black text-sky-300 tracking-wider">
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
            className="py-3 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs sm:text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all min-h-[44px]"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>Chụp / Đổi ảnh</span>
          </button>

          <button
            onClick={onScanAI}
            disabled={isScanning || !imageSrc}
            className="py-3 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 min-h-[44px]"
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
