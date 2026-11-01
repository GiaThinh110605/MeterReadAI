from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# ----------------------------- UI 12: Tổng quan Admin -----------------------------
class MeterStatusSummary(BaseModel):
    total: int
    recorded: int
    pending: int
    abnormal: int
    locked: int
    progressPercent: float


class RevenueSummary(BaseModel):
    invoiceCount: int
    totalAmount: float
    paidAmount: float
    unpaidAmount: float
    collectionRate: float  # % số tiền đã thu / tổng phát hành


class AIAccuracySummary(BaseModel):
    totalReadings: int  # Lượt ghi có kết quả AI đi kèm
    acceptedAsIs: int   # Nhân viên giữ nguyên kết quả AI
    corrected: int      # Nhân viên phải sửa (isModified = True)
    accuracyRate: float


class RouteProgressItem(BaseModel):
    routeId: int
    routeCode: str
    routeName: str
    totalMeters: int
    recordedMeters: int
    abnormalMeters: int
    percentComplete: float
    status: str


class RecentAbnormalityItem(BaseModel):
    id: int
    meterCode: str
    customerName: str
    reportType: str
    description: str
    reportedBy: str
    status: str
    reportedAt: datetime


class AdminDashboardResponse(BaseModel):
    billingPeriod: str
    meters: MeterStatusSummary
    totalConsumption: float
    previousPeriodConsumption: float
    consumptionChangePercent: Optional[float]
    revenue: RevenueSummary
    ai: AIAccuracySummary
    pendingAbnormalities: int
    totalCustomers: int
    totalReaders: int
    routes: List[RouteProgressItem]
    recentAbnormalities: List[RecentAbnormalityItem]


# --------------------------- UI 18: Thống kê báo cáo ---------------------------
class MonthlyStatItem(BaseModel):
    period: str
    readingsCount: int
    consumption: float
    invoiceCount: int
    revenue: float
    paidAmount: float
    unpaidAmount: float


class ReportTotals(BaseModel):
    consumption: float
    revenue: float
    paidAmount: float
    unpaidAmount: float
    collectionRate: float
    averageConsumptionPerReading: float


class CategoryStatItem(BaseModel):
    label: str
    count: int
    value: float


class TopConsumerItem(BaseModel):
    meterCode: str
    customerName: str
    meterType: str
    consumption: float


class EmployeePerformanceItem(BaseModel):
    employeeCode: str
    fullName: str
    readings: int
    corrected: int
    correctionRate: float


class AdminReportResponse(BaseModel):
    fromPeriod: str
    toPeriod: str
    monthly: List[MonthlyStatItem]
    totals: ReportTotals
    ai: AIAccuracySummary
    consumptionByMeterType: List[CategoryStatItem]
    abnormalitiesByType: List[CategoryStatItem]
    topConsumers: List[TopConsumerItem]
    employeePerformance: List[EmployeePerformanceItem]
