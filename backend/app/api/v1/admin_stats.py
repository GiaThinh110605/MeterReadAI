from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.database import get_db
from app.schemas.admin_stats import AdminDashboardResponse, AdminReportResponse
from app.services.admin_stats_service import AdminStatsService

# Toàn bộ router chỉ dành cho ADMIN
router = APIRouter(
    prefix="/admin",
    tags=["Quản Trị – Tổng Quan & Thống Kê"],
    dependencies=[Depends(require_roles("ADMIN"))],
)


@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    billingPeriod: Optional[str] = Query(None, description="Kỳ ghi số YYYY-MM, mặc định kỳ hiện hành"),
    db: Session = Depends(get_db),
):
    """
    UI 12 – Tổng quan Admin: tiến độ ghi số toàn hệ thống, sản lượng tiêu thụ kỳ này so với kỳ trước,
    doanh thu / công nợ, tỷ lệ AI đọc đúng (không phải sửa), sự cố chờ xử lý, tiến độ từng tuyến.
    """
    return AdminStatsService.get_dashboard(db, billingPeriod)


@router.get("/reports/statistics", response_model=AdminReportResponse)
def get_admin_report(
    fromPeriod: Optional[str] = Query(None, description="Kỳ bắt đầu YYYY-MM, mặc định 6 kỳ gần nhất"),
    toPeriod: Optional[str] = Query(None, description="Kỳ kết thúc YYYY-MM, mặc định kỳ hiện hành"),
    db: Session = Depends(get_db),
):
    """
    UI 18 – Thống kê báo cáo: sản lượng & doanh thu theo tháng, tỷ lệ thu tiền, độ chính xác AI,
    tiêu thụ theo loại khách hàng, thống kê sự cố, top khách hàng tiêu thụ và hiệu suất nhân viên.
    """
    return AdminStatsService.get_report(db, fromPeriod, toPeriod)
