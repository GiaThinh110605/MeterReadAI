from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # A01, A02
    route_name: Mapped[str] = mapped_column(String(255), nullable=False)  # Tuyến A01 – Phường Bến Nghé, Quận 1
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Trục Nguyễn Du - Nguyễn Trãi
    ward: Mapped[str] = mapped_column(String(100), nullable=False)  # Phường Bến Nghé
    district: Mapped[str] = mapped_column(String(100), default="Quận 1", nullable=False)
    total_meters: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS")  # IN_PROGRESS, PAUSED, COMPLETED
    priority_order: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    assignments: Mapped[List["RouteAssignment"]] = relationship("RouteAssignment", back_populates="route")
    meters: Mapped[List["WaterMeter"]] = relationship("WaterMeter", back_populates="route")

class RouteAssignment(Base):
    __tablename__ = "route_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    route_id: Mapped[int] = mapped_column(ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    billing_period: Mapped[str] = mapped_column(String(20), default="2025-04", index=True, nullable=False)  # 2025-04
    assigned_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    priority: Mapped[int] = mapped_column(Integer, default=1)  # 1: Ưu tiên số 1, 2: Tuyến kế tiếp
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS")  # IN_PROGRESS, PAUSED, COMPLETED

    route: Mapped["Route"] = relationship("Route", back_populates="assignments")
    employee: Mapped["Employee"] = relationship("Employee", back_populates="route_assignments")
