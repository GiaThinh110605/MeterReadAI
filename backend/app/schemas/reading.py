from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ReadingCreateRequest(BaseModel):
    meterId: int = Field(..., description="ID đồng hồ cần ghi số")
    billingPeriod: str = Field(default="2025-04", description="Kỳ ghi số, ví dụ 2025-04")
    confirmedIndex: float = Field(..., description="Chỉ số mới nhân viên xác nhận")
    isModified: bool = Field(default=False, description="True nếu nhân viên chỉnh sửa khác kết quả AI")
    originalAIValue: Optional[str] = Field(None, description="Chuỗi gốc do AI dự đoán (giữ nguyên số 0)")
    correctionReason: Optional[str] = Field(None, description="Lý do chỉnh sửa (bắt buộc khi isModified=True)")
    readingDate: Optional[datetime] = Field(default_factory=datetime.utcnow)
    recordedBy: str = Field(default="NV-4881", description="Mã nhân viên ghi số")
    imageUrl: Optional[str] = Field(None, description="URL ảnh hiện trường đã chụp")

class ReadingResponse(BaseModel):
    readingId: int
    meterId: int
    consumption: float
    readingStatus: str
    recordedBy: str
    message: str

class AbnormalityCreateRequest(BaseModel):
    meterId: int
    readingId: Optional[int] = None
    reportType: str = Field(..., description="LOCKED_DOOR, BROKEN_GLASS, BROKEN_SEAL, NEGATIVE_CONSUMPTION, LEAK_SUSPECTED, OTHER")
    description: str = Field(..., description="Chi tiết biên bản sự cố")
    reportedBy: str = Field(default="NV-4881")

class AbnormalityResponse(BaseModel):
    id: int
    meterId: int
    reportType: str
    description: str
    status: str
    reportedAt: datetime
    message: str
