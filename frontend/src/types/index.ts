export interface RouteItem {
  id: number;
  routeCode: string;
  routeName: string;
  description?: string;
  ward: string;
  district: string;
  totalMeters: number;
  recordedMeters: number;
  pendingMeters: number;
  abnormalMeters: number;
  percentComplete: number;
  status: string;
  priority: number;
  lastUpdated?: string;
}

export interface PriorityAlert {
  id: number;
  meterCode: string;
  customerName: string;
  address: string;
  phone?: string;
  issueType: string;
  issueDescription: string;
  routeCode: string;
  actionPrompt: string;
}

export interface AssignedRoutesData {
  shiftProgressPercent: number;
  totalMetersInShift: number;
  recordedMetersInShift: number;
  pendingMetersInShift: number;
  abnormalMetersInShift: number;
  startTime: string;
  estimatedEndTime: string;
  routes: RouteItem[];
  priorityAlerts: PriorityAlert[];
}

export interface MeterItem {
  id: number;
  meterCode: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  meterSize: string;
  meterType: string;
  standardTierLimit: number;
  previousIndex: number;
  currentIndex?: number | null;
  readingStatus: 'PENDING' | 'RECORDED' | 'LOCKED' | 'ABNORMAL';
  isPriority: boolean;
  priorityReason?: string;
  notes?: string;
  imageUrl?: string;
  readingDate?: string;
  recordedBy?: string;
}

export interface PolygonPoint {
  x: number;
  y: number;
}

export interface AIPredictionResponse {
  requestId: string;
  meterId: number;
  meterCode: string;
  previousIndex: number;
  prediction: {
    predictedSequence: string;
    numericalValue: number;
    confidence: number;
    modelVersion: string;
  };
  visualization: {
    originalImageUrl: string;
    croppedImageUrl: string;
    polygon: PolygonPoint[];
    bbox: number[];
    imageWidth?: number;
    imageHeight?: number;
  };
}

export interface TierItem {
  tierOrder: number;
  tierName: string;
  volume: number;
  unitPrice: number;
  amount: number;
}

export interface TariffCalculation {
  consumption: number;
  waterAmount: number;
  envFee: number;
  vatAmount: number;
  totalAmount: number;
  tiers: TierItem[];
}

export interface UserAuthSession {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'READER' | 'ADMIN';
  token?: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface CustomerOverviewData {
  customerName: string;
  customerCode: string;
  meterCode: string;
  meterSerial: string;
  address: string;
  currentBill: {
    period: string;
    amount: number;
    consumption: number;
    dueDate: string;
    status: string;
  };
  stats: {
    consumption: number;
    diffText: string;
    currentIndex: number;
    currentDate: string;
    previousIndex: number;
    previousDate: string;
  };
  chartData: Array<{
    month: string;
    consumption: number | null;
    isCurrent?: boolean;
  }>;
  latestInvoice: {
    period: string;
    amount: number;
    status: string;
  } | null;
  latestPhoto: {
    imageUrl: string;
    readingIndex: number;
    capturedDate: string;
  } | null;
}

export interface CustomerInvoiceItem {
  id: number;
  invoiceCode: string;
  period: string;
  amount: number;
  volume: number;
  dueDate?: string;
  paidDate?: string;
  status: string;
  previousIndex: number;
  currentIndex: number;
  diffVolume: number;
  subtotalWater: number;
  taxAndEnvFee: number;
  recordedBy: string;
  recordedAt: string;
  meterSerial: string;
  photoUrl: string;
  isAutoVerified: boolean;
  tiers: Array<{
    tierOrder: number;
    name: string;
    volume: number;
    unitPrice: number;
    amount: number;
  }>;
}

export interface CustomerComplaintItem {
  id: number;
  ticketCode: string;
  ticketType: string;
  status: string;
  invoiceCode?: string;
  content: string;
  createdAt: string;
  hasImage: boolean;
  resolutionNote?: string;
}



export interface UrgentComplaint {
  id: number;
  customer_name: string;
  meter_code: string;
  route_name: string;
  issue_type: string;
  description: string;
  priority: string;
  status: string;
}

export interface AdminOverviewStats {
  total_employees: number;
  online_employees: number;
  total_routes: number;
  assigned_routes: number;
  total_invoices_month: number;
  issue_percentage: number;
  pending_complaints: number;
  high_priority_complaints: number;
  billing_period: string;
  total_revenue_expected: number;
  paid_percentage: number;
  unpaid_percentage: number;
  overdue_percentage: number;
  paid_amount: number;
  paid_count: number;
  unpaid_amount: number;
  unpaid_count: number;
  overdue_amount: number;
  overdue_count: number;
  last_sync_time: string;
  urgent_complaints: UrgentComplaint[];
}

export interface AdminRouteItem {
  id: number;
  route_code: string;
  route_name: string;
  ward: string;
  district: string;
  total_meters: number;
  recorded_meters: number;
  assigned_employee_id?: number | null;
  assigned_employee_name?: string | null;
  assigned_employee_code?: string | null;
  status: string;
}

export interface AdminRoutesSummary {
  total_routes: number;
  active_routes: number;
  unassigned_routes: number;
  total_customers: number;
  recorded_customers: number;
  progress_percentage: number;
  routes: AdminRouteItem[];
}

export interface AdminEmployeeItem {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  team_name: string;
  assigned_area: string;
  assigned_route_code?: string | null;
  assigned_route_name?: string | null;
  assigned_meters: number;
  is_active: boolean;
  status: string;
}

export interface AdminEmployeesSummary {
  total_staff: number;
  active_staff: number;
  paused_staff: number;
  completion_rate: number;
  employees: AdminEmployeeItem[];
}

export interface AdminInvoiceItem {
  id: number;
  invoice_code: string;
  meter_code: string;
  customer_name: string;
  address: string;
  billing_period: string;
  total_consumption: number;
  subtotal_water: number;
  env_protection_fee: number;
  vat_amount: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

export interface AdminInvoicesSummary {
  total_invoices: number;
  paid_invoices: number;
  unpaid_invoices: number;
  overdue_invoices: number;
  invoices: AdminInvoiceItem[];
}

export interface CreateInvoicePayload {
  customer_name: string;
  meter_code: string;
  address?: string;
  route_id?: number;
  billing_period: string;
  previous_index: number;
  current_index: number;
  payment_status?: string;
}

export interface RouteAssignPayload {
  route_id: number;
  employee_id: number;
  billing_period?: string;
  notes?: string;
}

export interface AdminTariffTierItem {
  id: number;
  tier_order: number;
  tier_name: string;
  description: string;
  min_volume: number;
  max_volume?: number | null;
  unit_price: number;
  effective_date: string;
  status: string;
}

export interface AdminPricingData {
  tariff_code: string;
  customer_type: string;
  vat_percentage: number;
  env_fee_percentage: number;
  effective_period: string;
  synced_meters_count: number;
  tiers: AdminTariffTierItem[];
  approval_doc: string;
  surcharge_note: string;
}

export interface TariffHistoryItem {
  id: number;
  decision_number: string;
  title: string;
  effective_date: string;
  tier_summary: string;
  changed_by: string;
  note?: string | null;
  created_at: string;
}

export interface CreateTariffPayload {
  name: string;
  tariff_code?: string;
  customer_type?: string;
  decision_number: string;
  effective_date: string;
  note?: string;
  tier_1_price: number;
  tier_2_price: number;
  tier_3_price: number;
  tier_4_price: number;
}

export interface MonthlyConsumptionItem {
  month: string;
  volume_thousands: number;
  is_current: boolean;
}

export interface RouteReportItem {
  route_code: string;
  route_name: string;
  total_meters: number;
  consumption: number;
  revenue_issued: number;
  revenue_collected: number;
  debt: number;
  collection_rate: number;
}

export interface AdminReportsData {
  billing_period: string;
  total_consumption: number;
  growth_rate: number;
  revenue_issued_m: number;
  revenue_collected_m: number;
  collection_rate: number;
  debt_m: number;
  debt_due_m: number;
  debt_overdue_m: number;
  monthly_trend: MonthlyConsumptionItem[];
  sla_total: number;
  sla_completed: number;
  sla_pending: number;
  sla_rejected: number;
  sla_ontime_rate: number;
  avg_response_hours: number;
  routes: RouteReportItem[];
}

export interface ComplaintListItem {
  id: number;
  ticket_code: string;
  customer_name: string;
  meter_code: string;
  issue_type: string;
  description: string;
  time_ago: string;
  status: string;
  diff_text?: string | null;
  sub_tag?: string | null;
}

export interface ComplaintAuditDetail {
  id: number;
  ticket_code: string;
  customer_name: string;
  customer_address: string;
  meter_code: string;
  route_name: string;
  billing_period: string;
  receive_date: string;
  customer_quote: string;
  customer_photo_url: string;
  customer_photo_roi: string;
  customer_photo_confidence: number;
  customer_photo_reading: number;
  customer_photo_time: string;
  customer_photo_note: string;
  staff_photo_url: string;
  staff_photo_roi: string;
  staff_photo_confidence: number;
  staff_photo_reading: number;
  staff_photo_time: string;
  staff_photo_staff: string;
  staff_photo_note: string;
  original_prev_index: number;
  original_curr_index: number;
  original_consumption: number;
  original_amount: number;
  actual_prev_index: number;
  actual_curr_index: number;
  actual_consumption: number;
  actual_amount: number;
  diff_consumption: number;
  diff_amount: number;
  status: string;
}

export interface ComplaintStatsSummary {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  ai_accuracy_percent: number;
  ai_confidence_avg: number;
  ai_margin_error: number;
}
