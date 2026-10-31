from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class MeterReading(Base):
    __tablename__ = "meter_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meter_id: Mapped[int] = mapped_column(ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False)
    billing_period: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # e.g., 2025-04
    
    previous_index: Mapped[float] = mapped_column(Float, nullable=False)
    confirmed_index: Mapped[float] = mapped_column(Float, nullable=False)
    consumption: Mapped[float] = mapped_column(Float, nullable=False)  # confirmed_index - previous_index
    
    # Audit trail (Chuỗi bằng chứng kiểm toán)
    is_modified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    original_ai_value: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # Chuỗi gốc của AI (bảo toàn số 0)
    correction_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Bắt buộc khi is_modified = True
    
    reading_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    recorded_by: Mapped[str] = mapped_column(String(100), nullable=False)  # Mã nhân viên, e.g. NV-4881
    reading_status: Mapped[str] = mapped_column(String(50), default="CONFIRMED")  # CONFIRMED, CORRECTED, SUBMITTED
    
    meter: Mapped["WaterMeter"] = relationship("WaterMeter", back_populates="readings")
    images: Mapped[list["MeterImage"]] = relationship("MeterImage", back_populates="reading")
    abnormalities: Mapped[list["Abnormality"]] = relationship("Abnormality", back_populates="reading")

class MeterImage(Base):
    __tablename__ = "meter_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meter_id: Mapped[int] = mapped_column(ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False)
    reading_id: Mapped[Optional[int]] = mapped_column(ForeignKey("meter_readings.id", ondelete="SET NULL"), nullable=True)
    
    original_image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    cropped_image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    gps_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # e.g. 10.7769
    gps_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # e.g. 106.7009

    meter: Mapped["WaterMeter"] = relationship("WaterMeter", back_populates="images")
    reading: Mapped[Optional["MeterReading"]] = relationship("MeterReading", back_populates="images")
    ai_recognition: Mapped[Optional["AIRecognition"]] = relationship("AIRecognition", back_populates="image", uselist=False)

class AIRecognition(Base):
    """Kết quả dự đoán AI - BẤT BIẾN (IMMUTABLE), không bao giờ bị ghi đè."""
    __tablename__ = "ai_recognitions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meter_id: Mapped[int] = mapped_column(ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False)
    image_id: Mapped[Optional[int]] = mapped_column(ForeignKey("meter_images.id", ondelete="SET NULL"), nullable=True)
    
    # BẮT BUỘC: Chuỗi số lưu String để bảo toàn số 0 ở đầu (ví dụ: '01258')
    predicted_sequence: Mapped[str] = mapped_column(String(50), nullable=False)
    numerical_value: Mapped[float] = mapped_column(Float, nullable=False)
    detection_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    recognition_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    model_version: Mapped[str] = mapped_column(String(100), default="yolo11n-seg-crnn-v2.1")
    polygon_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Tọa độ polygon dạng JSON
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    meter: Mapped["WaterMeter"] = relationship("WaterMeter", back_populates="ai_recognitions")
    image: Mapped[Optional["MeterImage"]] = relationship("MeterImage", back_populates="ai_recognition")

class Abnormality(Base):
    __tablename__ = "abnormalities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meter_id: Mapped[int] = mapped_column(ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False)
    reading_id: Mapped[Optional[int]] = mapped_column(ForeignKey("meter_readings.id", ondelete="SET NULL"), nullable=True)
    
    report_type: Mapped[str] = mapped_column(String(100), nullable=False)  # LOCKED_DOOR, BROKEN_GLASS, BROKEN_SEAL, NEGATIVE_CONSUMPTION, LEAK_SUSPECTED
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reported_by: Mapped[str] = mapped_column(String(100), nullable=False)  # Mã nhân viên
    status: Mapped[str] = mapped_column(String(50), default="PENDING")  # PENDING, RESOLVED
    reported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    meter: Mapped["WaterMeter"] = relationship("WaterMeter", back_populates="abnormalities")
    reading: Mapped[Optional["MeterReading"]] = relationship("MeterReading", back_populates="abnormalities")
