from typing import List
from pydantic import BaseModel, Field

class TierCalculationItem(BaseModel):
    tierOrder: int
    tierName: str
    volume: float
    unitPrice: float
    amount: float

class TariffCalculateRequest(BaseModel):
    consumption: float = Field(..., ge=0, description="Lượng nước tiêu thụ tính bằng m3")
    customerType: str = Field(default="HỘ GIA ĐÌNH SINH HOẠT")

class TariffCalculateResponse(BaseModel):
    consumption: float
    waterAmount: float
    envFee: float
    vatAmount: float
    totalAmount: float
    tiers: List[TierCalculationItem]
