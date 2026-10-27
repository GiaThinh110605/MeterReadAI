from fastapi import APIRouter
from app.schemas.tariff import TariffCalculateRequest, TariffCalculateResponse
from app.services.tariff_service import TariffService

router = APIRouter(prefix="/tariffs", tags=["Biểu Giá & Tính Tiền Nước"])

@router.post("/calculate", response_model=TariffCalculateResponse)
def calculate_water_bill(request: TariffCalculateRequest):
    """Tính toán tiền nước bậc thang sinh hoạt, phí BVMT 10% và thuế VAT 5%."""
    return TariffService.calculate_water_bill(request.consumption)
