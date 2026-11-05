from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class UrgentComplaint(BaseModel):
    id: int
    customer_name: str
    meter_code: str
    route_name: str
    issue_type: str
    description: str
    priority: str
    status: str

class AdminOverviewStats(BaseModel):
    total_employees: int
    online_employees: int
    total_routes: int
    assigned_routes: int
    total_invoices_month: int
    issue_percentage: float
    pending_complaints: int
    high_priority_complaints: int
    billing_period: str
    total_revenue_expected: float
    paid_percentage: float
    unpaid_percentage: float
    overdue_percentage: float
    paid_amount: float
    paid_count: int
    unpaid_amount: float
    unpaid_count: int
    overdue_amount: float
    overdue_count: int
    last_sync_time: str
    urgent_complaints: List[UrgentComplaint]

class AdminRouteItem(BaseModel):
    id: int
    route_code: str
    route_name: str
    ward: str
    district: str
    total_meters: int
    recorded_meters: int
    assigned_employee_id: Optional[int] = None
    assigned_employee_name: Optional[str] = None
    assigned_employee_code: Optional[str] = None
    status: str

class AdminRoutesSummary(BaseModel):
    total_routes: int
    active_routes: int
    unassigned_routes: int
    total_customers: int
    recorded_customers: int
    progress_percentage: float
    routes: List[AdminRouteItem]

class CreateRouteRequest(BaseModel):
    route_name: str
    route_code: Optional[str] = None
    ward: str
    district: str = "Quận 1"
    description: Optional[str] = None
    priority_order: int = 1

class RouteAssignRequest(BaseModel):
    route_id: int
    employee_id: int
    billing_period: str = "10/2026"
    notes: Optional[str] = None

class RouteAssignResponse(BaseModel):
    success: bool
    message: str
    route_id: int
    employee_id: int
    route_code: str
    employee_name: str

class AdminEmployeeItem(BaseModel):
    id: int
    employee_code: str
    full_name: str
    email: str
    phone: str
    team_name: str
    assigned_area: str
    assigned_route_code: Optional[str] = None
    assigned_route_name: Optional[str] = None
    assigned_meters: int = 0
    is_active: bool
    status: str

class AdminEmployeesSummary(BaseModel):
    total_staff: int
    active_staff: int
    paused_staff: int
    completion_rate: float
    employees: List[AdminEmployeeItem]

class CreateEmployeeRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str = "123456"
    team_name: Optional[str] = "Tổ Ghi Số Quận 1"
    assigned_area: Optional[str] = "Quận 1, TP. Hồ Chí Minh"
    employee_code: Optional[str] = None

class AdminInvoiceItem(BaseModel):
    id: int
    invoice_code: str
    meter_code: str
    customer_name: str
    address: str
    billing_period: str
    total_consumption: float
    subtotal_water: float
    env_protection_fee: float
    vat_amount: float
    total_amount: float
    payment_status: str
    created_at: str

class AdminInvoicesSummary(BaseModel):
    total_invoices: int
    paid_invoices: int
    unpaid_invoices: int
    overdue_invoices: int
    invoices: List[AdminInvoiceItem]

class CreateInvoiceRequest(BaseModel):
    customer_name: str
    meter_code: str
    address: Optional[str] = "123 Nguyễn Trãi, P. Bến Nghé, Quận 1"
    route_id: Optional[int] = None
    billing_period: str = "09/2026"
    previous_index: float
    current_index: float
    payment_status: str = "UNPAID"

class UpdateInvoiceStatusRequest(BaseModel):
    payment_status: str


class AdminTariffTierItem(BaseModel):
    id: int
    tier_order: int
    tier_name: str
    description: str
    min_volume: float
    max_volume: Optional[float] = None
    unit_price: float
    effective_date: str
    status: str

class AdminPricingData(BaseModel):
    tariff_code: str
    customer_type: str
    vat_percentage: float
    env_fee_percentage: float
    effective_period: str
    synced_meters_count: int
    tiers: List[AdminTariffTierItem]
    approval_doc: str
    surcharge_note: str

class TariffHistoryItem(BaseModel):
    id: int
    decision_number: str
    title: str
    effective_date: str
    tier_summary: str
    changed_by: str
    note: Optional[str] = None
    created_at: str

class UpdateTierPriceRequest(BaseModel):
    unit_price: float

class CreateTariffRequest(BaseModel):
    name: str
    tariff_code: Optional[str] = None
    customer_type: str = "HỘ GIA ĐÌNH SINH HOẠT"
    decision_number: str = "QĐ 412/QĐ-UBND"
    effective_date: str = "01/10/2026"
    note: Optional[str] = None
    tier_1_price: float = 6700.0
    tier_2_price: float = 7000.0
    tier_3_price: float = 8500.0
    tier_4_price: float = 15000.0

class MonthlyConsumptionItem(BaseModel):
    month: str
    volume_thousands: float
    is_current: bool = False

class RouteReportItem(BaseModel):
    route_code: str
    route_name: str
    total_meters: int
    consumption: float
    revenue_issued: float
    revenue_collected: float
    debt: float
    collection_rate: float

class AdminReportsData(BaseModel):
    billing_period: str
    total_consumption: float
    growth_rate: float
    revenue_issued_m: float
    revenue_collected_m: float
    collection_rate: float
    debt_m: float
    debt_due_m: float
    debt_overdue_m: float
    monthly_trend: List[MonthlyConsumptionItem]
    sla_total: int
    sla_completed: int
    sla_pending: int
    sla_rejected: int
    sla_ontime_rate: float
    avg_response_hours: float
    routes: List[RouteReportItem]

class ComplaintListItem(BaseModel):
    id: int
    ticket_code: str
    customer_name: str
    meter_code: str
    issue_type: str
    description: str
    time_ago: str
    status: str
    diff_text: Optional[str] = None
    sub_tag: Optional[str] = None

class ComplaintAuditDetail(BaseModel):
    id: int
    ticket_code: str
    customer_name: str
    customer_address: str
    meter_code: str
    route_name: str
    billing_period: str
    receive_date: str
    customer_quote: str
    customer_photo_url: str
    customer_photo_roi: str
    customer_photo_confidence: float
    customer_photo_reading: float
    customer_photo_time: str
    customer_photo_note: str
    staff_photo_url: str
    staff_photo_roi: str
    staff_photo_confidence: float
    staff_photo_reading: float
    staff_photo_time: str
    staff_photo_staff: str
    staff_photo_note: str
    original_prev_index: float
    original_curr_index: float
    original_consumption: float
    original_amount: float
    actual_prev_index: float
    actual_curr_index: float
    actual_consumption: float
    actual_amount: float
    diff_consumption: float
    diff_amount: float
    status: str

class ComplaintDecisionRequest(BaseModel):
    decision: str
    actual_reading: Optional[float] = None
    notes: Optional[str] = None

class ComplaintStatsSummary(BaseModel):
    total: int
    pending: int
    in_progress: int
    resolved: int
    ai_accuracy_percent: float
    ai_confidence_avg: float
    ai_margin_error: float
