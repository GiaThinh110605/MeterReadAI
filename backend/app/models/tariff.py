from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Tariff(Base):
    __tablename__ = "tariffs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tariff_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # SH_2025
    name: Mapped[str] = mapped_column(String(255), nullable=False)  # Biểu tính đơn giá bậc thang sinh hoạt
    customer_type: Mapped[str] = mapped_column(String(100), default="HỘ GIA ĐÌNH SINH HOẠT")
    is_active: Mapped[bool] = mapped_column(default=True)
    effective_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tiers: Mapped[List["TariffTier"]] = relationship("TariffTier", back_populates="tariff", order_by="TariffTier.tier_order")

class TariffTier(Base):
    __tablename__ = "tariff_tiers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tariff_id: Mapped[int] = mapped_column(ForeignKey("tariffs.id", ondelete="CASCADE"), nullable=False)
    tier_order: Mapped[int] = mapped_column(Integer, nullable=False)  # 1, 2, 3, 4
    tier_name: Mapped[str] = mapped_column(String(100), nullable=False)  # Bậc 1 (≤10 m³), Bậc 2 (10-20 m³)...
    min_volume: Mapped[float] = mapped_column(Float, default=0.0)  # 0
    max_volume: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 10.0 (None for infinity)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)  # 6700.0, 7000.0, 8500.0, 15000.0

    tariff: Mapped["Tariff"] = relationship("Tariff", back_populates="tiers")

class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meter_id: Mapped[int] = mapped_column(ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False)
    reading_id: Mapped[int] = mapped_column(ForeignKey("meter_readings.id", ondelete="CASCADE"), nullable=False)
    billing_period: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # 2025-04
    
    total_consumption: Mapped[float] = mapped_column(Float, nullable=False)
    subtotal_water: Mapped[float] = mapped_column(Float, nullable=False)  # Tổng tiền nước sạch các bậc
    env_protection_fee: Mapped[float] = mapped_column(Float, nullable=False)  # Phí BVMT 10%
    vat_amount: Mapped[float] = mapped_column(Float, nullable=False)  # VAT 5%
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)  # Tổng thanh toán
    payment_status: Mapped[str] = mapped_column(String(50), default="UNPAID")  # UNPAID, PAID
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tier_details: Mapped[List["InvoiceTierDetail"]] = relationship("InvoiceTierDetail", back_populates="invoice")

class InvoiceTierDetail(Base):
    """Snapshot chi tiết từng bậc tính tiền tại thời điểm lập hóa đơn."""
    __tablename__ = "invoice_tier_details"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    tier_order: Mapped[int] = mapped_column(Integer, nullable=False)
    tier_name: Mapped[str] = mapped_column(String(100), nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)  # Số m3 tính cho bậc này
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="tier_details")
