from typing import Optional, List
from pydantic import BaseModel

class CurrentBillInfo(BaseModel):
    period: str
    amount: float
    consumption: float
    dueDate: str
    status: str

class MeterStats(BaseModel):
    consumption: float
    diffText: str
    currentIndex: float
    currentDate: str
    previousIndex: float
    previousDate: str

class MonthConsumption(BaseModel):
    month: str
    consumption: Optional[float] = None
    isCurrent: bool = False

class CustomerOverviewResponse(BaseModel):
    customerName: str
    customerCode: str
    meterCode: str
    meterSerial: str
    address: str
    currentBill: CurrentBillInfo
    stats: MeterStats
    chartData: List[MonthConsumption]
    latestInvoice: Optional[dict] = None
    latestPhoto: Optional[dict] = None

class InvoiceTierItem(BaseModel):
    tierOrder: int
    name: str
    volume: float
    unitPrice: float
    amount: float

class InvoiceDetailResponse(BaseModel):
    id: int
    invoiceCode: str
    period: str
    amount: float
    volume: float
    dueDate: Optional[str] = None
    paidDate: Optional[str] = None
    status: str
    previousIndex: float
    currentIndex: float
    diffVolume: float
    tiers: List[InvoiceTierItem]
    taxAndEnvFee: float
    subtotalWater: float
    recordedBy: str
    recordedAt: str
    meterSerial: str
    photoUrl: str
    isAutoVerified: bool = True

class ComplaintCreateRequest(BaseModel):
    ticketType: str
    invoiceCode: Optional[str] = None
    content: str
    imageUrl: Optional[str] = None

class ComplaintTicketResponse(BaseModel):
    id: int
    ticketCode: str
    ticketType: str
    status: str
    invoiceCode: Optional[str] = None
    content: str
    createdAt: str
    hasImage: bool = False
    resolutionNote: Optional[str] = None

