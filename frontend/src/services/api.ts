import {
  AssignedRoutesData,
  MeterItem,
  AIPredictionResponse,
  TariffCalculation,
  LoginFormData,
  RegisterFormData,
  UserAuthSession,
  CustomerOverviewData,
  CustomerInvoiceItem,
  CustomerComplaintItem,
  AdminOverviewStats,
  AdminRoutesSummary,
  AdminRouteItem,
  AdminEmployeesSummary,
  AdminEmployeeItem,
  AdminInvoicesSummary,
  AdminInvoiceItem,
  CreateInvoicePayload,
  RouteAssignPayload,
  AdminPricingData,
  TariffHistoryItem,
  CreateTariffPayload,
  AdminReportsData,
  ComplaintListItem,
  ComplaintAuditDetail,
  ComplaintStatsSummary,
} from '../types';


const API_BASE = '/api/v1';

export const api = {
  async login(formData: LoginFormData): Promise<UserAuthSession> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Đăng nhập không thành công');
    }
    return await res.json();
  },

  async register(formData: RegisterFormData): Promise<UserAuthSession> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Đăng ký tài khoản không thành công');
    }
    return await res.json();
  },

  async getAssignedRoutes(): Promise<AssignedRoutesData> {
    const res = await fetch(`${API_BASE}/reader/assigned-routes`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách tuyến đọc');
    }
    return await res.json();
  },

  async getRouteMeters(routeId: number): Promise<MeterItem[]> {
    const res = await fetch(`${API_BASE}/reader/routes/${routeId}/meters`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách đồng hồ');
    }
    return await res.json();
  },

  async predictAI(meterId?: number, file?: Blob): Promise<AIPredictionResponse> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file, 'meter_capture.jpg');
    }
    if (meterId !== undefined && meterId !== null) {
      formData.append('meterId', meterId.toString());
    }

    const res = await fetch(`${API_BASE}/ai/predict`, {
      method: 'POST',
      body: formData,
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
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Lỗi báo sự cố' }));
      throw new Error(err.detail || 'Lỗi khi báo cáo sự cố');
    }
    return await res.json();
  },

  async calculateTariff(consumption: number): Promise<TariffCalculation> {
    const res = await fetch(`${API_BASE}/tariffs/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consumption }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tính tiền nước');
    }
    return await res.json();
  },

  async getCustomerOverview(): Promise<CustomerOverviewData> {
    const res = await fetch(`${API_BASE}/customer/overview`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải tổng quan khách hàng');
    }
    return await res.json();
  },

  async getCustomerInvoices(): Promise<CustomerInvoiceItem[]> {
    const res = await fetch(`${API_BASE}/customer/invoices`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách hóa đơn');
    }
    return await res.json();
  },

  async payInvoice(invoiceId: number) {
    const res = await fetch(`${API_BASE}/customer/invoices/${invoiceId}/pay`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Thanh toán thất bại');
    }
    return await res.json();
  },

  async getCustomerComplaints(): Promise<CustomerComplaintItem[]> {
    const res = await fetch(`${API_BASE}/customer/complaints`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách khiếu nại');
    }
    return await res.json();
  },

  async submitComplaint(data: {
    ticketType: string;
    invoiceCode?: string;
    content: string;
    imageUrl?: string;
  }): Promise<CustomerComplaintItem> {
    const res = await fetch(`${API_BASE}/customer/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể gửi khiếu nại');
    }
    return await res.json();
  },

  async getAdminOverview(): Promise<AdminOverviewStats> {
    const res = await fetch(`${API_BASE}/admin/overview`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải tổng quan quản trị');
    }
    return await res.json();
  },

  async getAdminRoutes(): Promise<AdminRoutesSummary> {
    const res = await fetch(`${API_BASE}/admin/routes`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách tuyến');
    }
    return await res.json();
  },

  async assignAdminRoute(payload: RouteAssignPayload) {
    const res = await fetch(`${API_BASE}/admin/routes/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Phân công tuyến không thành công');
    }
    return await res.json();
  },

  async createAdminRoute(data: {
    route_name: string;
    route_code?: string;
    ward: string;
    district?: string;
    description?: string;
    priority_order?: number;
  }): Promise<AdminRouteItem> {
    const res = await fetch(`${API_BASE}/admin/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Tạo tuyến đường thất bại');
    }
    return await res.json();
  },

  async deleteAdminRoute(routeId: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/routes/${routeId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Xóa tuyến đường thất bại');
    }
    return await res.json();
  },

  async getAdminEmployees(): Promise<AdminEmployeesSummary> {
    const res = await fetch(`${API_BASE}/admin/employees`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách nhân viên');
    }
    return await res.json();
  },

  async createAdminEmployee(data: {
    full_name: string;
    email: string;
    phone: string;
    password?: string;
    employee_code?: string;
    team_name?: string;
    assigned_area?: string;
  }): Promise<AdminEmployeeItem> {
    const res = await fetch(`${API_BASE}/admin/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Thêm nhân viên thất bại');
    }
    return await res.json();
  },

  async deleteAdminEmployee(employeeId: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/employees/${employeeId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Xóa nhân viên thất bại');
    }
    return await res.json();
  },

  async toggleEmployeeStatus(employeeId: number): Promise<{ success: boolean; is_active: boolean }> {
    const res = await fetch(`${API_BASE}/admin/employees/${employeeId}/toggle-status`, {
      method: 'PUT',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Cập nhật trạng thái thất bại');
    }
    return await res.json();
  },

  async getAdminInvoices(params?: { status?: string; billing_period?: string; search?: string }): Promise<AdminInvoicesSummary> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.billing_period) query.append('billing_period', params.billing_period);
    if (params?.search) query.append('search', params.search);

    const url = `${API_BASE}/admin/invoices${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách hóa đơn');
    }
    return await res.json();
  },

  async createAdminInvoice(payload: CreateInvoicePayload): Promise<AdminInvoiceItem> {
    const res = await fetch(`${API_BASE}/admin/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể lập hóa đơn mới');
    }
    return await res.json();
  },

  async updateInvoiceStatus(invoiceId: number, payment_status: string) {
    const res = await fetch(`${API_BASE}/admin/invoices/${invoiceId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể cập nhật trạng thái hóa đơn');
    }
    return await res.json();
  },

  async deleteAdminInvoice(invoiceId: number) {
    const res = await fetch(`${API_BASE}/admin/invoices/${invoiceId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể xóa hóa đơn');
    }
    return await res.json();
  },

  getExportInvoicesUrl(params?: { status?: string; billing_period?: string; search?: string }): string {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.billing_period) query.append('billing_period', params.billing_period);
    if (params?.search) query.append('search', params.search);
    return `${API_BASE}/admin/invoices/export${query.toString() ? `?${query.toString()}` : ''}`;
  },

  async resolveAdminComplaint(complaintId: number) {
    const res = await fetch(`${API_BASE}/admin/complaints/${complaintId}/resolve`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể xử lý khiếu nại');
    }
    return await res.json();
  },

  async getAdminPricing(): Promise<AdminPricingData> {
    const res = await fetch(`${API_BASE}/admin/pricing`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải biểu giá');
    }
    return await res.json();
  },

  async getPricingHistory(): Promise<TariffHistoryItem[]> {
    const res = await fetch(`${API_BASE}/admin/pricing/history`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải lịch sử biểu giá');
    }
    return await res.json();
  },

  async createAdminTariff(payload: CreateTariffPayload): Promise<AdminPricingData> {
    const res = await fetch(`${API_BASE}/admin/pricing/tariffs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tạo biểu giá mới');
    }
    return await res.json();
  },

  async updateTierPrice(tierId: number, unit_price: number): Promise<{ success: boolean; message: string; unit_price: number }> {
    const res = await fetch(`${API_BASE}/admin/pricing/tiers/${tierId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit_price }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể cập nhật đơn giá');
    }
    return await res.json();
  },

  async getAdminReports(period?: string): Promise<AdminReportsData> {
    const url = `${API_BASE}/admin/reports${period ? `?billing_period=${encodeURIComponent(period)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải báo cáo thống kê');
    }
    return await res.json();
  },

  getExportReportsUrl(period?: string): string {
    return `${API_BASE}/admin/reports/export${period ? `?billing_period=${encodeURIComponent(period)}` : ''}`;
  },

  async getAdminComplaints(status?: string): Promise<ComplaintListItem[]> {
    const url = `${API_BASE}/admin/complaints${status ? `?status=${encodeURIComponent(status)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải danh sách khiếu nại');
    }
    return await res.json();
  },

  async getAdminComplaintStats(): Promise<ComplaintStatsSummary> {
    const res = await fetch(`${API_BASE}/admin/complaints/stats`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải thống kê khiếu nại');
    }
    return await res.json();
  },

  async getAdminComplaintDetail(id: number): Promise<ComplaintAuditDetail> {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/detail`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Không thể tải chi tiết khiếu nại');
    }
    return await res.json();
  },

  async makeComplaintDecision(id: number, payload: { decision: string; actual_reading?: number; notes?: string }) {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Thao tác quyết định thất bại');
    }
    return await res.json();
  },
};
