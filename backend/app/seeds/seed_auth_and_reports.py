"""
Dữ liệu mẫu cho phân hệ Xác thực (UI 1, 2) và Thống kê Admin (UI 12, 18).

- Tài khoản demo cho 3 vai trò (mật khẩu được băm bcrypt, CHỈ dùng cho môi trường dev/demo):
    ADMIN     admin@waterflow.vn       / Admin@123
    READER    nguyentuan@waterflow.vn  / Reader@123   (NV-4881)
    READER    lethihanh@waterflow.vn   / Reader@123   (NV-5102)
    CUSTOMER  khachhang@waterflow.vn   / Customer@123
- Lịch sử 5 kỳ trước kỳ hiện hành (lượt ghi + hóa đơn + sự cố đã xử lý) để biểu đồ có số liệu.
  Tắt bằng biến môi trường SEED_REPORT_DEMO=0.

Hàm idempotent: chạy lại nhiều lần không nhân bản dữ liệu.
"""
import os
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.meter import WaterMeter
from app.models.reading import Abnormality, AIRecognition, MeterReading
from app.models.tariff import Invoice, InvoiceTierDetail
from app.models.user import Employee, User
from app.schemas.auth import normalize_phone
from app.services.tariff_service import TariffService

DEMO_ACCOUNTS = [
    {"email": "admin@waterflow.vn", "password": "Admin@123", "full_name": "Quản trị viên WaterFlow",
     "phone": "0281234567", "role": "ADMIN"},
    {"email": "nguyentuan@waterflow.vn", "password": "Reader@123", "full_name": "Nguyễn Tuấn",
     "phone": "0909.123.456", "role": "READER", "employee_code": "NV-4881"},
    {"email": "lethihanh@waterflow.vn", "password": "Reader@123", "full_name": "Lê Thị Hạnh",
     "phone": "0938765432", "role": "READER", "employee_code": "NV-5102"},
    {"email": "khachhang@waterflow.vn", "password": "Customer@123", "full_name": "Nguyễn Văn An",
     "phone": "0912345678", "role": "CUSTOMER"},
]

# 5 kỳ lịch sử trước kỳ hiện hành 2025-04
CURRENT_PERIOD = "2025-04"
HISTORY_PERIODS = ["2024-11", "2024-12", "2025-01", "2025-02", "2025-03"]

# Mức tiêu thụ cơ sở (m³/kỳ) theo loại khách hàng
BASE_CONSUMPTION = {"HỘ GIA ĐÌNH SINH HOẠT": 16.0, "KINH DOANH DỊCH VỤ": 45.0, "SẢN XUẤT": 90.0}
SEASON_FACTOR = {"2024-11": 0.92, "2024-12": 0.97, "2025-01": 1.08, "2025-02": 1.0, "2025-03": 1.12}


def seed_accounts(db: Session) -> None:
    for acc in DEMO_ACCOUNTS:
        user = db.query(User).filter(User.email == acc["email"]).first()
        if user is None:
            user = User(
                email=acc["email"],
                hashed_password=hash_password(acc["password"]),
                full_name=acc["full_name"],
                phone=normalize_phone(acc["phone"]),
                role=acc["role"],
                is_active=True,
            )
            db.add(user)
            db.flush()
        elif not user.hashed_password.startswith("$2"):
            # Tài khoản seed cũ dùng "mock_hashed_password" -> thay bằng hash bcrypt thật
            user.hashed_password = hash_password(acc["password"])
        # Chuẩn hóa SĐT để đăng nhập bằng số điện thoại không phụ thuộc dấu chấm
        user.phone = normalize_phone(user.phone) if user.phone else user.phone

        code = acc.get("employee_code")
        if code and db.query(Employee).filter(Employee.employee_code == code).first() is None:
            db.add(Employee(user_id=user.id, employee_code=code))
    db.commit()


def _consumption_for(meter: WaterMeter, period: str) -> float:
    base = BASE_CONSUMPTION.get(meter.meter_type, 16.0)
    # Dao động ±25% cố định theo id đồng hồ để số liệu ổn định giữa các lần seed
    jitter = ((meter.id * 37 + int(period[-2:]) * 11) % 50 - 25) / 100
    return round(base * SEASON_FACTOR[period] * (1 + jitter))


def seed_report_demo(db: Session) -> None:
    if os.getenv("SEED_REPORT_DEMO", "1") == "0":
        return
    if db.query(MeterReading).filter(MeterReading.billing_period.in_(HISTORY_PERIODS)).first():
        return

    meters = db.query(WaterMeter).order_by(WaterMeter.id).all()
    for meter in meters:
        reader_code = "NV-4881" if meter.route_id == 1 else "NV-5102"
        usages = [_consumption_for(meter, p) for p in HISTORY_PERIODS]
        # Lần ngược từ chỉ số cũ hiện tại để chuỗi chỉ số liên tục; bỏ đồng hồ nào không đủ dữ liệu
        start_index = meter.previous_index - sum(usages)
        history = HISTORY_PERIODS if start_index >= 0 else []

        index = start_index
        for n, (period, usage) in enumerate(zip(history, usages)):
            reading_date = datetime.strptime(period + "-15 09:00", "%Y-%m-%d %H:%M")
            confirmed = index + usage
            ai_value = confirmed
            is_modified = (meter.id + n) % 9 == 0
            if is_modified:
                ai_value = confirmed + 1  # AI đọc lệch 1 đơn vị ở chữ số cuối

            reading = MeterReading(
                meter_id=meter.id,
                billing_period=period,
                previous_index=index,
                confirmed_index=confirmed,
                consumption=usage,
                is_modified=is_modified,
                original_ai_value=f"{int(ai_value):05d}",
                correction_reason="Chữ số cuối bị lóa sáng, nhân viên đối chiếu mắt thường" if is_modified else None,
                reading_date=reading_date,
                recorded_by=reader_code,
                reading_status="CORRECTED" if is_modified else "CONFIRMED",
            )
            db.add(reading)
            db.flush()

            db.add(AIRecognition(
                meter_id=meter.id,
                predicted_sequence=f"{int(ai_value):05d}",
                numerical_value=float(ai_value),
                detection_confidence=0.97,
                recognition_confidence=0.71 if is_modified else 0.95,
                created_at=reading_date,
            ))

            bill = TariffService.calculate_water_bill(usage)
            # Kỳ gần nhất còn ~1/4 hóa đơn chưa thu, các kỳ cũ gần như đã thu đủ
            unpaid = (period == "2025-03" and meter.id % 4 == 0) or (period == "2025-02" and meter.id % 10 == 0)
            invoice = Invoice(
                meter_id=meter.id,
                reading_id=reading.id,
                billing_period=period,
                total_consumption=usage,
                subtotal_water=bill.waterAmount,
                env_protection_fee=bill.envFee,
                vat_amount=bill.vatAmount,
                total_amount=bill.totalAmount,
                payment_status="UNPAID" if unpaid else "PAID",
                created_at=reading_date,
            )
            db.add(invoice)
            db.flush()
            db.add_all([
                InvoiceTierDetail(
                    invoice_id=invoice.id,
                    tier_order=t.tierOrder,
                    tier_name=t.tierName,
                    volume=t.volume,
                    unit_price=t.unitPrice,
                    amount=t.amount,
                )
                for t in bill.tiers if t.volume > 0
            ])
            index = confirmed

        # Kỳ hiện hành: đồng hồ seed đã ở trạng thái RECORDED thì phải có lượt ghi tương ứng
        # (chưa lập hóa đơn vì kỳ chưa chốt)
        if meter.reading_status == "RECORDED" and meter.current_index is not None:
            usage = meter.current_index - meter.previous_index
            db.add(MeterReading(
                meter_id=meter.id,
                billing_period=CURRENT_PERIOD,
                previous_index=meter.previous_index,
                confirmed_index=meter.current_index,
                consumption=usage,
                is_modified=False,
                original_ai_value=f"{int(meter.current_index):05d}",
                reading_date=datetime.strptime(CURRENT_PERIOD + "-14 10:00", "%Y-%m-%d %H:%M"),
                recorded_by=reader_code,
                reading_status="CONFIRMED",
            ))

    abnormal_samples = [
        ("2024-12-10 10:20", "BROKEN_GLASS", "Mặt kính đồng hồ bị nứt, mờ chữ số"),
        ("2025-01-14 08:45", "LOCKED_DOOR", "Nhà đóng cửa, không tiếp cận được đồng hồ"),
        ("2025-02-18 14:10", "LEAK_SUSPECTED", "Nghi rò rỉ sau đồng hồ, kim quay khi khóa vòi"),
        ("2025-03-05 09:30", "LOCKED_DOOR", "Chủ nhà đi vắng, hẹn ghi bù"),
        ("2025-03-21 15:00", "BROKEN_SEAL", "Niêm chì bị đứt, nghi tác động trái phép"),
    ]
    for i, (when, kind, desc) in enumerate(abnormal_samples):
        meter = meters[(i * 7) % len(meters)]
        db.add(Abnormality(
            meter_id=meter.id,
            report_type=kind,
            description=desc,
            reported_by="NV-4881" if meter.route_id == 1 else "NV-5102",
            status="RESOLVED",
            reported_at=datetime.strptime(when, "%Y-%m-%d %H:%M"),
        ))
    db.commit()


def seed_accounts_and_reports(db: Session) -> None:
    seed_accounts(db)
    seed_report_demo(db)
