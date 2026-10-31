import { AssignedRoutesData, MeterItem, AIPredictionResponse, TariffCalculation } from '../types';

const API_BASE = '/api/v1';

export const api = {
  async getAssignedRoutes(): Promise<AssignedRoutesData> {
    try {
      const res = await fetch(`${API_BASE}/reader/assigned-routes`);
      if (!res.ok) throw new Error('Failed to fetch assigned routes');
      return await res.json();
    } catch (err) {
      console.warn('API getAssignedRoutes error, using fallback:', err);
      return {
        shiftProgressPercent: 62.2,
        totalMetersInShift: 45,
        recordedMetersInShift: 28,
        pendingMetersInShift: 15,
        abnormalMetersInShift: 2,
        startTime: '07:30 Sáng',
        estimatedEndTime: '16:45 Chiều',
        routes: [
          {
            id: 1,
            routeCode: 'A01',
            routeName: 'Tuyến A01 – Phường Bến Nghé, Quận 1',
            description: 'Trục Nguyễn Du - Nguyễn Trãi',
            ward: 'Phường Bến Nghé',
            district: 'Quận 1',
            totalMeters: 25,
            recordedMeters: 18,
            pendingMeters: 6,
            abnormalMeters: 1,
            percentComplete: 72.0,
            status: 'IN_PROGRESS',
            priority: 1,
            lastUpdated: '10 phút trước'
          },
          {
            id: 2,
            routeCode: 'A02',
            routeName: 'Tuyến A02 – Phường Đa Kao, Quận 1',
            description: 'Trục Đinh Tiên Hoàng - Hoàng Sa',
            ward: 'Phường Đa Kao',
            district: 'Quận 1',
            totalMeters: 20,
            recordedMeters: 10,
            pendingMeters: 9,
            abnormalMeters: 1,
            percentComplete: 50.0,
            status: 'PAUSED',
            priority: 2,
            lastUpdated: '10 phút trước'
          }
        ],
        priorityAlerts: [
          {
            id: 6,
            meterCode: 'DH-BN-0941',
            customerName: 'Lê Hoàng Nam (Nhà sách Ánh Dương)',
            address: '42 Nguyễn Du, P. Bến Nghé (Tuyến A01)',
            phone: '0918.234.xxx',
            issueType: 'Khóa cổng hẹn ca chiều',
            issueDescription: 'Chủ nhà hẹn sau 15:30',
            routeCode: 'A01',
            actionPrompt: 'Ghi lại ngay'
          },
          {
            id: 7,
            meterCode: 'DH-DK-0112',
            customerName: 'Công ty TNHH May Mặc Sài Gòn',
            address: '108 Hoàng Sa, P. Đa Kao (Tuyến A02)',
            phone: '028.3822.xxxx',
            issueType: 'Tiêu thụ tăng vọt (+280%)',
            issueDescription: 'Đọc kỳ này: 342 m³ (Trung bình: 90 m³). Cần kiểm tra rò rỉ sau đồng hồ.',
            routeCode: 'A02',
            actionPrompt: 'Chụp xác minh'
          }
        ]
      };
    }
  },

  async getRouteMeters(routeId: number): Promise<MeterItem[]> {
    try {
      const res = await fetch(`${API_BASE}/reader/routes/${routeId}/meters`);
      if (!res.ok) throw new Error('Failed to fetch meters');
      return await res.json();
    } catch (err) {
      console.warn('API getRouteMeters error, using fallback:', err);
      return [
        {
          id: 1,
          meterCode: 'DH001245',
          customerName: 'Nguyễn Văn An',
          address: '123 Nguyễn Trãi, P. Bến Nghé, Quận 1',
          meterSize: '15mm',
          meterType: 'HỘ GIA ĐÌNH SINH HOẠT',
          standardTierLimit: 20.0,
          previousIndex: 1240.0,
          readingStatus: 'PENDING',
          isPriority: false
        },
        {
          id: 2,
          meterCode: 'DH001246',
          customerName: 'Trần Văn Bình',
          address: '125 Nguyễn Trãi',
          meterSize: '15mm',
          meterType: 'HỘ GIA ĐÌNH SINH HOẠT',
          standardTierLimit: 20.0,
          previousIndex: 1240.0,
          currentIndex: 1258.0,
          readingStatus: 'RECORDED',
          isPriority: false
        },
        {
          id: 3,
          meterCode: 'DH001247',
          customerName: 'Lê Văn Nam',
          address: '127 Nguyễn Trãi',
          meterSize: '15mm',
          meterType: 'HỘ GIA ĐÌNH SINH HOẠT',
          standardTierLimit: 20.0,
          previousIndex: 890.0,
          readingStatus: 'LOCKED',
          isPriority: false,
          notes: 'Báo ngày 14/04'
        },
        {
          id: 4,
          meterCode: 'DH001248',
          customerName: 'Hoàng Thị Mai',
          address: '129 Nguyễn Trãi',
          meterSize: '15mm',
          meterType: 'HỘ GIA ĐÌNH SINH HOẠT',
          standardTierLimit: 20.0,
          previousIndex: 84.0,
          readingStatus: 'PENDING',
          isPriority: false
        },
        {
          id: 5,
          meterCode: 'DH001249',
          customerName: 'Phạm Đức Thắng',
          address: '131 Nguyễn Trãi',
          meterSize: '15mm',
          meterType: 'HỘ GIA ĐÌNH SINH HOẠT',
          standardTierLimit: 20.0,
          previousIndex: 312.0,
          readingStatus: 'PENDING',
          isPriority: false
        }
      ];
    }
  },

  async predictAI(meterId: number, file: Blob): Promise<AIPredictionResponse> {
    const formData = new FormData();
    formData.append('file', file, 'meter_capture.jpg');
    formData.append('meterId', meterId.toString());

    const res = await fetch(`${API_BASE}/ai/predict`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Lỗi nhận diện AI' }));
      throw new Error(err.detail || 'Không thể nhận diện ảnh đồng hồ');
    }
    return await res.json();
  },

  async submitReading(data: {
    meterId: number;
    billingPeriod: string;
    confirmedIndex: number;
    isModified: boolean;
    originalAIValue?: string;
    correctionReason?: string;
    imageUrl?: string;
    recordedBy?: string;
  }) {
    const res = await fetch(`${API_BASE}/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Lỗi ghi chỉ số' }));
      throw new Error(err.detail || 'Lỗi khi gửi chỉ số đồng hồ');
    }
    return await res.json();
  },

  async reportAbnormality(data: {
    meterId: number;
    reportType: string;
    description: string;
    reportedBy?: string;
  }) {
    const res = await fetch(`${API_BASE}/readings/abnormalities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Lỗi báo sự cố' }));
      throw new Error(err.detail || 'Lỗi khi báo cáo sự cố');
    }
    return await res.json();
  },

  async calculateTariff(consumption: number): Promise<TariffCalculation> {
    try {
      const res = await fetch(`${API_BASE}/tariffs/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consumption })
      });
      if (!res.ok) throw new Error('Failed to calculate tariff');
      return await res.json();
    } catch {
      // Local calculation fallback
      const vol1 = Math.min(10, Math.max(0, consumption));
      const vol2 = Math.min(10, Math.max(0, consumption - 10));
      const vol3 = Math.max(0, consumption - 20);
      const subtotal = vol1 * 6700 + vol2 * 7000 + vol3 * 8500;
      const env = Math.round(subtotal * 0.1);
      const vat = Math.round((subtotal + env) * 0.05);
      return {
        consumption,
        waterAmount: subtotal,
        envFee: env,
        vatAmount: vat,
        totalAmount: subtotal + env + vat,
        tiers: [
          { tierOrder: 1, tierName: 'Bậc 1 (≤10 m³)', volume: vol1, unitPrice: 6700, amount: vol1 * 6700 },
          { tierOrder: 2, tierName: 'Bậc 2 (10-20 m³)', volume: vol2, unitPrice: 7000, amount: vol2 * 7000 },
          { tierOrder: 3, tierName: 'Bậc 3 (>20 m³)', volume: vol3, unitPrice: 8500, amount: vol3 * 8500 }
        ]
      };
    }
  }
};
