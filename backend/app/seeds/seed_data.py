from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, Employee
from app.models.route import Route, RouteAssignment
from app.models.meter import WaterMeter
from app.models.tariff import Tariff, TariffTier, Invoice, InvoiceTierDetail
from app.models.reading import MeterReading, MeterImage, AIRecognition, Abnormality

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Users & Employees
        user_tuann = db.query(User).filter(User.email == "nguyentuan@waterflow.vn").first()
        if not user_tuann:
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

        emp1 = db.query(Employee).filter(Employee.employee_code == "NV-4881").first()
        if not emp1:
            emp1 = Employee(
                user_id=user_tuann.id,
                employee_code="NV-4881",
                team_name="Tổ Ghi Số Quận 1",
                assigned_area="Quận 1, TP. Hồ Chí Minh"
            )
            db.add(emp1)
            db.flush()

        admin_user = db.query(User).filter(User.email == "admin@waterflow.vn").first()
        if not admin_user:
            admin_user = User(
                email="admin@waterflow.vn",
                hashed_password="mock_hashed_password",
                full_name="Nguyễn Thành Nam",
                phone="0901.289.999",
                role="ADMIN",
                is_active=True
            )
            db.add(admin_user)
            db.flush()

        # 2. Routes
        route_a01 = db.query(Route).filter(Route.id == 1).first()
        if not route_a01:
            route_a01 = Route(
                id=1,
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
            db.flush()

        route_a02 = db.query(Route).filter(Route.route_code == "A02").first()
        if not route_a02:
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

        # Assignments
        if not db.query(RouteAssignment).filter(RouteAssignment.route_id == route_a01.id).first():
            db.add(RouteAssignment(route_id=route_a01.id, employee_id=emp1.id, billing_period="2025-04", priority=1, status="IN_PROGRESS"))
        if not db.query(RouteAssignment).filter(RouteAssignment.route_id == route_a02.id).first():
            db.add(RouteAssignment(route_id=route_a02.id, employee_id=emp1.id, billing_period="2025-04", priority=2, status="PAUSED"))
        db.flush()

        # Additional Routes
        for r_idx in range(3, 10):
            if not db.query(Route).filter(Route.route_code == f"A{r_idx:02d}").first():
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

        # 3. Water Meters for Route A01
        if db.query(WaterMeter).count() == 0:
            real_customers = [
                ("Nguyễn Văn An", "121 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0912.345.678", 1240.0, 1258.0, "RECORDED", True, "Khóa cổng hẹn ca chiều"),
                ("Trần Thị Mai", "123 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0903.456.789", 1240.0, None, "LOCKED", True, "Cửa khóa 2 lớp, không tiếp cận được"),
                ("Lê Hoàng Nam", "125 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0987.654.321", 0.0, None, "PENDING", True, "Đồng hồ mới P-MAX cần ghi số"),
                ("Phạm Quốc Tuấn", "127 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0944.555.666", 0.0, None, "PENDING", False, None),
                ("Hoàng Kim Ngân", "129 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0911.222.333", 312.0, 342.0, "RECORDED", False, None),
                ("Vũ Đình Trọng", "131 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0938.111.222", 450.0, None, "PENDING", False, None),
                ("Đỗ Thị Bích Ngọc", "133 Nguyễn Trãi, Phường Bến Nghé, Quận 1", "0908.777.888", 620.0, 710.0, "RECORDED", False, None),
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

        # 4. Tariffs
        if db.query(Tariff).count() == 0:
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
            db.flush()

        # 5. Invoices & Readings
        if db.query(MeterReading).count() <= 1:
            # Seed readings for multiple customers
            sample_readings = [
                (1, 1240.0, 1258.0, 18.0, "NV-4881", "2026-09"),
                (5, 312.0, 342.0, 30.0, "NV-4881", "2026-09"),
                (7, 620.0, 710.0, 90.0, "NV-4881", "2026-09"),
                (8, 780.0, 798.0, 18.0, "NV-4881", "2026-09"),
                (9, 890.0, 908.0, 18.0, "NV-4881", "2026-09"),
                (10, 950.0, 966.0, 16.0, "NV-4881", "2026-09"),
            ]
            for m_id, prev_v, conf_v, cons_v, rec_by, bp in sample_readings:
                existing_rd = db.query(MeterReading).filter(MeterReading.meter_id == m_id, MeterReading.billing_period == bp).first()
                if not existing_rd:
                    new_rd = MeterReading(
                        meter_id=m_id,
                        billing_period=bp,
                        previous_index=prev_v,
                        confirmed_index=conf_v,
                        consumption=cons_v,
                        recorded_by=rec_by
                    )
                    db.add(new_rd)
            db.flush()

            # Ensure Invoices for Meter 1
            if db.query(Invoice).filter(Invoice.meter_id == 1).count() == 0:
                rd1 = db.query(MeterReading).filter(MeterReading.meter_id == 1).first()
                periods = [
                    ("2026-06", 204000.0, 15.0, "PAID"),
                    ("2026-07", 272000.0, 20.0, "PAID"),
                    ("2026-08", 218000.0, 16.0, "PAID"),
                    ("2026-09", 245000.0, 18.0, "UNPAID"),
                ]
                for p, amt, cons, st in periods:
                    inv = Invoice(
                        meter_id=1,
                        reading_id=rd1.id if rd1 else None,
                        billing_period=p,
                        total_consumption=cons,
                        subtotal_water=amt * 0.8,
                        env_protection_fee=amt * 0.08,
                        vat_amount=amt * 0.04,
                        total_amount=amt,
                        payment_status=st
                    )
                    db.add(inv)
                db.flush()

        # 6. Meter Images
        if db.query(MeterImage).count() == 0:
            meter_img_samples = [
                (1, "/uploads/raw/1_bee59a99_raw.jpg", "/uploads/crop/1_bee59a99_crop.jpg", "01258", 1258.0),
                (2, "/uploads/raw/2_6d12dd15_raw.jpg", "/uploads/crop/2_6d12dd15_crop.jpg", "01240", 1240.0),
                (5, "/uploads/raw/1_31d7c35b_raw.jpg", "/uploads/crop/1_31d7c35b_crop.jpg", "00342", 342.0),
                (7, "/uploads/raw/7_81cd5f6c_raw.jpg", "/uploads/crop/7_81cd5f6c_crop.jpg", "00710", 710.0),
                (8, "/uploads/raw/3_57cb2efe_raw.jpg", "/uploads/crop/test_3_57cb2efe_raw.jpg", "00798", 798.0),
                (10, "/uploads/raw/1_140fb33e_raw.jpg", "/uploads/crop/1_140fb33e_crop.jpg", "00966", 966.0),
            ]
            for m_id, raw_url, crop_url, seq, num_v in meter_img_samples:
                rd = db.query(MeterReading).filter(MeterReading.meter_id == m_id).first()
                mi = MeterImage(
                    meter_id=m_id,
                    reading_id=rd.id if rd else None,
                    original_image_url=raw_url,
                    cropped_image_url=crop_url,
                    captured_at=datetime.utcnow(),
                    gps_latitude=10.7769,
                    gps_longitude=106.7009
                )
                db.add(mi)
                db.flush()

                ai_rec = AIRecognition(
                    meter_id=m_id,
                    image_id=mi.id,
                    predicted_sequence=seq,
                    numerical_value=num_v,
                    detection_confidence=0.985,
                    recognition_confidence=0.985,
                    model_version="yolo11n-seg-crnn-v2.1",
                    created_at=datetime.utcnow()
                )
                db.add(ai_rec)
            db.flush()

        # 7. Abnormalities / Complaints (Distribute realistically to distinct customers)
        all_abns = db.query(Abnormality).all()
        # If all existing abnormalities belong to meter 1, reset them to distinct customers
        if len(all_abns) <= 4 and all(a.meter_id == 1 for a in all_abns):
            for a in all_abns:
                db.delete(a)
            db.flush()

            real_abnormalities = [
                Abnormality(
                    id=1,
                    meter_id=2,  # Trần Thị Mai - DH001246
                    reading_id=None,
                    report_type="CỬA KHÓA",
                    description="[CỬA KHÓA] Cửa khóa 2 lớp, không tiếp cận được mặt số trong ca ghi",
                    reported_by="NV-4881",
                    status="PENDING",
                    reported_at=datetime(2026, 11, 4, 16, 3)
                ),
                Abnormality(
                    id=2,
                    meter_id=5,  # Hoàng Kim Ngân - DH001249
                    reading_id=None,
                    report_type="Sai chỉ số nước",
                    description="[Sai chỉ số nước] Hóa đơn ghi nhận 342 m³, ảnh chụp đối chiếu thực tế là 322 m³. Sai lệch 20 m³.",
                    reported_by="CUSTOMER",
                    status="PENDING",
                    reported_at=datetime(2026, 11, 4, 16, 3)
                ),
                Abnormality(
                    id=3,
                    meter_id=7,  # Đỗ Thị Bích Ngọc - DH001251
                    reading_id=None,
                    report_type="RÒ RỈ",
                    description="[RÒ RỈ] Nghi ngờ rò rỉ sau đồng hồ: Tiêu thụ 90 m³ tăng đột biến so với mức bình quân 25 m³/tháng.",
                    reported_by="NV-4881",
                    status="RESOLVED",
                    reported_at=datetime(2026, 11, 4, 16, 3)
                ),
                Abnormality(
                    id=4,
                    meter_id=10,  # Trương Văn Hưng - DH001254
                    reading_id=None,
                    report_type="MẶT KÍNH MỜ",
                    description="[MẶT KÍNH MỜ] Mặt kính đồng hồ bị ố vàng, đọng sương mờ không nhìn rõ số cuối.",
                    reported_by="NV-4881",
                    status="PENDING",
                    reported_at=datetime(2026, 11, 4, 16, 34)
                ),
            ]
            db.add_all(real_abnormalities)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
