const vnd = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

export const formatVND = (value: number) => `${vnd.format(value)} đ`;
export const formatNumber = (value: number) => num.format(value);

/** Rút gọn tiền: 12.345.678 -> "12,3 tr" (dùng cho nhãn biểu đồ). */
export const formatCompactVND = (value: number) => {
  if (value >= 1_000_000_000) return `${num.format(value / 1_000_000_000)} tỷ`;
  if (value >= 1_000_000) return `${num.format(value / 1_000_000)} tr`;
  if (value >= 1_000) return `${num.format(value / 1_000)} k`;
  return vnd.format(value);
};

/** "2025-04" -> "T04/2025" */
export const formatPeriod = (period: string) => {
  const [year, month] = period.split('-');
  return `T${month}/${year}`;
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const ABNORMALITY_LABELS: Record<string, string> = {
  LOCKED_DOOR: 'Khóa cửa / không tiếp cận',
  BROKEN_GLASS: 'Vỡ / mờ mặt kính',
  BROKEN_SEAL: 'Đứt niêm chì',
  NEGATIVE_CONSUMPTION: 'Chỉ số giảm bất thường',
  LEAK_SUSPECTED: 'Nghi rò rỉ',
  OTHER: 'Khác',
};

export const ROUTE_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'Đang ghi',
  PAUSED: 'Tạm dừng',
  COMPLETED: 'Hoàn thành',
};
