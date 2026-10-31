from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.route import AssignedRoutesResponse, MeterSummaryResponse
from app.services.route_service import RouteService

router = APIRouter(prefix="/reader", tags=["Tác Nghiệp Ghi Số Hiện Trường"])

@router.get("/assigned-routes", response_model=AssignedRoutesResponse)
def get_assigned_routes(db: Session = Depends(get_db)):
    """Lấy danh sách tuyến đọc chỉ số được phân công cho nhân viên ghi số."""
    return RouteService.get_assigned_routes(db, employee_code="NV-4881")

@router.get("/routes/{route_id}/meters", response_model=List[MeterSummaryResponse])
def get_route_meters(route_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách đồng hồ nước trên một tuyến cụ thể."""
    return RouteService.get_route_meters(db, route_id=route_id)
