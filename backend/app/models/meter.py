from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class WaterMeter(Base):
    __tablename__ = "water_meters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meter_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # DH001245
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    
    # Customer Details
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)  # Nguyễn Văn An
    customer_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)  # 123 Nguyễn Trãi, P. Bến Nghé, Quận 1
    
    # Technical specs
    meter_size: Mapped[str] = mapped_column(String(50), default="15mm")
    meter_type: Mapped[str] = mapped_column(String(100), default="HỘ GIA ĐÌNH SINH HOẠT")  # HỘ GIA ĐÌNH SINH HOẠT, CÔNG NGHIỆP...
    standard_tier_limit: Mapped[float] = mapped_column(Float, default=20.0)  # 20 m3
    
    # Readings state
    previous_index: Mapped[float] = mapped_column(Float, default=0.0)  # 1240.0
    previous_reading_date: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow)
    current_index: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 1258.0
    reading_status: Mapped[str] = mapped_column(String(50), default="PENDING")  # PENDING, RECORDED, LOCKED, ABNORMAL
    
    # Field conditions / priority notice
    is_priority: Mapped[bool] = mapped_column(Boolean, default=False)
    priority_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Khóa cổng hẹn ca chiều, Tiêu thụ tăng vọt (+280%)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    route: Mapped["Route"] = relationship("Route", back_populates="meters")
    readings: Mapped[List["MeterReading"]] = relationship("MeterReading", back_populates="meter")
    images: Mapped[List["MeterImage"]] = relationship("MeterImage", back_populates="meter")
    ai_recognitions: Mapped[List["AIRecognition"]] = relationship("AIRecognition", back_populates="meter")
    abnormalities: Mapped[List["Abnormality"]] = relationship("Abnormality", back_populates="meter")
