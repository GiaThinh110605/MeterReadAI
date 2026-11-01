import re
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.meter import WaterMeter
from app.models.reading import Abnormality, MeterReading
from app.models.route import Route, RouteAssignment
from app.models.tariff import Invoice
from app.models.user import Employee, User
from app.schemas.admin_stats import (
    AdminDashboardResponse,
    AdminReportResponse,
    AIAccuracySummary,
    CategoryStatItem,
    EmployeePerformanceItem,
    MeterStatusSummary,
    MonthlyStatItem,
    RecentAbnormalityItem,
    ReportTotals,
    RevenueSummary,
    RouteProgressItem,
    TopConsumerItem,
)

PERIOD_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
DEFAULT_PERIOD = "2025-04"
MAX_REPORT_MONTHS = 24


def _pct(part: float, whole: float) -> float:
    return round(part / whole * 100, 1) if whole else 0.0


def validate_period(period: str, field: str = "billingPeriod") -> str:
    if not PERIOD_PATTERN.match(period):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{field} phải có dạng YYYY-MM (ví dụ 2025-04)",
        )
    return period


def shift_period(period: str, months: int) -> str:
    year, month = map(int, period.split("-"))
    index = year * 12 + (month - 1) + months
    return f"{index // 12:04d}-{index % 12 + 1:02d}"


def period_range(from_period: str, to_period: str) -> list[str]:
    periods = [from_period]
    while periods[-1] != to_period:
        periods.append(shift_period(periods[-1], 1))
    return periods


def period_bounds(from_period: str, to_period: str) -> tuple[datetime, datetime]:
    """Khoảng thời gian [đầu tháng from, đầu tháng sau to) để lọc các bảng không có cột kỳ."""
    start = datetime.strptime(from_period, "%Y-%m")
    end = datetime.strptime(shift_period(to_period, 1), "%Y-%m")
    return start, end


class AdminStatsService:

    @staticmethod
    def current_period(db: Session) -> str:
        """Kỳ ghi số hiện hành = kỳ phân công tuyến mới nhất (mặc định 2025-04)."""
        latest = db.query(func.max(RouteAssignment.billing_period)).scalar()
        return latest or DEFAULT_PERIOD

    @staticmethod
    def _ai_summary(db: Session, periods: list[str]) -> AIAccuracySummary:
        total, corrected = (
            db.query(
                func.count(MeterReading.id),
                func.coalesce(func.sum(case((MeterReading.is_modified.is_(True), 1), else_=0)), 0),
            )
            .filter(
                MeterReading.billing_period.in_(periods),
                MeterReading.original_ai_value.is_not(None),
            )
            .one()
        )
        accepted = total - corrected
        return AIAccuracySummary(
            totalReadings=total,
            acceptedAsIs=accepted,
            corrected=corrected,
            accuracyRate=_pct(accepted, total),
        )

    @staticmethod
    def _revenue(db: Session, periods: list[str]) -> RevenueSummary:
        count, total, paid = (
            db.query(
                func.count(Invoice.id),
                func.coalesce(func.sum(Invoice.total_amount), 0.0),
                func.coalesce(
                    func.sum(case((Invoice.payment_status == "PAID", Invoice.total_amount), else_=0.0)), 0.0
                ),
            )
            .filter(Invoice.billing_period.in_(periods))
            .one()
        )
        return RevenueSummary(
            invoiceCount=count,
            totalAmount=round(total, 0),
            paidAmount=round(paid, 0),
            unpaidAmount=round(total - paid, 0),
            collectionRate=_pct(paid, total),
        )

    @staticmethod
    def _consumption(db: Session, period: str) -> float:
        value = (
            db.query(func.coalesce(func.sum(MeterReading.consumption), 0.0))
            .filter(MeterReading.billing_period == period)
            .scalar()
        )
        return round(value, 2)

    # ------------------------------------------------------------------ UI 12
    @classmethod
    def get_dashboard(cls, db: Session, billing_period: Optional[str] = None) -> AdminDashboardResponse:
        period = validate_period(billing_period) if billing_period else cls.current_period(db)

        status_counts = dict(
            db.query(WaterMeter.reading_status, func.count(WaterMeter.id))
            .group_by(WaterMeter.reading_status)
            .all()
        )
        total_meters = sum(status_counts.values())
        recorded = status_counts.get("RECORDED", 0)
        abnormal = status_counts.get("ABNORMAL", 0)
        locked = status_counts.get("LOCKED", 0)
        meters = MeterStatusSummary(
            total=total_meters,
            recorded=recorded,
            pending=total_meters - recorded - abnormal - locked,
            abnormal=abnormal,
            locked=locked,
            progressPercent=_pct(recorded, total_meters),
        )

        consumption = cls._consumption(db, period)
        previous = cls._consumption(db, shift_period(period, -1))
        change = round((consumption - previous) / previous * 100, 1) if previous else None

        routes = []
        route_rows = (
            db.query(
                Route,
                func.count(WaterMeter.id),
                func.coalesce(func.sum(case((WaterMeter.reading_status == "RECORDED", 1), else_=0)), 0),
                func.coalesce(
                    func.sum(case((WaterMeter.reading_status.in_(["ABNORMAL", "LOCKED"]), 1), else_=0)), 0
                ),
            )
            .outerjoin(WaterMeter, WaterMeter.route_id == Route.id)
            .group_by(Route.id)
            .order_by(Route.priority_order, Route.route_code)
            .all()
        )
        for route, total, rec, abn in route_rows:
            routes.append(
                RouteProgressItem(
                    routeId=route.id,
                    routeCode=route.route_code,
                    routeName=route.route_name,
                    totalMeters=total,
                    recordedMeters=rec,
                    abnormalMeters=abn,
                    percentComplete=_pct(rec, total),
                    status=route.status,
                )
            )

        recent = (
            db.query(Abnormality, WaterMeter)
            .join(WaterMeter, WaterMeter.id == Abnormality.meter_id)
            .order_by(Abnormality.reported_at.desc(), Abnormality.id.desc())
            .limit(5)
            .all()
        )

        role_counts = dict(db.query(User.role, func.count(User.id)).group_by(User.role).all())

        return AdminDashboardResponse(
            billingPeriod=period,
            meters=meters,
            totalConsumption=consumption,
            previousPeriodConsumption=previous,
            consumptionChangePercent=change,
            revenue=cls._revenue(db, [period]),
            ai=cls._ai_summary(db, [period]),
            pendingAbnormalities=db.query(Abnormality).filter(Abnormality.status == "PENDING").count(),
            totalCustomers=role_counts.get("CUSTOMER", 0),
            totalReaders=role_counts.get("READER", 0),
            routes=routes,
            recentAbnormalities=[
                RecentAbnormalityItem(
                    id=ab.id,
                    meterCode=meter.meter_code,
                    customerName=meter.customer_name,
                    reportType=ab.report_type,
                    description=ab.description,
                    reportedBy=ab.reported_by,
                    status=ab.status,
                    reportedAt=ab.reported_at,
                )
                for ab, meter in recent
            ],
        )

    # ------------------------------------------------------------------ UI 18
    @classmethod
    def get_report(
        cls, db: Session, from_period: Optional[str] = None, to_period: Optional[str] = None
    ) -> AdminReportResponse:
        to_p = validate_period(to_period, "toPeriod") if to_period else cls.current_period(db)
        from_p = validate_period(from_period, "fromPeriod") if from_period else shift_period(to_p, -5)
        if from_p > to_p:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="fromPeriod phải nhỏ hơn hoặc bằng toPeriod",
            )
        periods = period_range(from_p, to_p)
        if len(periods) > MAX_REPORT_MONTHS:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Khoảng báo cáo tối đa {MAX_REPORT_MONTHS} tháng",
            )

        reading_rows = dict(
            (p, (c, s))
            for p, c, s in db.query(
                MeterReading.billing_period,
                func.count(MeterReading.id),
                func.coalesce(func.sum(MeterReading.consumption), 0.0),
            )
            .filter(MeterReading.billing_period.in_(periods))
            .group_by(MeterReading.billing_period)
            .all()
        )
        invoice_rows = dict(
            (p, (c, t, paid))
            for p, c, t, paid in db.query(
                Invoice.billing_period,
                func.count(Invoice.id),
                func.coalesce(func.sum(Invoice.total_amount), 0.0),
                func.coalesce(
                    func.sum(case((Invoice.payment_status == "PAID", Invoice.total_amount), else_=0.0)), 0.0
                ),
            )
            .filter(Invoice.billing_period.in_(periods))
            .group_by(Invoice.billing_period)
            .all()
        )

        monthly = []
        for p in periods:
            r_count, r_sum = reading_rows.get(p, (0, 0.0))
            i_count, i_total, i_paid = invoice_rows.get(p, (0, 0.0, 0.0))
            monthly.append(
                MonthlyStatItem(
                    period=p,
                    readingsCount=r_count,
                    consumption=round(r_sum, 2),
                    invoiceCount=i_count,
                    revenue=round(i_total, 0),
                    paidAmount=round(i_paid, 0),
                    unpaidAmount=round(i_total - i_paid, 0),
                )
            )

        total_consumption = sum(m.consumption for m in monthly)
        total_readings = sum(m.readingsCount for m in monthly)
        revenue = sum(m.revenue for m in monthly)
        paid = sum(m.paidAmount for m in monthly)
        totals = ReportTotals(
            consumption=round(total_consumption, 2),
            revenue=revenue,
            paidAmount=paid,
            unpaidAmount=revenue - paid,
            collectionRate=_pct(paid, revenue),
            averageConsumptionPerReading=round(total_consumption / total_readings, 2) if total_readings else 0.0,
        )

        by_type = (
            db.query(
                WaterMeter.meter_type,
                func.count(MeterReading.id),
                func.coalesce(func.sum(MeterReading.consumption), 0.0),
            )
            .join(MeterReading, MeterReading.meter_id == WaterMeter.id)
            .filter(MeterReading.billing_period.in_(periods))
            .group_by(WaterMeter.meter_type)
            .order_by(func.sum(MeterReading.consumption).desc())
            .all()
        )

        start, end = period_bounds(from_p, to_p)
        abnormal_types = (
            db.query(Abnormality.report_type, func.count(Abnormality.id))
            .filter(Abnormality.reported_at >= start, Abnormality.reported_at < end)
            .group_by(Abnormality.report_type)
            .order_by(func.count(Abnormality.id).desc())
            .all()
        )

        top = (
            db.query(
                WaterMeter.meter_code,
                WaterMeter.customer_name,
                WaterMeter.meter_type,
                func.sum(MeterReading.consumption).label("total"),
            )
            .join(MeterReading, MeterReading.meter_id == WaterMeter.id)
            .filter(MeterReading.billing_period.in_(periods))
            .group_by(WaterMeter.id)
            .order_by(func.sum(MeterReading.consumption).desc())
            .limit(5)
            .all()
        )

        employee_names = dict(
            db.query(Employee.employee_code, User.full_name).join(User, User.id == Employee.user_id).all()
        )
        performance = (
            db.query(
                MeterReading.recorded_by,
                func.count(MeterReading.id),
                func.coalesce(func.sum(case((MeterReading.is_modified.is_(True), 1), else_=0)), 0),
            )
            .filter(MeterReading.billing_period.in_(periods))
            .group_by(MeterReading.recorded_by)
            .order_by(func.count(MeterReading.id).desc())
            .all()
        )

        return AdminReportResponse(
            fromPeriod=from_p,
            toPeriod=to_p,
            monthly=monthly,
            totals=totals,
            ai=cls._ai_summary(db, periods),
            consumptionByMeterType=[
                CategoryStatItem(label=t, count=c, value=round(v, 2)) for t, c, v in by_type
            ],
            abnormalitiesByType=[
                CategoryStatItem(label=t, count=c, value=float(c)) for t, c in abnormal_types
            ],
            topConsumers=[
                TopConsumerItem(meterCode=code, customerName=name, meterType=mtype, consumption=round(total, 2))
                for code, name, mtype, total in top
            ],
            employeePerformance=[
                EmployeePerformanceItem(
                    employeeCode=code,
                    fullName=employee_names.get(code, code),
                    readings=count,
                    corrected=corrected,
                    correctionRate=_pct(corrected, count),
                )
                for code, count, corrected in performance
            ],
        )
