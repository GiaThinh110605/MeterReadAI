import uuid
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.meter import WaterMeter
from app.schemas.ai import AIPredictResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Vision Core"])

@router.post("/predict", response_model=AIPredictResponse)
async def predict_water_meter(
    file: UploadFile = File(..., description="Ảnh chụp mặt số đồng hồ nước (JPEG/PNG)"),
    meterId: int = Form(..., description="ID đồng hồ nước cần nhận diện"),
    db: Session = Depends(get_db)
):
    """
    Điểm cuối Lõi AI Vision (Lâm Gia Thịnh phụ trách):
    - Kiểm tra magic bytes ảnh và kích thước tệp < 10MB.
    - YOLO11-seg: Cắt vùng dial / polygon.
    - CRNN: Nhận diện chuỗi ký tự (BẢO TOÀN SỐ 0 Ở ĐẦU).
    """
    meter = db.query(WaterMeter).filter(WaterMeter.id == meterId).first()
    if not meter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy đồng hồ nước với ID: {meterId}"
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tệp tải lên rỗng."
        )

    ai_service = AIService.get_instance()
    # Thực hiện tiền xử lý OpenCV + YOLO11-seg + CRNN
    prediction, visualization, raw_url, crop_url = ai_service.predict(
        image_bytes=contents,
        meter_id=meter.id,
        previous_index=meter.previous_index
    )

    request_id = f"req-{uuid.uuid4().hex[:12]}"

    return AIPredictResponse(
        requestId=request_id,
        meterId=meter.id,
        meterCode=meter.meter_code,
        previousIndex=meter.previous_index,
        prediction=prediction,
        visualization=visualization
    )
