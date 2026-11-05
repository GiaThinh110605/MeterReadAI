from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.meter import WaterMeter
from app.models.reading import MeterReading, MeterImage, Abnormality
from app.models.tariff import Invoice, InvoiceTierDetail
from app.models.user import User
from app.services.tariff_service import TariffService
from app.schemas.customer import (
    CustomerOverviewResponse,
    CurrentBillInfo,
    MeterStats,
    MonthConsumption,
    InvoiceDetailResponse,
    InvoiceTierItem,
    ComplaintCreateRequest,
    ComplaintTicketResponse,
)

router = APIRouter(prefix="/customer", tags=["Cổng Khách Hàng"])

@router.get("/overview", response_model=CustomerOverviewResponse)
def get_customer_overview(db: Session = Depends(get_db), meter_code: Optional[str] = "DH001245"):
    meter = db.query(WaterMeter).filter(WaterMeter.meter_code == meter_code).first()
    if not meter:
        meter = db.query(WaterMeter).first()
    
    if not meter:
        return CustomerOverviewResponse(
            customerName="Khách hàng",
            customerCode="KH-0001",
            meterCode="Chưa gắn đồng hồ",
            meterSerial="N/A",
            address="Chưa có địa chỉ lắp đặt đồng hồ",
            currentBill=CurrentBillInfo(
                period="Kỳ hiện tại",
                amount=0.0,
                consumption=0.0,
                dueDate="N/A",
                status="PAID",
            ),
            stats=MeterStats(
                consumption=0.0,
                diffText="Chưa có chỉ số",
                currentIndex=0.0,
                currentDate="Chưa ghi nhận",
                previousIndex=0.0,
                previousDate="Chưa có kỳ trước",
            ),
            chartData=[],
            latestInvoice=None,
            latestPhoto=None,
        )

    curr_idx = meter.current_index if meter.current_index is not None else meter.previous_index
    prev_idx = meter.previous_index
    consumption = max(0.0, round(curr_idx - prev_idx, 2))

    latest_inv = db.query(Invoice).filter(Invoice.meter_id == meter.id).order_by(Invoice.id.desc()).first()
    if latest_inv:
        amount = latest_inv.total_amount
        period_str = f"Tháng {latest_inv.billing_period}"
        pay_status = latest_inv.payment_status
    else:
        calc = TariffService.calculate_water_bill(consumption)
        amount = float(calc.totalAmount)
        period_str = "Kỳ hiện tại"
        pay_status = "UNPAID" if consumption > 0 else "PAID"

    # Get recent readings for chart
    past_readings = (
        db.query(MeterReading)
        .filter(MeterReading.meter_id == meter.id)
        .order_by(MeterReading.id.asc())
        .limit(6)
        .all()
    )
    chart_data: List[MonthConsumption] = []
    for r in past_readings:
        chart_data.append(MonthConsumption(
            month=r.billing_period[-5:],
            consumption=r.consumption,
            isCurrent=False
        ))
    if not chart_data and consumption > 0:
        chart_data.append(MonthConsumption(month="Hiện tại", consumption=consumption, isCurrent=True))

    latest_photo = None
    latest_reading = (
        db.query(MeterReading)
        .filter(MeterReading.meter_id == meter.id)
        .order_by(MeterReading.id.desc())
        .first()
    )
    latest_img = (
        db.query(MeterImage)
        .filter(MeterImage.meter_id == meter.id)
        .order_by(MeterImage.id.desc())
        .first()
    )
    img_url = latest_img.original_image_url if latest_img else "/uploads/raw/1_bee59a99_raw.jpg"

    if latest_reading and latest_reading.reading_date:
        latest_photo = {
            "imageUrl": img_url,
            "readingIndex": latest_reading.confirmed_index,
            "capturedDate": latest_reading.reading_date.strftime("%d/%m/%Y"),
        }

    return CustomerOverviewResponse(
        customerName=meter.customer_name or "Khách hàng",
        customerCode=f"KH{meter.id:06d}",
        meterCode=meter.meter_code,
        meterSerial=f"WF-{meter.meter_code}",
        address=meter.address,
        currentBill=CurrentBillInfo(
            period=period_str,
            amount=amount,
            consumption=consumption,
            dueDate="05 hàng tháng",
            status=pay_status,
        ),
        stats=MeterStats(
            consumption=consumption,
            diffText=f"+{consumption} m³ trong kỳ" if consumption > 0 else "0 m³",
            currentIndex=curr_idx,
            currentDate="Ghi nhận gần nhất",
            previousIndex=prev_idx,
            previousDate="Kỳ trước",
        ),
        chartData=chart_data,
        latestInvoice={
            "period": period_str,
            "amount": amount,
            "status": pay_status,
        } if latest_inv else None,
        latestPhoto=latest_photo,
    )

@router.get("/invoices", response_model=List[InvoiceDetailResponse])
def get_customer_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).order_by(Invoice.id.desc()).all()
    results: List[InvoiceDetailResponse] = []
    
    for inv in invoices:
        meter = db.query(WaterMeter).filter(WaterMeter.id == inv.meter_id).first()
        reading = db.query(MeterReading).filter(MeterReading.id == inv.reading_id).first()
        prev_idx = reading.previous_index if reading else (meter.previous_index if meter else 0.0)
        curr_idx = reading.confirmed_index if reading else (meter.current_index if meter and meter.current_index else 0.0)

        tier_items: List[InvoiceTierItem] = []
        if inv.tier_details:
            for td in inv.tier_details:
                tier_items.append(InvoiceTierItem(
                    tierOrder=td.tier_order,
                    name=td.tier_name,
                    volume=td.volume,
                    unitPrice=td.unit_price,
                    amount=td.amount
                ))
        else:
            calc = TariffService.calculate_water_bill(inv.total_consumption)
            for t in calc.tiers:
                tier_items.append(InvoiceTierItem(
                    tierOrder=t.tierOrder,
                    name=t.tierName,
                    volume=t.volume,
                    unitPrice=t.unitPrice,
                    amount=t.amount
                ))

        created_str = inv.created_at.strftime("%d/%m/%Y") if inv.created_at else "28/09/2026"
        inv_code = f"#HD{inv.billing_period.replace('-', '')}{inv.id:03d}"

        meter_img = (
            db.query(MeterImage)
            .filter(MeterImage.meter_id == inv.meter_id)
            .order_by(MeterImage.id.desc())
            .first()
        )
        photo_url = meter_img.original_image_url if meter_img else "/uploads/raw/1_bee59a99_raw.jpg"

        results.append(InvoiceDetailResponse(
            id=inv.id,
            invoiceCode=inv_code,
            period=f"Tháng {inv.billing_period}",
            amount=inv.total_amount,
            volume=inv.total_consumption,
            dueDate="05 hàng tháng",
            paidDate=created_str if inv.payment_status == "PAID" else None,
            status=inv.payment_status,
            previousIndex=prev_idx,
            currentIndex=curr_idx,
            diffVolume=0.0,
            subtotalWater=inv.subtotal_water,
            taxAndEnvFee=inv.env_protection_fee + inv.vat_amount,
            recordedBy=reading.recorded_by if reading else "Nhân viên ghi số",
            recordedAt=created_str,
            meterSerial=meter.meter_code if meter else "WF-METER",
            photoUrl=photo_url,
            isAutoVerified=True,
            tiers=tier_items
        ))

    return results

@router.post("/invoices/{invoice_id}/pay")
def pay_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if inv:
        inv.payment_status = "PAID"
        db.commit()

    return {
        "invoiceId": invoice_id,
        "paymentStatus": "PAID",
        "paidAt": datetime.utcnow().isoformat(),
        "message": "Thanh toán hóa đơn tiền nước thành công",
    }

@router.get("/complaints", response_model=List[ComplaintTicketResponse])
def get_complaints(db: Session = Depends(get_db)):
    abnormalities = db.query(Abnormality).order_by(Abnormality.id.desc()).all()
    results: List[ComplaintTicketResponse] = []

    for abn in abnormalities:
        ticket_type = "Khiếu nại khách hàng"
        content_text = abn.description
        if abn.description.startswith("[") and "]" in abn.description:
            parts = abn.description.split("]", 1)
            ticket_type = parts[0].replace("[", "").strip()
            content_text = parts[1].strip()
        elif abn.report_type:
            ticket_type = abn.report_type

        status_display = "RESOLVED" if abn.status in ["RESOLVED", "PROCESSED"] else "PROCESSING"
        created_str = abn.reported_at.strftime("%d/%m/%Y %H:%M") if abn.reported_at else "Hôm nay"

        results.append(ComplaintTicketResponse(
            id=abn.id,
            ticketCode=f"KN{abn.id:05d}",
            ticketType=ticket_type,
            status=status_display,
            invoiceCode=None,
            content=content_text,
            createdAt=created_str,
            hasImage=False,
            resolutionNote="Đã xử lý xong" if status_display == "RESOLVED" else None,
        ))

    return results

@router.post("/complaints", response_model=ComplaintTicketResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(request: ComplaintCreateRequest, db: Session = Depends(get_db)):
    first_meter = db.query(WaterMeter).first()
    meter_id = first_meter.id if first_meter else None

    abnormality = Abnormality(
        meter_id=meter_id,
        report_type="CUSTOMER_COMPLAINT",
        description=f"[{request.ticketType}] {request.content}",
        reported_by="CUSTOMER",
        status="PENDING",
    )
    db.add(abnormality)
    db.commit()
    db.refresh(abnormality)

    return ComplaintTicketResponse(
        id=abnormality.id,
        ticketCode=f"KN{abnormality.id:05d}",
        ticketType=request.ticketType,
        status="PROCESSING",
        invoiceCode=request.invoiceCode,
        content=request.content,
        createdAt="Vừa xong",
        hasImage=bool(request.imageUrl),
    )
