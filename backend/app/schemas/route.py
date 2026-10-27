from typing import List, Optional
from pydantic import BaseModel

class MeterSummaryResponse(BaseModel):
    id: int
    meterCode: str
    customerName: str
    customerPhone: Optional[str] = None
    address: str
    meterSize: str
    meterType: str
    standardTierLimit: float
    previousIndex: float
    currentIndex: Optional[float] = None
    readingStatus: str  # PENDING, RECORDED, LOCKED, ABNORMAL
    isPriority: bool = False
    priorityReason: Optional[str] = None
    notes: Optional[str] = None

class RouteItemResponse(BaseModel):
    id: int
    routeCode: str
    routeName: str
    description: Optional[str] = None
    ward: str
    district: str
    totalMeters: int
    recordedMeters: int
    pendingMeters: int
    abnormalMeters: int
    percentComplete: float
    status: str
    priority: int
    lastUpdated: Optional[str] = None

class PriorityAlertResponse(BaseModel):
    id: int
    meterCode: str
    customerName: str
    address: str
    phone: Optional[str] = None
    issueType: str
    issueDescription: str
    routeCode: str
    actionPrompt: str

class AssignedRoutesResponse(BaseModel):
    shiftProgressPercent: float
    totalMetersInShift: int
    recordedMetersInShift: int
    pendingMetersInShift: int
    abnormalMetersInShift: int
    startTime: str
    estimatedEndTime: str
    routes: List[RouteItemResponse]
    priorityAlerts: List[PriorityAlertResponse]
