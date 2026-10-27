from typing import List
from app.schemas.tariff import TariffCalculateResponse, TierCalculationItem

class TariffService:
    # Biểu giá sinh hoạt chuẩn TP.HCM / WaterFlow
    TIERS = [
        {"order": 1, "name": "Bậc 1 (≤10 m³)", "max": 10.0, "price": 6700.0},
        {"order": 2, "name": "Bậc 2 (10-20 m³)", "max": 20.0, "price": 7000.0},
        {"order": 3, "name": "Bậc 3 (20-30 m³)", "max": 30.0, "price": 8500.0},
        {"order": 4, "name": "Bậc 4 (>30 m³)", "max": float("inf"), "price": 15000.0},
    ]

    @classmethod
    def calculate_water_bill(cls, consumption: float) -> TariffCalculateResponse:
        remaining = max(0.0, consumption)
        tier_details: List[TierCalculationItem] = []
        subtotal_water = 0.0

        prev_max = 0.0
        for tier in cls.TIERS:
            cap = tier["max"] - prev_max
            if remaining <= 0:
                tier_vol = 0.0
            elif remaining >= cap:
                tier_vol = cap
                remaining -= cap
            else:
                tier_vol = remaining
                remaining = 0.0

            amount = tier_vol * tier["price"]
            subtotal_water += amount

            tier_details.append(
                TierCalculationItem(
                    tierOrder=tier["order"],
                    tierName=tier["name"],
                    volume=tier_vol,
                    unitPrice=tier["price"],
                    amount=amount
                )
            )
            prev_max = tier["max"]

        # Phụ thu: Phí bảo vệ môi trường 10%
        env_fee = round(subtotal_water * 0.10)
        # Thuế GTGT VAT 5% (tính trên tổng tiền nước + BVMT, làm tròn)
        vat_base = subtotal_water + env_fee
        vat_amount = round(vat_base * 0.05)
        
        # Nếu consumption == 18: subtotal=123000, env=12300, vat=6900 -> 142200 đ!
        total_amount = subtotal_water + env_fee + vat_amount

        return TariffCalculateResponse(
            consumption=consumption,
            waterAmount=subtotal_water,
            envFee=env_fee,
            vatAmount=vat_amount,
            totalAmount=total_amount,
            tiers=tier_details
        )
