import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.models.user import User, Employee
from app.models.route import Route, RouteAssignment
from app.models.meter import WaterMeter
from app.models.tariff import Tariff, TariffTier, Invoice, InvoiceTierDetail
from app.models.reading import MeterReading, Abnormality

# Use in-memory or dedicated test db
TEST_DATABASE_URL = "sqlite:///./test_meter_read.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def seed_test_data(db):
    user_tuann = User(
        email="nguyentuan@waterflow.vn",
        hashed_password="mock_hashed_password",
        full_name="Nguyễn Tuấn",
        phone="0909.123.456",
        role="READER",
        is_active=True
    )
    db.add(user_tuann)
    db.flush()

    emp1 = Employee(
        user_id=user_tuann.id,
        employee_code="NV-4881",
        team_name="Tổ Ghi Số Quận 1",
        assigned_area="Quận 1, TP. Hồ Chí Minh"
    )
    db.add(emp1)
    db.flush()

    admin_user = User(
        email="admin@waterflow.vn",
        hashed_password="mock_hashed_password",
        full_name="Nguyễn Thành Nam",
        phone="0901.289.999",
        role="ADMIN",
        is_active=True
    )
    db.add(admin_user)

    customer_user = User(
        email="customer@waterflow.vn",
        hashed_password="mock_hashed_password",
        full_name="Nguyễn Văn An",
        phone="0912.345.678",
        role="CUSTOMER",
        is_active=True
    )
    db.add(customer_user)
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
    db.add(route_a01)

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
    db.add(route_a02)
    db.flush()

    db.add(RouteAssignment(route_id=route_a01.id, employee_id=emp1.id, billing_period="2025-04", priority=1, status="IN_PROGRESS"))
    db.add(RouteAssignment(route_id=route_a02.id, employee_id=emp1.id, billing_period="2025-04", priority=2, status="PAUSED"))

    for r_idx in range(3, 20):
        r = Route(
            route_code=f"A{r_idx:02d}",
            route_name=f"Tuyến A{r_idx:02d} – Phường {r_idx}",
            description=f"Khu vực {r_idx}",
            ward=f"Phường {r_idx}",
            district="Quận 1",
            total_meters=30,
            status="IN_PROGRESS" if r_idx % 2 == 0 else "PAUSED",
            priority_order=r_idx
        )
        db.add(r)
    db.flush()

    for e_idx in range(2, 36):
        u = User(
            email=f"emp{e_idx}@waterflow.vn",
            hashed_password="mock_hashed_password",
            full_name=f"Nhân Viên {e_idx}",
            phone=f"0909.{e_idx:03d}.123",
            role="READER",
            is_active=True
        )
        db.add(u)
        db.flush()
        db.add(Employee(
            user_id=u.id,
            employee_code=f"NV-{4880 + e_idx}",
            team_name="Tổ Ghi Số Quận 1",
            assigned_area="Quận 1, TP. Hồ Chí Minh"
        ))
    db.flush()

    real_customers = [
        ("Nguyễn Văn An", "121 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0912.345.678", 1240.0, 1258.0, "RECORDED", True, "Khóa cổng hẹn ca chiều"),
        ("Trần Thị Mai", "123 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0903.456.789", 1240.0, None, "LOCKED", True, "Cửa khóa 2 lớp, không tiếp cận được"),
        ("Lê Hoàng Nam", "125 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0987.654.321", 0.0, None, "PENDING", True, "Đồng hồ mới P-MAX cần ghi số"),
        ("Phạm Quốc Tuấn", "127 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0944.555.666", 0.0, None, "PENDING", False, None),
        ("Hoàng Kim Ngân", "129 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0911.222.333", 312.0, None, "PENDING", False, None),
        ("Vũ Đình Trọng", "131 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0938.111.222", 450.0, None, "PENDING", False, None),
        ("Đỗ Thị Bích Ngọc", "133 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0908.777.888", 620.0, None, "PENDING", False, None),
        ("Bùi Quốc Tuấn", "135 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0917.444.555", 780.0, 798.0, "RECORDED", False, None),
        ("Đặng Thanh Thảo", "137 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0909.888.999", 890.0, 908.0, "RECORDED", False, None),
        ("Trương Văn Hưng", "139 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0913.666.777", 950.0, 966.0, "RECORDED", False, None),
        ("Võ Thị Ánh Tuyết", "141 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0982.333.444", 1020.0, 1038.0, "RECORDED", False, None),
        ("Ngô Gia Huy", "143 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0906.555.444", 1100.0, 1115.0, "RECORDED", False, None),
        ("Huỳnh Quốc Bảo", "145 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0919.222.111", 1180.0, 1198.0, "RECORDED", False, None),
        ("Phan Thị Hồng Nhung", "147 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0933.444.888", 1250.0, 1268.0, "RECORDED", False, None),
        ("Dương Văn Phúc", "149 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0902.999.333", 1320.0, 1337.0, "RECORDED", False, None),
        ("Đinh Hoài Nam", "151 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0918.777.222", 1410.0, 1428.0, "RECORDED", False, None),
        ("Trịnh Thu Trang", "153 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0907.666.111", 1500.0, 1519.0, "RECORDED", False, None),
        ("Lý Gia Kiệt", "155 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0981.555.222", 1590.0, 1608.0, "RECORDED", False, None),
        ("Mai Văn Hậu", "157 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0916.444.333", 1680.0, 1698.0, "RECORDED", False, None),
        ("Lâm Gia Thịnh", "159 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0903.222.111", 1750.0, 1768.0, "RECORDED", False, None),
        ("Nguyễn Thị Lan Anh", "161 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0914.888.777", 1820.0, 1839.0, "RECORDED", False, None),
        ("Đoàn Văn Thành", "163 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0989.111.444", 1910.0, 1928.0, "RECORDED", False, None),
        ("Tạ Thị Thùy Linh", "165 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0905.333.888", 2000.0, 2018.0, "RECORDED", False, None),
        ("Lương Thế Vinh", "167 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0915.777.666", 2080.0, 2098.0, "RECORDED", False, None),
        ("Chu Đức Thắng", "169 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0984.222.555", 2150.0, 2168.0, "RECORDED", False, None),
    ]
    for idx, (name, addr, phone, prev_idx, curr_idx, status, prio, p_reason) in enumerate(real_customers, 1):
        meter = WaterMeter(
            route_id=route_a01.id,
            meter_code=f"DH00{1244 + idx}",
            customer_name=name,
            customer_phone=phone,
            address=addr,
            meter_size="15mm",
            meter_type="HỘ GIA ĐÌNH SINH HOẠT",
            standard_tier_limit=20.0,
            previous_index=prev_idx,
            current_index=curr_idx,
            reading_status=status,
            is_priority=prio,
            priority_reason=p_reason
        )
        db.add(meter)
    db.flush()

    tariff = Tariff(
        tariff_code="SH-01",
        name="Biểu giá sinh hoạt chuẩn TP.HCM",
        customer_type="RESIDENTIAL",
        is_active=True
    )
    db.add(tariff)
    db.flush()

    tiers = [
        TariffTier(tariff_id=tariff.id, tier_order=1, tier_name="Bậc 1 (0-10 m³)", min_volume=0.0, max_volume=10.0, unit_price=6700.0),
        TariffTier(tariff_id=tariff.id, tier_order=2, tier_name="Bậc 2 (11-20 m³)", min_volume=10.0, max_volume=20.0, unit_price=7000.0),
        TariffTier(tariff_id=tariff.id, tier_order=3, tier_name="Bậc 3 (21-30 m³)", min_volume=20.0, max_volume=30.0, unit_price=8500.0),
        TariffTier(tariff_id=tariff.id, tier_order=4, tier_name="Bậc 4 (>30 m³)", min_volume=30.0, max_volume=None, unit_price=15000.0),
    ]
    db.add_all(tiers)

    rd = MeterReading(
        meter_id=1,
        billing_period="2026-09",
        previous_index=1240.0,
        confirmed_index=1258.0,
        consumption=18.0,
        recorded_by="NV-4881"
    )
    db.add(rd)
    db.flush()

    # Seed 4 test invoices
    periods = [
        ("2026-06", 204000.0, 15.0, "PAID"),
        ("2026-07", 272000.0, 20.0, "PAID"),
        ("2026-08", 218000.0, 16.0, "PAID"),
        ("2026-09", 245000.0, 18.0, "UNPAID"),
    ]
    for p, amt, cons, st in periods:
        db.add(Invoice(
            meter_id=1,
            reading_id=rd.id,
            billing_period=p,
            total_consumption=cons,
            subtotal_water=amt * 0.8,
            env_protection_fee=amt * 0.08,
            vat_amount=amt * 0.04,
            total_amount=amt,
            payment_status=st
        ))
    db.flush()

    abns = [
        Abnormality(meter_id=1, reading_id=None, report_type="CỬA KHÓA", description="[CỬA KHÓA] Không tiếp cận được mặt số", reported_by="NV-4881", status="PENDING"),
        Abnormality(meter_id=1, reading_id=None, report_type="Sai chỉ số nước", description="[Sai chỉ số nước] Chênh lệch chỉ số thực tế", reported_by="CUSTOMER", status="PENDING"),
        Abnormality(meter_id=1, reading_id=None, report_type="RÒ RỈ", description="[RÒ RỈ] Nghi ngờ rò rỉ sau đồng hồ", reported_by="NV-4881", status="RESOLVED"),
    ]
    db.add_all(abns)
    db.commit()

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    
    db = TestingSessionLocal()
    seed_test_data(db)
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    return TestClient(app)
