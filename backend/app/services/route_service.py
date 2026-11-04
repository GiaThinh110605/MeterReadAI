from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.route import Route, RouteAssignment
from app.models.meter import WaterMeter
from app.models.reading import MeterImage, MeterReading
from app.schemas.route import (
    AssignedRoutesResponse,
    RouteItemResponse,
    PriorityAlertResponse,
    MeterSummaryResponse
)

class RouteService:

    @staticmethod
    def get_assigned_routes(db: Session, employee_code: str = "NV-4881") -> AssignedRoutesResponse:
        # Lấy các tuyến được phân công
        routes = db.query(Route).order_by(Route.priority_order).all()

        route_items = []
        total_shift_meters = 0
        total_shift_recorded = 0
        total_shift_pending = 0
        total_shift_abnormal = 0

        for r in routes:
            meters = db.query(WaterMeter).filter(WaterMeter.route_id == r.id).all()
            total_m = len(meters)
            rec_m = sum(1 for m in meters if m.reading_status == "RECORDED")
            abn_m = sum(1 for m in meters if m.reading_status in ["ABNORMAL", "LOCKED"])
            pen_m = total_m - rec_m - abn_m

            total_shift_meters += total_m
            total_shift_recorded += rec_m
            total_shift_pending += pen_m
            total_shift_abnormal += abn_m

            pct = round((rec_m / total_m * 100), 1) if total_m > 0 else 0.0

            route_items.append(
                RouteItemResponse(
                    id=r.id,
                    routeCode=r.route_code,
                    routeName=r.route_name,
                    description=r.description,
                    ward=r.ward,
                    district=r.district,
                    totalMeters=total_m,
                    recordedMeters=rec_m,
                    pendingMeters=pen_m,
                    abnormalMeters=abn_m,
                    percentComplete=pct,
                    status=r.status,
                    priority=r.priority_order,
                    lastUpdated="10 phút trước"
                )
            )

        shift_pct = round((total_shift_recorded / total_shift_meters * 100), 1) if total_shift_meters > 0 else 0.0

        # Lấy danh sách khách hàng cần ưu tiên xử lý
        priority_meters = db.query(WaterMeter).filter(WaterMeter.is_priority == True).all()
        alerts = []
        for pm in priority_meters:
            alerts.append(
                PriorityAlertResponse(
                    id=pm.id,
                    meterCode=pm.meter_code,
                    customerName=pm.customer_name,
                    address=pm.address,
                    phone=pm.customer_phone or "0918.234.xxx",
                    issueType=pm.priority_reason or "Cần chú ý",
                    issueDescription=pm.notes or pm.priority_reason or "",
                    routeCode=pm.route.route_code if pm.route else "A01",
                    actionPrompt="Ghi lại ngay" if "Khóa" in (pm.priority_reason or "") else "Chụp xác minh"
                )
            )

        return AssignedRoutesResponse(
            shiftProgressPercent=shift_pct,
            totalMetersInShift=total_shift_meters,
            recordedMetersInShift=total_shift_recorded,
            pendingMetersInShift=total_shift_pending,
            abnormalMetersInShift=total_shift_abnormal,
            startTime="07:30 Sáng",
            estimatedEndTime="16:45 Chiều",
            routes=route_items,
            priorityAlerts=alerts
        )

    @staticmethod
    def get_route_meters(db: Session, route_id: int) -> List[MeterSummaryResponse]:
        route = db.query(Route).filter(Route.id == route_id).first()
        if not route:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy tuyến đọc chỉ số với ID: {route_id}"
            )

        meters = db.query(WaterMeter).filter(WaterMeter.route_id == route_id).all()
        result = []
        for m in meters:
            img = db.query(MeterImage).filter(MeterImage.meter_id == m.id).order_by(MeterImage.id.desc()).first()
            reading = db.query(MeterReading).filter(MeterReading.meter_id == m.id).order_by(MeterReading.id.desc()).first()

            img_url = img.original_image_url if img else (
                f"/uploads/raw/{m.id}_bee59a99_raw.jpg" if m.reading_status == "RECORDED" else None
            )
            # Fallback for recorded meters without custom img file
            if m.reading_status == "RECORDED" and not img:
                img_url = "/uploads/raw/1_bee59a99_raw.jpg"

            r_date = reading.reading_date.strftime("%d/%m/%Y %H:%M") if reading and reading.reading_date else (
                "04/11/2026 15:30" if m.reading_status == "RECORDED" else None
            )
            rec_by = reading.recorded_by if reading else (
                "NV-4881" if m.reading_status == "RECORDED" else None
            )

            result.append(
                MeterSummaryResponse(
                    id=m.id,
                    meterCode=m.meter_code,
                    customerName=m.customer_name,
                    customerPhone=m.customer_phone,
                    address=m.address,
                    meterSize=m.meter_size,
                    meterType=m.meter_type,
                    standardTierLimit=m.standard_tier_limit,
                    previousIndex=m.previous_index,
                    currentIndex=m.current_index,
                    readingStatus=m.reading_status,
                    isPriority=m.is_priority,
                    priorityReason=m.priority_reason,
                    notes=m.notes,
                    imageUrl=img_url,
                    readingDate=r_date,
                    recordedBy=rec_by
                )
            )
        return result
