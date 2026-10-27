from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, Employee
from app.models.route import Route, RouteAssignment
from app.models.meter import WaterMeter
from app.models.tariff import Tariff, TariffTier

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        if db.query(User).filter(User.email == "nguyentuan@waterflow.vn").first():
            return

        user = User(
            email="nguyentuan@waterflow.vn",
            hashed_password="mock_hashed_password",
            full_name="Nguyễn Tuấn",
            phone="0909.123.456",
            role="READER",
            is_active=True
        )
        db.add(user)
        db.flush()

        employee = Employee(
            user_id=user.id,
            employee_code="NV-4881",
            team_name="Tổ Ghi Số Quận 1",
            assigned_area="Quận 1, TP. Hồ Chí Minh"
        )
        db.add(employee)
        db.flush()

        route_a01 = Route(
            route_code="A01",
            route_name="Tuyến A01 – Phường Bến Nghé, Quận 1",
            description="Trục Nguyễn Du - Nguyễn Trãi",
            ward="Phường Bến Nghé",
            district="Quận 1",
            total_meters=25,
            status="IN_PROGRESS",
            priority_order=1
        )
        route_a02 = Route(
            route_code="A02",
            route_name="Tuyến A02 – Phường Đa Kao, Quận 1",
            description="Trục Đinh Tiên Hoàng - Hoàng Sa",
            ward="Phường Đa Kao",
            district="Quận 1",
            total_meters=20,
            status="PAUSED",
            priority_order=2
        )
        db.add_all([route_a01, route_a02])
        db.flush()

        db.add_all([
            RouteAssignment(route_id=route_a01.id, employee_id=employee.id, billing_period="2025-04", priority=1, status="IN_PROGRESS"),
            RouteAssignment(route_id=route_a02.id, employee_id=employee.id, billing_period="2025-04", priority=2, status="PAUSED")
        ])
        db.flush()

        meters_a01 = [
            WaterMeter(
                route_id=route_a01.id,
                meter_code="DH001245",
                customer_name="Nguyễn Văn An",
                customer_phone="0912.345.678",
                address="123 Nguyễn Trãi, Phường Bến Nghé, Quận 1",
                meter_size="15mm",
                meter_type="HỘ GIA ĐÌNH SINH HOẠT",
                standard_tier_limit=20.0,
                previous_index=1240.0,
                previous_reading_date=datetime(2025, 3, 14, 9, 30),
                reading_status="PENDING"
            ),
            WaterMeter(
                route_id=route_a01.id,
                meter_code="DH001246",
                customer_name="Trần Văn Bình",
                customer_phone="0903.456.789",
                address="125 Nguyễn Trãi, Phường Bến Nghé, Quận 1",
                meter_size="15mm",
                meter_type="HỘ GIA ĐÌNH SINH HOẠT",
                standard_tier_limit=20.0,
                previous_index=1240.0,
                current_index=1258.0,
                reading_status="RECORDED"
            ),
            WaterMeter(
                route_id=route_a01.id,
                meter_code="DH001247",
                customer_name="Lê Văn Nam",
                customer_phone="0987.654.321",
                address="127 Nguyễn Trãi, Phường Bến Nghé, Quận 1",
                meter_size="15mm",
                meter_type="HỘ GIA ĐÌNH SINH HOẠT",
                standard_tier_limit=20.0,
                previous_index=890.0,
                reading_status="LOCKED",
                notes="Báo ngày 14/04: Cửa khóa 2 lớp, không tiếp cận được"
            ),
            WaterMeter(
                route_id=route_a01.id,
                meter_code="DH001248",
                customer_name="Hoàng Thị Mai",
                customer_phone="0911.222.333",
                address="129 Nguyễn Trãi, Phường Bến Nghé, Quận 1",
                meter_size="15mm",
                meter_type="HỘ GIA ĐÌNH SINH HOẠT",
                standard_tier_limit=20.0,
                previous_index=84.0,
                reading_status="PENDING"
            ),
            WaterMeter(
                route_id=route_a01.id,
                meter_code="DH001249",
                customer_name="Phạm Đức Thắng",
                customer_phone="0944.555.666",
                address="131 Nguyễn Trãi, Phường Bến Nghé, Quận 1",
                meter_size="15mm",
                meter_type="HỘ GIA ĐÌNH SINH HOẠT",
                standard_tier_limit=20.0,
                previous_index=312.0,
                reading_status="PENDING"
            ),
            WaterMeter(
                route_id=route_a01.id,
                meter_code="DH-BN-0941",
                customer_name="Lê Hoàng Nam (Nhà sách Ánh Dương)",
                customer_phone="0918.234.xxx",
                address="42 Nguyễn Du, Phường Bến Nghé, Quận 1",
                meter_size="25mm",
                meter_type="KINH DOANH DỊCH VỤ",
                standard_tier_limit=50.0,
                previous_index=720.0,
                reading_status="PENDING",
                is_priority=True,
                priority_reason="Khóa cổng hẹn ca chiều",
                notes="Liên hệ: 0918.234.xxx (Chủ nhà hẹn sau 15:30)"
            ),
        ]

        for i in range(7, 26):
            is_recorded = i <= 23
            meters_a01.append(
                WaterMeter(
                    route_id=route_a01.id,
                    meter_code=f"DH0012{i:02d}",
                    customer_name=f"Hộ dân Nguyễn Trãi {i}",
                    address=f"{130 + i} Nguyễn Trãi, Phường Bến Nghé, Quận 1",
                    meter_size="15mm",
                    meter_type="HỘ GIA ĐÌNH SINH HOẠT",
                    standard_tier_limit=20.0,
                    previous_index=float(100 + i * 20),
                    current_index=float(100 + i * 20 + 15) if is_recorded else None,
                    reading_status="RECORDED" if is_recorded else "PENDING"
                )
            )
        db.add_all(meters_a01)
        db.flush()

        meters_a02 = [
            WaterMeter(
                route_id=route_a02.id,
                meter_code="DH-DK-0112",
                customer_name="Công ty TNHH May Mặc Sài Gòn",
                customer_phone="028.3822.xxxx",
                address="108 Hoàng Sa, Phường Đa Kao, Quận 1",
                meter_size="50mm",
                meter_type="SẢN XUẤT",
                standard_tier_limit=100.0,
                previous_index=1500.0,
                reading_status="PENDING",
                is_priority=True,
                priority_reason="Tiêu thụ tăng vọt (+280%)",
                notes="Đọc kỳ này: 342 m³ (Trung bình: 90 m³). Cần kiểm tra rò rỉ sau đồng hồ."
            )
        ]
        for j in range(2, 21):
            status = "RECORDED" if j <= 11 else ("ABNORMAL" if j == 12 else "PENDING")
            meters_a02.append(
                WaterMeter(
                    route_id=route_a02.id,
                    meter_code=f"DH0022{j:02d}",
                    customer_name=f"Hộ dân Hoàng Sa {j}",
                    address=f"{j * 2} Hoàng Sa, Phường Đa Kao, Quận 1",
                    meter_size="15mm",
                    meter_type="HỘ GIA ĐÌNH SINH HOẠT",
                    standard_tier_limit=20.0,
                    previous_index=float(200 + j * 10),
                    current_index=float(200 + j * 10 + 12) if status == "RECORDED" else None,
                    reading_status=status
                )
            )
        db.add_all(meters_a02)
        db.flush()

        tariff = Tariff(
            tariff_code="SH_2025",
            name="Biểu tính đơn giá bậc thang sinh hoạt",
            customer_type="HỘ GIA ĐÌNH SINH HOẠT",
            is_active=True
        )
        db.add(tariff)
        db.flush()

        db.add_all([
            TariffTier(tariff_id=tariff.id, tier_order=1, tier_name="Bậc 1 (≤10 m³)", min_volume=0.0, max_volume=10.0, unit_price=6700.0),
            TariffTier(tariff_id=tariff.id, tier_order=2, tier_name="Bậc 2 (10-20 m³)", min_volume=10.0, max_volume=20.0, unit_price=7000.0),
            TariffTier(tariff_id=tariff.id, tier_order=3, tier_name="Bậc 3 (20-30 m³)", min_volume=20.0, max_volume=30.0, unit_price=8500.0),
            TariffTier(tariff_id=tariff.id, tier_order=4, tier_name="Bậc 4 (>30 m³)", min_volume=30.0, max_volume=None, unit_price=15000.0),
        ])

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
