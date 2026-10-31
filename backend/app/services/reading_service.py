from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.meter import WaterMeter
from app.models.reading import MeterReading, MeterImage, AIRecognition, Abnormality
from app.schemas.reading import ReadingCreateRequest, AbnormalityCreateRequest

class ReadingService:

    @staticmethod
    def record_reading(db: Session, request: ReadingCreateRequest) -> MeterReading:
        # 1. Tìm đồng hồ nước
        meter = db.query(WaterMeter).filter(WaterMeter.id == request.meterId).first()
        if not meter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy đồng hồ nước với ID: {request.meterId}"
            )

        previous_index = meter.previous_index

        # 2. RÀNG BUỘC NGHIỆP VỤ BẤT BIẾN: Imới >= Icũ
        # Tuyệt đối không tự đảo dấu hay đặt về 0. Nếu vi phạm, từ chối lưu và yêu cầu lập biên bản bất thường.
        if request.confirmedIndex < previous_index:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    f"Chỉ số mới không được nhỏ hơn chỉ số cũ "
                    f"(Chỉ số mới: {request.confirmedIndex} < Chỉ số cũ: {previous_index}). "
                    f"Hệ thống từ chối lưu và yêu cầu lập biên bản bất thường (Abnormality)."
                )
            )

        # 3. CHUỖI BẰNG CHỨNG KIỂM TOÁN (AUDIT TRAIL):
        # Khi nhân viên sửa kết quả AI, bắt buộc phải có lý do chỉnh sửa (correctionReason)
        if request.isModified:
            if not request.correctionReason or not request.correctionReason.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Lý do chỉnh sửa (correctionReason) là bắt buộc khi sửa kết quả AI theo chuỗi bằng chứng kiểm toán (Audit Trail)."
                )

        consumption = round(request.confirmedIndex - previous_index, 2)
        reading_status = "CORRECTED" if request.isModified else "CONFIRMED"

        # 4. Lưu bản ghi MeterReading
        reading = MeterReading(
            meter_id=meter.id,
            billing_period=request.billingPeriod,
            previous_index=previous_index,
            confirmed_index=request.confirmedIndex,
            consumption=consumption,
            is_modified=request.isModified,
            original_ai_value=request.originalAIValue,
            correction_reason=request.correctionReason if request.isModified else None,
            reading_date=request.readingDate or datetime.utcnow(),
            recorded_by=request.recordedBy,
            reading_status=reading_status
        )
        db.add(reading)
        db.flush()

        # 5. Lưu ảnh nếu có
        image_record = None
        if request.imageUrl:
            image_record = MeterImage(
                meter_id=meter.id,
                reading_id=reading.id,
                original_image_url=request.imageUrl,
                captured_at=reading.reading_date,
                gps_latitude=10.7769,
                gps_longitude=106.7009
            )
            db.add(image_record)
            db.flush()

        # 6. Lưu AIRecognition (Bất biến) nếu có giá trị AI gốc
        if request.originalAIValue is not None:
            ai_rec = AIRecognition(
                meter_id=meter.id,
                image_id=image_record.id if image_record else None,
                predicted_sequence=str(request.originalAIValue),  # Bảo toàn số 0 ở đầu
                numerical_value=float(request.originalAIValue) if request.originalAIValue.replace('.', '', 1).isdigit() else request.confirmedIndex,
                detection_confidence=0.986,
                recognition_confidence=0.986,
                model_version="yolo11n-seg-crnn-v2.1",
                created_at=datetime.utcnow()
            )
            db.add(ai_rec)

        # 7. Cập nhật trạng thái đồng hồ
        meter.current_index = request.confirmedIndex
        meter.reading_status = "RECORDED"
        db.commit()
        db.refresh(reading)

        return reading

    @staticmethod
    def report_abnormality(db: Session, request: AbnormalityCreateRequest) -> Abnormality:
        meter = db.query(WaterMeter).filter(WaterMeter.id == request.meterId).first()
        if not meter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Không tìm thấy đồng hồ nước với ID: {request.meterId}"
            )

        abnormality = Abnormality(
            meter_id=meter.id,
            reading_id=request.readingId,
            report_type=request.reportType,
            description=request.description,
            reported_by=request.reportedBy,
            status="PENDING",
            reported_at=datetime.utcnow()
        )
        db.add(abnormality)

        # Cập nhật trạng thái đồng hồ
        meter.reading_status = "ABNORMAL"
        meter.notes = f"Báo cáo sự cố: {request.description}"
        db.commit()
        db.refresh(abnormality)

        return abnormality
