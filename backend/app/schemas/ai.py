from typing import List, Optional
from pydantic import BaseModel, Field

class PolygonPoint(BaseModel):
    x: int
    y: int

class PredictionDetail(BaseModel):
    # Bảo toàn chuỗi ký tự giữ nguyên số 0 ở đầu (ví dụ: '01258')
    predictedSequence: str = Field(..., description="Chuỗi ký tự số AI nhận diện được, giữ nguyên số 0 ở đầu")
    numericalValue: float = Field(..., description="Giá trị số thực dùng để tính toán")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Độ tin cậy tổng thể")
    modelVersion: str = Field(default="yolo11n-seg-crnn-v2.1")

class VisualizationDetail(BaseModel):
    originalImageUrl: str
    croppedImageUrl: str
    polygon: List[PolygonPoint] = Field(default_factory=list)
    bbox: List[int] = Field(default_factory=list, description="[x1, y1, x2, y2]")

class AIPredictResponse(BaseModel):
    requestId: str
    meterId: int
    meterCode: str
    previousIndex: float
    prediction: PredictionDetail
    visualization: VisualizationDetail
