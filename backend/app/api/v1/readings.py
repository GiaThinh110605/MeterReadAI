from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.reading import (
    ReadingCreateRequest,
    ReadingResponse,
    AbnormalityCreateRequest,
    AbnormalityResponse
)
from app.services.reading_service import ReadingService

router = APIRouter(prefix="/readings", tags=["Ghi Số & Kiểm Toán Chỉ Số"])

@router.post("", response_model=ReadingResponse, status_code=status.HTTP_201_CREATED)
def record_meter_reading(request: ReadingCreateRequest, db: Session = Depends(get_db)):
    """
    Xác nhận / Sửa chỉ số đồng hồ nước:
    - RÀNG BUỘC: Imới >= Icũ (nếu nhỏ hơn từ chối lưu 422).
    - AUDIT TRAIL: Bắt buộc lý do sửa khi isModified=True.
    - Lưu chỉ số, tính tiêu thụ và cập nhật trạng thái.
    """
    reading = ReadingService.record_reading(db, request)
    return ReadingResponse(
        readingId=reading.id,
        meterId=reading.meter_id,
        consumption=reading.consumption,
        readingStatus=reading.reading_status,
        recordedBy=reading.recorded_by,
        message="Ghi nhận chỉ số nước thành công"
    )

@router.post("/abnormalities", response_model=AbnormalityResponse, status_code=status.HTTP_201_CREATED)
def report_abnormality(request: AbnormalityCreateRequest, db: Session = Depends(get_db)):
    """Ghi nhận sự cố bất thường tại hiện trường (khóa cổng, bể kính, đứt niêm chì)."""
    abnormality = ReadingService.report_abnormality(db, request)
    return AbnormalityResponse(
        id=abnormality.id,
        meterId=abnormality.meter_id,
        reportType=abnormality.report_type,
        description=abnormality.description,
        status=abnormality.status,
        reportedAt=abnormality.reported_at,
        message="Lập biên bản bất thường thành công"
    )
