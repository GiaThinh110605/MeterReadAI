import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, Employee
from app.models.route import Route, RouteAssignment
from app.models.meter import WaterMeter
from app.models.tariff import Tariff, TariffTier, Invoice, InvoiceTierDetail, TariffHistory
from app.models.reading import MeterReading, MeterImage, Abnormality, AIRecognition
from app.services.tariff_service import TariffService
from app.api.v1.auth import hash_password
from app.schemas.admin import (
    AdminOverviewStats,
    UrgentComplaint,
    AdminRoutesSummary,
    AdminRouteItem,
    CreateRouteRequest,
    RouteAssignRequest,
    RouteAssignResponse,
    AdminEmployeesSummary,
    AdminEmployeeItem,
    CreateEmployeeRequest,
    AdminInvoicesSummary,
    AdminInvoiceItem,
    CreateInvoiceRequest,
    UpdateInvoiceStatusRequest,
    AdminPricingData,
    AdminTariffTierItem,
    TariffHistoryItem,
    UpdateTierPriceRequest,
    CreateTariffRequest,
    AdminReportsData,
    MonthlyConsumptionItem,
    RouteReportItem,
    ComplaintListItem,
    ComplaintAuditDetail,
    ComplaintDecisionRequest,
    ComplaintStatsSummary,
)

router = APIRouter(prefix="/admin", tags=["Quản Trị Hệ Thống"])

@router.get("/overview", response_model=AdminOverviewStats)
def get_admin_overview(db: Session = Depends(get_db)):
    total_employees = db.query(Employee).count()
    online_employees = db.query(Employee).join(User).filter(User.is_active == True).count()

    total_routes = db.query(Route).count()
    assigned_routes = db.query(RouteAssignment.route_id).distinct().count()

    pending_abnormalities = db.query(Abnormality).filter(Abnormality.status == "PENDING").all()
    pending_complaints_count = len(pending_abnormalities)
    high_priority_count = sum(1 for a in pending_abnormalities if "Sai" in a.report_type or "rò rỉ" in a.report_type)

    urgent_list: List[UrgentComplaint] = []
    for abn in pending_abnormalities[:6]:
        meter = db.query(WaterMeter).filter(WaterMeter.id == abn.meter_id).first()
        customer_name = meter.customer_name if meter else "Khách hàng"
        meter_code = meter.meter_code if meter else "DH-0000"
        route_name = meter.route.route_name if meter and meter.route else "Tuyến địa bàn"
        
        pri = "HIGH" if ("Sai" in abn.report_type or "rò rỉ" in abn.report_type) else "NORMAL"
        urgent_list.append(UrgentComplaint(
            id=abn.id,
            customer_name=customer_name,
            meter_code=meter_code,
            route_name=route_name,
            issue_type=abn.report_type,
            description=abn.description,
            priority=pri,
            status=abn.status
        ))

    invoices = db.query(Invoice).all()
    total_invoices_month = len(invoices)
    paid_count = sum(1 for inv in invoices if inv.payment_status == "PAID")
    unpaid_count = sum(1 for inv in invoices if inv.payment_status == "UNPAID")
    overdue_count = sum(1 for inv in invoices if inv.payment_status == "OVERDUE")
    
    paid_amt = sum(inv.total_amount for inv in invoices if inv.payment_status == "PAID")
    unpaid_amt = sum(inv.total_amount for inv in invoices if inv.payment_status == "UNPAID")
    overdue_amt = sum(inv.total_amount for inv in invoices if inv.payment_status == "OVERDUE")
    total_rev = paid_amt + unpaid_amt + overdue_amt

    paid_pct = round(paid_amt / total_rev * 100, 1) if total_rev > 0 else 0.0
    unpaid_pct = round(unpaid_amt / total_rev * 100, 1) if total_rev > 0 else 0.0
    overdue_pct = round(overdue_amt / total_rev * 100, 1) if total_rev > 0 else 0.0

    return AdminOverviewStats(
        total_employees=total_employees,
        online_employees=online_employees,
        total_routes=total_routes,
        assigned_routes=assigned_routes,
        total_invoices_month=total_invoices_month,
        issue_percentage=100.0 if total_invoices_month > 0 else 0.0,
        pending_complaints=pending_complaints_count,
        high_priority_complaints=high_priority_count,
        billing_period="Kỳ hiện tại",
        total_revenue_expected=total_rev,
        paid_percentage=paid_pct,
        unpaid_percentage=unpaid_pct,
        overdue_percentage=overdue_pct,
        paid_amount=paid_amt,
        paid_count=paid_count,
        unpaid_amount=unpaid_amt,
        unpaid_count=unpaid_count,
        overdue_amount=overdue_amt,
        overdue_count=overdue_count,
        last_sync_time="Vừa đồng bộ",
        urgent_complaints=urgent_list
    )

@router.get("/routes", response_model=AdminRoutesSummary)
def get_admin_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).order_by(Route.route_code).all()
    total_routes = len(routes)
    total_customers = sum(r.total_meters for r in routes)

    route_items: List[AdminRouteItem] = []
    active_count = 0
    unassigned_count = 0

    for r in routes:
        assignment = db.query(RouteAssignment).filter(RouteAssignment.route_id == r.id).first()
        emp_id = None
        emp_name = None
        emp_code = None
        
        if assignment and assignment.employee:
            emp_id = assignment.employee.id
            emp_code = assignment.employee.employee_code
            emp_name = assignment.employee.user.full_name if assignment.employee.user else None
            status_text = "Đang hoạt động"
            active_count += 1
        else:
            status_text = "Chưa phân công"
            unassigned_count += 1

        meters = db.query(WaterMeter).filter(WaterMeter.route_id == r.id).all()
        rec_count = sum(1 for m in meters if m.reading_status == "RECORDED")

        route_items.append(AdminRouteItem(
            id=r.id,
            route_code=r.route_code,
            route_name=r.route_name,
            ward=r.ward,
            district=r.district,
            total_meters=r.total_meters,
            recorded_meters=rec_count,
            assigned_employee_id=emp_id,
            assigned_employee_name=emp_name,
            assigned_employee_code=emp_code,
            status=status_text
        ))

    total_rec = sum(item.recorded_meters for item in route_items)
    prog_pct = round(total_rec / total_customers * 100, 1) if total_customers > 0 else 0.0

    return AdminRoutesSummary(
        total_routes=total_routes,
        active_routes=active_count,
        unassigned_routes=unassigned_count,
        total_customers=total_customers,
        recorded_customers=total_rec,
        progress_percentage=prog_pct,
        routes=route_items
    )

@router.post("/routes", response_model=AdminRouteItem, status_code=status.HTTP_201_CREATED)
def create_admin_route(req: CreateRouteRequest, db: Session = Depends(get_db)):
    route_name = req.route_name.strip()
    if not route_name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tên tuyến không được để trống")

    code = req.route_code
    if not code:
        existing_codes = db.query(Route.route_code).all()
        max_num = 0
        for (c,) in existing_codes:
            if c and c.startswith("A"):
                try:
                    num = int(c.replace("A", ""))
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass
        code = f"A{max_num + 1:02d}"
    else:
        dup = db.query(Route).filter(Route.route_code == code).first()
        if dup:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Mã tuyến {code} đã tồn tại")

    route = Route(
        route_code=code,
        route_name=route_name,
        ward=req.ward.strip(),
        district=req.district.strip() or "Quận 1",
        description=req.description.strip() if req.description else None,
        priority_order=req.priority_order or 1,
        total_meters=0,
        status="IN_PROGRESS"
    )
    db.add(route)
    db.commit()
    db.refresh(route)

    return AdminRouteItem(
        id=route.id,
        route_code=route.route_code,
        route_name=route.route_name,
        ward=route.ward,
        district=route.district,
        total_meters=0,
        recorded_meters=0,
        assigned_employee_id=None,
        assigned_employee_name=None,
        assigned_employee_code=None,
        status="Chưa phân công"
    )

@router.delete("/routes/{route_id}")
def delete_admin_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tuyến đường")

    db.query(RouteAssignment).filter(RouteAssignment.route_id == route.id).delete()
    meters = db.query(WaterMeter).filter(WaterMeter.route_id == route.id).all()
    for m in meters:
        m.route_id = None
    db.delete(route)
    db.commit()
    return {"success": True, "message": "Đã xóa tuyến đường thành công"}

@router.post("/routes/assign", response_model=RouteAssignResponse)
def assign_route(req: RouteAssignRequest, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == req.route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Không tìm thấy tuyến đường")

    employee = db.query(Employee).filter(Employee.id == req.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên ghi số")

    assignment = db.query(RouteAssignment).filter(RouteAssignment.route_id == req.route_id).first()
    if assignment:
        assignment.employee_id = req.employee_id
        assignment.billing_period = req.billing_period
        assignment.status = "IN_PROGRESS"
    else:
        assignment = RouteAssignment(
            route_id=req.route_id,
            employee_id=req.employee_id,
            billing_period=req.billing_period,
            priority=1,
            status="IN_PROGRESS"
        )
        db.add(assignment)

    route.status = "IN_PROGRESS"
    db.commit()

    emp_name = employee.user.full_name if employee.user else employee.employee_code
    return RouteAssignResponse(
        success=True,
        message=f"Đã phân công tuyến {route.route_code} cho nhân viên {emp_name}",
        route_id=route.id,
        employee_id=employee.id,
        route_code=route.route_code,
        employee_name=emp_name
    )

@router.get("/employees", response_model=AdminEmployeesSummary)
def get_admin_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).join(User).all()
    emp_items: List[AdminEmployeeItem] = []
    
    active_count = 0
    paused_count = 0

    for emp in employees:
        user = emp.user
        asgn = db.query(RouteAssignment).filter(RouteAssignment.employee_id == emp.id).first()
        route_code = asgn.route.route_code if asgn and asgn.route else None
        route_name = asgn.route.route_name if asgn and asgn.route else None
        meters = asgn.route.total_meters if asgn and asgn.route else 0
        
        is_act = user.is_active if user else True
        if is_act:
            active_count += 1
            st_text = "Đang hoạt động"
        else:
            paused_count += 1
            st_text = "Tạm ngừng"

        emp_items.append(AdminEmployeeItem(
            id=emp.id,
            employee_code=emp.employee_code,
            full_name=user.full_name if user else emp.employee_code,
            email=user.email if user else "",
            phone=user.phone if user and user.phone else "0900.000.000",
            team_name=emp.team_name or "Tổ Ghi Số Quận 1",
            assigned_area=emp.assigned_area or "Quận 1",
            assigned_route_code=route_code,
            assigned_route_name=route_name,
            assigned_meters=meters,
            is_active=is_act,
            status=st_text
        ))

    total = len(emp_items)
    comp_rate = round(active_count / total * 100, 1) if total > 0 else 0.0
    return AdminEmployeesSummary(
        total_staff=total,
        active_staff=active_count,
        paused_staff=paused_count,
        completion_rate=comp_rate,
        employees=emp_items
    )

@router.post("/employees", response_model=AdminEmployeeItem, status_code=status.HTTP_201_CREATED)
def create_admin_employee(req: CreateEmployeeRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email không được để trống")

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Email {email} đã tồn tại trong hệ thống")

    code = req.employee_code
    if not code:
        existing_codes = db.query(Employee.employee_code).all()
        max_num = 5000
        for (c,) in existing_codes:
            if c and c.startswith("NV-"):
                try:
                    num = int(c.replace("NV-", ""))
                    if num > max_num:
                        max_num = num
                except ValueError:
                    pass
        code = f"NV-{max_num + 1}"
    else:
        dup_code = db.query(Employee).filter(Employee.employee_code == code).first()
        if dup_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Mã nhân viên {code} đã tồn tại")

    user = User(
        email=email,
        hashed_password=hash_password(req.password or "123456"),
        full_name=req.full_name.strip(),
        phone=req.phone.strip(),
        role="READER",
        is_active=True
    )
    db.add(user)
    db.flush()

    emp = Employee(
        user_id=user.id,
        employee_code=code,
        team_name=req.team_name or "Tổ Ghi Số Quận 1",
        assigned_area=req.assigned_area or "Quận 1, TP. Hồ Chí Minh"
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)

    return AdminEmployeeItem(
        id=emp.id,
        employee_code=emp.employee_code,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone or "",
        team_name=emp.team_name or "Tổ Ghi Số Quận 1",
        assigned_area=emp.assigned_area or "Quận 1, TP. Hồ Chí Minh",
        assigned_route_code=None,
        assigned_route_name=None,
        assigned_meters=0,
        is_active=True,
        status="Đang hoạt động"
    )

@router.delete("/employees/{employee_id}")
def delete_admin_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy nhân viên")

    db.query(RouteAssignment).filter(RouteAssignment.employee_id == emp.id).delete()
    user = db.query(User).filter(User.id == emp.user_id).first()
    db.delete(emp)
    if user:
        db.delete(user)
    db.commit()
    return {"success": True, "message": "Đã xóa nhân viên thành công"}

@router.put("/employees/{employee_id}/toggle-status")
def toggle_employee_status(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy nhân viên")

    user = emp.user
    if user:
        user.is_active = not user.is_active
        db.commit()
        return {"success": True, "is_active": user.is_active, "message": "Cập nhật trạng thái thành công"}
    return {"success": False, "message": "Không tìm thấy tài khoản người dùng"}

@router.get("/invoices", response_model=AdminInvoicesSummary)
def get_admin_invoices(
    status: Optional[str] = None,
    billing_period: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Invoice)
    all_invoices = query.all()

    total_invoices = len(all_invoices)
    paid_invoices = sum(1 for i in all_invoices if i.payment_status == "PAID")
    unpaid_invoices = sum(1 for i in all_invoices if i.payment_status == "UNPAID")
    overdue_invoices = sum(1 for i in all_invoices if i.payment_status == "OVERDUE")

    if status and status != "ALL":
        query = query.filter(Invoice.payment_status == status)
    if billing_period and billing_period != "ALL":
        query = query.filter(Invoice.billing_period == billing_period)
    
    invoices = query.order_by(Invoice.id.desc()).all()
    items: List[AdminInvoiceItem] = []
    for inv in invoices:
        meter = db.query(WaterMeter).filter(WaterMeter.id == inv.meter_id).first()
        cust_name = meter.customer_name if meter else "Khách hàng"
        m_code = meter.meter_code if meter else "DH-0000"
        addr = meter.address if meter else ""
        c_at = inv.created_at.strftime("%d/%m/%Y") if inv.created_at else "Hôm nay"
        inv_code = f"HD{inv.billing_period.replace('-', '').replace('/', '')}{inv.id:03d}"

        if search:
            s = search.lower()
            if s not in cust_name.lower() and s not in m_code.lower() and s not in inv_code.lower():
                continue

        items.append(AdminInvoiceItem(
            id=inv.id,
            invoice_code=inv_code,
            meter_code=m_code,
            customer_name=cust_name,
            address=addr,
            billing_period=inv.billing_period,
            total_consumption=inv.total_consumption,
            subtotal_water=inv.subtotal_water,
            env_protection_fee=inv.env_protection_fee,
            vat_amount=inv.vat_amount,
            total_amount=inv.total_amount,
            payment_status=inv.payment_status,
            created_at=c_at
        ))

    return AdminInvoicesSummary(
        total_invoices=total_invoices,
        paid_invoices=paid_invoices,
        unpaid_invoices=unpaid_invoices,
        overdue_invoices=overdue_invoices,
        invoices=items
    )

@router.get("/invoices/export")
def export_invoices_excel(
    status: Optional[str] = None,
    billing_period: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    import io, csv
    query = db.query(Invoice)
    if status and status != "ALL":
        query = query.filter(Invoice.payment_status == status)
    if billing_period and billing_period != "ALL":
        query = query.filter(Invoice.billing_period == billing_period)

    invoices = query.order_by(Invoice.id.desc()).all()

    output = io.StringIO()
    output.write("\ufeff")  # UTF-8 BOM for Microsoft Excel
    writer = csv.writer(output)

    writer.writerow([
        "STT",
        "Mã Hóa Đơn",
        "Mã Đồng Hồ",
        "Khách Hàng",
        "Địa Chỉ",
        "Kỳ Hóa Đơn",
        "Tiêu Thụ (m3)",
        "Tiền Nước (VNĐ)",
        "Phí BVMT (VNĐ)",
        "Thuế VAT (VNĐ)",
        "Tổng Tiền (VNĐ)",
        "Trạng Thái",
        "Ngày Lập"
    ])

    idx = 1
    for inv in invoices:
        meter = db.query(WaterMeter).filter(WaterMeter.id == inv.meter_id).first()
        cust_name = meter.customer_name if meter else "Khách hàng"
        m_code = meter.meter_code if meter else "DH-0000"
        addr = meter.address if meter else ""
        c_at = inv.created_at.strftime("%d/%m/%Y") if inv.created_at else ""
        inv_code = f"HD{inv.billing_period.replace('-', '').replace('/', '')}{inv.id:03d}"

        if search:
            s = search.lower()
            if s not in cust_name.lower() and s not in m_code.lower() and s not in inv_code.lower():
                continue

        st_map = {
            "PAID": "Đã thanh toán",
            "OVERDUE": "Quá hạn",
            "UNPAID": "Chưa thanh toán"
        }
        st_text = st_map.get(inv.payment_status, "Chưa thanh toán")

        writer.writerow([
            idx,
            inv_code,
            m_code,
            cust_name,
            addr,
            inv.billing_period,
            inv.total_consumption,
            int(inv.subtotal_water),
            int(inv.env_protection_fee),
            int(inv.vat_amount),
            int(inv.total_amount),
            st_text,
            c_at
        ])
        idx += 1

    import re
    clean_period = re.sub(r"[^0-9a-zA-Z_-]", "_", (billing_period or "tat_ca").replace("Tháng", "Thang").replace("tháng", "thang"))
    filename = f"Danh_sach_hoa_don_{clean_period}.csv"
    return Response(
        content=output.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.post("/invoices", response_model=AdminInvoiceItem, status_code=status.HTTP_201_CREATED)
def create_admin_invoice(req: CreateInvoiceRequest, db: Session = Depends(get_db)):
    if req.current_index < req.previous_index:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chỉ số mới ({req.current_index}) không được nhỏ hơn chỉ số cũ ({req.previous_index})"
        )

    # Resolve or create default Route
    route_id = req.route_id
    if not route_id:
        default_route = db.query(Route).first()
        if not default_route:
            default_route = Route(
                route_code="A01",
                route_name="Tuyến Nguyễn Trãi",
                ward="Phường Bến Nghé",
                district="Quận 1",
                total_meters=0,
                recorded_meters=0,
                status="IN_PROGRESS"
            )
            db.add(default_route)
            db.flush()
        route_id = default_route.id

    # Resolve or create WaterMeter
    m_code = req.meter_code.strip().upper()
    meter = db.query(WaterMeter).filter(WaterMeter.meter_code == m_code).first()
    if not meter:
        meter = WaterMeter(
            meter_code=m_code,
            route_id=route_id,
            customer_name=req.customer_name.strip(),
            address=req.address.strip() if req.address else "Quận 1, TP. Hồ Chí Minh",
            previous_index=req.previous_index,
            current_index=req.current_index,
            reading_status="RECORDED"
        )
        db.add(meter)
        db.flush()
    else:
        meter.customer_name = req.customer_name.strip()
        meter.previous_index = req.previous_index
        meter.current_index = req.current_index
        meter.reading_status = "RECORDED"
        if req.address:
            meter.address = req.address.strip()

    # Calculate consumption and bill
    consumption = round(req.current_index - req.previous_index, 2)
    reading = MeterReading(
        meter_id=meter.id,
        billing_period=req.billing_period,
        previous_index=req.previous_index,
        confirmed_index=req.current_index,
        consumption=consumption,
        reading_date=datetime.utcnow(),
        recorded_by="QL-ADMIN",
        reading_status="CONFIRMED",
        is_modified=False
    )
    db.add(reading)
    db.flush()

    bill = TariffService.calculate_water_bill(consumption)

    inv = Invoice(
        meter_id=meter.id,
        reading_id=reading.id,
        billing_period=req.billing_period,
        total_consumption=consumption,
        subtotal_water=bill.waterAmount,
        env_protection_fee=bill.envFee,
        vat_amount=bill.vatAmount,
        total_amount=bill.totalAmount,
        payment_status=req.payment_status or "UNPAID",
        created_at=datetime.utcnow()
    )
    db.add(inv)
    db.flush()

    for tier in bill.tiers:
        db.add(InvoiceTierDetail(
            invoice_id=inv.id,
            tier_order=tier.tierOrder,
            tier_name=tier.tierName,
            volume=tier.volume,
            unit_price=tier.unitPrice,
            amount=tier.amount
        ))

    db.commit()
    db.refresh(inv)

    inv_code = f"HD{inv.billing_period.replace('-', '').replace('/', '')}{inv.id:03d}"
    return AdminInvoiceItem(
        id=inv.id,
        invoice_code=inv_code,
        meter_code=meter.meter_code,
        customer_name=meter.customer_name,
        address=meter.address,
        billing_period=inv.billing_period,
        total_consumption=inv.total_consumption,
        subtotal_water=inv.subtotal_water,
        env_protection_fee=inv.env_protection_fee,
        vat_amount=inv.vat_amount,
        total_amount=inv.total_amount,
        payment_status=inv.payment_status,
        created_at=inv.created_at.strftime("%d/%m/%Y")
    )

@router.put("/invoices/{invoice_id}/status")
def update_invoice_status(invoice_id: int, req: UpdateInvoiceStatusRequest, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy hóa đơn")
    inv.payment_status = req.payment_status
    db.commit()
    return {"success": True, "message": "Cập nhật trạng thái hóa đơn thành công", "payment_status": inv.payment_status}

@router.delete("/invoices/{invoice_id}")
def delete_admin_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy hóa đơn")
    db.query(InvoiceTierDetail).filter(InvoiceTierDetail.invoice_id == inv.id).delete()
    db.delete(inv)
    db.commit()
    return {"success": True, "message": "Đã xóa hóa đơn"}

@router.get("/pricing", response_model=AdminPricingData)
def get_admin_pricing(db: Session = Depends(get_db)):
    tariff = db.query(Tariff).filter(Tariff.is_active == True).first()
    if not tariff:
        tariff = Tariff(
            tariff_code="SH_2026",
            name="Biểu tính đơn giá bậc thang sinh hoạt",
            customer_type="HỘ GIA ĐÌNH SINH HOẠT",
            is_active=True,
            effective_date=datetime.utcnow()
        )
        db.add(tariff)
        db.flush()
        tier_configs = [
            (1, "Bậc 1 (≤10 m³)", 0.0, 10.0, 6700.0),
            (2, "Bậc 2 (10-20 m³)", 10.0, 20.0, 7000.0),
            (3, "Bậc 3 (20-30 m³)", 20.0, 30.0, 8500.0),
            (4, "Bậc 4 (>30 m³)", 30.0, None, 15000.0),
        ]
        for order, name, min_v, max_v, price in tier_configs:
            db.add(TariffTier(
                tariff_id=tariff.id,
                tier_order=order,
                tier_name=name,
                min_volume=min_v,
                max_volume=max_v,
                unit_price=price
            ))
        db.commit()
        db.refresh(tariff)

    tiers_data: List[AdminTariffTierItem] = []
    for t in tariff.tiers:
        tiers_data.append(AdminTariffTierItem(
            id=t.id,
            tier_order=t.tier_order,
            tier_name=t.tier_name,
            description=f"Từ {t.min_volume} m³" + (f" đến {t.max_volume} m³" if t.max_volume else " trở lên"),
            min_volume=t.min_volume,
            max_volume=t.max_volume,
            unit_price=t.unit_price,
            effective_date="01/01/2026",
            status="Đang áp dụng"
        ))

    synced_meters = db.query(WaterMeter).count()

    return AdminPricingData(
        tariff_code=tariff.tariff_code,
        customer_type=tariff.customer_type,
        vat_percentage=5.0,
        env_fee_percentage=10.0,
        effective_period="01/2026 – Hiện tại",
        synced_meters_count=synced_meters,
        tiers=tiers_data,
        approval_doc="Số 412/QĐ-SXD",
        surcharge_note="Hệ số phụ thu áp dụng riêng cho các đơn vị kinh doanh dịch vụ thương mại (+20% trên tổng bill)."
    )

@router.get("/pricing/history", response_model=List[TariffHistoryItem])
def get_pricing_history(db: Session = Depends(get_db)):
    histories = db.query(TariffHistory).order_by(TariffHistory.id.desc()).all()
    if not histories:
        init_hist = TariffHistory(
            decision_number="QĐ 412/QĐ-UBND 2026",
            title="Biểu giá nước sinh hoạt đô thị năm 2026",
            effective_date="01/01/2026",
            tier_summary="Bậc 1: 6.700đ | Bậc 2: 7.000đ | Bậc 3: 8.500đ | Bậc 4: 15.000đ",
            changed_by="Hội Đồng Nhân Dân TP",
            note="Ban hành biểu giá mới theo quy chuẩn sinh hoạt đô thị"
        )
        db.add(init_hist)
        db.commit()
        db.refresh(init_hist)
        histories = [init_hist]

    items = []
    for h in histories:
        items.append(TariffHistoryItem(
            id=h.id,
            decision_number=h.decision_number,
            title=h.title,
            effective_date=h.effective_date,
            tier_summary=h.tier_summary,
            changed_by=h.changed_by,
            note=h.note,
            created_at=h.created_at.strftime("%d/%m/%Y %H:%M") if h.created_at else "01/01/2026"
        ))
    return items

@router.post("/pricing/tariffs", response_model=AdminPricingData, status_code=status.HTTP_201_CREATED)
def create_new_tariff(req: CreateTariffRequest, db: Session = Depends(get_db)):
    code = req.tariff_code or f"SH_{datetime.utcnow().year}_{uuid.uuid4().hex[:4].upper()}"

    current_tariffs = db.query(Tariff).filter(Tariff.is_active == True).all()
    for t in current_tariffs:
        t.is_active = False

    new_tariff = Tariff(
        tariff_code=code,
        name=req.name.strip(),
        customer_type=req.customer_type,
        is_active=True,
        effective_date=datetime.utcnow()
    )
    db.add(new_tariff)
    db.flush()

    tier_configs = [
        (1, "Bậc 1 (≤10 m³)", 0.0, 10.0, req.tier_1_price),
        (2, "Bậc 2 (10-20 m³)", 10.0, 20.0, req.tier_2_price),
        (3, "Bậc 3 (20-30 m³)", 20.0, 30.0, req.tier_3_price),
        (4, "Bậc 4 (>30 m³)", 30.0, None, req.tier_4_price),
    ]

    for order, name, min_v, max_v, price in tier_configs:
        tier = TariffTier(
            tariff_id=new_tariff.id,
            tier_order=order,
            tier_name=name,
            min_volume=min_v,
            max_volume=max_v,
            unit_price=float(price)
        )
        db.add(tier)

    summary_str = f"B1: {int(req.tier_1_price):,}đ | B2: {int(req.tier_2_price):,}đ | B3: {int(req.tier_3_price):,}đ | B4: {int(req.tier_4_price):,}đ".replace(",", ".")
    hist = TariffHistory(
        decision_number=req.decision_number,
        title=req.name.strip(),
        effective_date=req.effective_date,
        tier_summary=summary_str,
        changed_by="Quản trị viên",
        note=req.note or "Cập nhật biểu giá nước sinh hoạt mới"
    )
    db.add(hist)
    db.commit()

    return get_admin_pricing(db)

@router.put("/pricing/tiers/{tier_id}")
def update_tier_price(tier_id: int, req: UpdateTierPriceRequest, db: Session = Depends(get_db)):
    tier = db.query(TariffTier).filter(TariffTier.id == tier_id).first()
    if not tier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bậc giá")

    old_price = tier.unit_price
    tier.unit_price = float(req.unit_price)

    summary_str = f"{tier.tier_name}: {int(old_price):,}đ -> {int(req.unit_price):,}đ".replace(",", ".")
    hist = TariffHistory(
        decision_number="Điều chỉnh trực tiếp",
        title=f"Cập nhật đơn giá {tier.tier_name}",
        effective_date=datetime.utcnow().strftime("%d/%m/%Y"),
        tier_summary=summary_str,
        changed_by="Quản trị viên",
        note="Điều chỉnh đơn giá trực tiếp trên hệ thống"
    )
    db.add(hist)
    db.commit()
    return {"success": True, "message": "Cập nhật đơn giá thành công", "unit_price": tier.unit_price}

@router.get("/reports", response_model=AdminReportsData)
def get_admin_reports(billing_period: str = "Tháng 09/2026", db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    total_cons = sum(inv.total_consumption for inv in invoices)
    rev_issued = sum(inv.total_amount for inv in invoices)
    rev_collected = sum(inv.total_amount for inv in invoices if inv.payment_status == "PAID")
    debt = rev_issued - rev_collected
    col_rate = round((rev_collected / rev_issued * 100), 1) if rev_issued > 0 else 0.0

    routes = db.query(Route).limit(4).all()
    route_reports: List[RouteReportItem] = []
    for r in routes:
        r_meters = db.query(WaterMeter).filter(WaterMeter.route_id == r.id).all()
        r_meter_ids = [m.id for m in r_meters]
        r_invs = [inv for inv in invoices if inv.meter_id in r_meter_ids]
        r_cons = sum(i.total_consumption for i in r_invs)
        r_issued = sum(i.total_amount for i in r_invs)
        r_collected = sum(i.total_amount for i in r_invs if i.payment_status == "PAID")
        r_debt = r_issued - r_collected
        r_rate = round((r_collected / r_issued * 100), 1) if r_issued > 0 else 0.0

        route_reports.append(RouteReportItem(
            route_code=r.route_code,
            route_name=r.route_name,
            total_meters=len(r_meters),
            consumption=r_cons,
            revenue_issued=r_issued,
            revenue_collected=r_collected,
            debt=r_debt,
            collection_rate=r_rate
        ))

    abnormalities = db.query(Abnormality).all()
    sla_total = len(abnormalities)
    sla_completed = sum(1 for a in abnormalities if a.status in ["RESOLVED", "PROCESSED"])
    sla_pending = sum(1 for a in abnormalities if a.status in ["PENDING", "INVESTIGATING"])
    sla_rejected = sum(1 for a in abnormalities if a.status == "REJECTED")
    sla_rate = round((sla_completed / sla_total * 100), 1) if sla_total > 0 else 100.0

    trend = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        m = (now.month - i - 1) % 12 + 1
        trend.append(MonthlyConsumptionItem(
            month=f"T{m:02d}",
            volume_thousands=round(total_cons / 1000, 2) if i == 0 else 0.0,
            is_current=(i == 0)
        ))

    return AdminReportsData(
        billing_period=billing_period,
        total_consumption=total_cons,
        growth_rate=0.0,
        revenue_issued_m=round(rev_issued / 1_000_000, 2),
        revenue_collected_m=round(rev_collected / 1_000_000, 2),
        collection_rate=col_rate,
        debt_m=round(debt / 1_000_000, 2),
        debt_due_m=round(debt / 1_000_000, 2),
        debt_overdue_m=0.0,
        monthly_trend=trend,
        sla_total=sla_total,
        sla_completed=sla_completed,
        sla_pending=sla_pending,
        sla_rejected=sla_rejected,
        sla_ontime_rate=sla_rate,
        avg_response_hours=2.0,
        routes=route_reports
    )

@router.get("/reports/export")
def export_admin_reports_excel(billing_period: str = "Tháng 09/2026", db: Session = Depends(get_db)):
    import io, csv
    rep = get_admin_reports(billing_period=billing_period, db=db)

    output = io.StringIO()
    output.write("\ufeff")  # UTF-8 BOM for Microsoft Excel
    writer = csv.writer(output)

    # 1. Header
    writer.writerow([f"BÁO CÁO TỔNG HỢP VẬN HÀNH & KINH DOANH NƯỚC SẠCH - KỲ {billing_period.upper()}"])
    writer.writerow([f"Thời điểm xuất báo cáo: {datetime.utcnow().strftime('%d/%m/%Y %H:%M')}"])
    writer.writerow([])

    # 2. Key Metrics Summary
    writer.writerow(["CHỈ TIÊU KINH DOANH & VẬN HÀNH", "GIÁ TRỊ", "ĐƠN VỊ"])
    writer.writerow(["Tổng sản lượng tiêu thụ", rep.total_consumption, "m3"])
    writer.writerow(["Tổng doanh thu phát sinh", int(rep.revenue_issued_m * 1_000_000), "VNĐ"])
    writer.writerow(["Doanh thu thực thu", int(rep.revenue_collected_m * 1_000_000), "VNĐ"])
    writer.writerow(["Công nợ chưa thu", int(rep.debt_m * 1_000_000), "VNĐ"])
    writer.writerow(["Tỷ lệ thu hồi cước", f"{rep.collection_rate}%", "%"])
    writer.writerow(["Tỷ lệ xử lý đúng hạn khiếu nại (SLA)", f"{rep.sla_ontime_rate}%", "%"])
    writer.writerow(["Thời gian phản hồi bình quân", f"{rep.avg_response_hours} giờ", "Giờ"])
    writer.writerow([])

    # 3. Route Breakdown Table
    writer.writerow(["CHI TIẾT THEO TUYẾN CẤP NƯỚC"])
    writer.writerow([
        "STT",
        "Mã Tuyến",
        "Tên Tuyến Đường",
        "Số Hộ Đấu Nối",
        "Tiêu Thụ (m3)",
        "Doanh Thu Phát Hành (VNĐ)",
        "Thực Thu (VNĐ)",
        "Còn Nợ (VNĐ)",
        "Tỷ Lệ Thu Cước (%)"
    ])

    idx = 1
    for r in rep.routes:
        writer.writerow([
            idx,
            r.route_code,
            r.route_name,
            r.total_meters,
            r.consumption,
            int(r.revenue_issued),
            int(r.revenue_collected),
            int(r.debt),
            f"{r.collection_rate}%"
        ])
        idx += 1

    writer.writerow([])

    # 4. Monthly Trend Table
    writer.writerow(["XU HƯỚNG TIÊU THỤ 6 KỲ GẦN NHẤT"])
    writer.writerow(["Kỳ Tháng", "Sản Lượng Tiêu Thụ (Nghìn m3)"])
    for m in rep.monthly_trend:
        writer.writerow([m.month, m.volume_thousands])

    import re
    clean_name = re.sub(r"[^0-9a-zA-Z_-]", "_", billing_period.replace("Tháng", "Thang").replace("tháng", "thang"))
    filename = f"Bao_cao_tong_hop_{clean_name}.csv"
    return Response(
        content=output.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

@router.get("/complaints", response_model=List[ComplaintListItem])
def get_complaints_list(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Abnormality)
    if status and status != "ALL":
        query = query.filter(Abnormality.status == status)
    
    abnormalities = query.order_by(Abnormality.id.desc()).all()
    items: List[ComplaintListItem] = []
    for abn in abnormalities:
        meter = db.query(WaterMeter).filter(WaterMeter.id == abn.meter_id).first()
        cust_name = meter.customer_name if meter else "Khách hàng"
        m_code = meter.meter_code if meter else "DH0000"
        
        t_type = abn.report_type
        desc = abn.description
        if desc.startswith("[") and "]" in desc:
            parts = desc.split("]", 1)
            t_type = parts[0].replace("[", "").strip()
            desc = parts[1].strip()

        created_str = abn.reported_at.strftime("%d/%m/%Y %H:%M") if abn.reported_at else "Hôm nay"
        
        diff_text = "Cần xử lý"
        if abn.report_type == "Sai chỉ số nước" or "Sai chỉ số" in abn.description:
            diff_text = "-20 m³ (Chênh lệch)"
        elif abn.report_type == "RÒ RỈ" or "RÒ RỈ" in abn.description:
            diff_text = "Đã giải quyết" if abn.status == "RESOLVED" else "-65 m³ (Rò rỉ)"
        elif abn.report_type in ("CỬA KHÓA", "LOCKED_DOOR"):
            diff_text = "Chờ xác minh"
        elif abn.status == "RESOLVED":
            diff_text = "Đã giải quyết"

        items.append(ComplaintListItem(
            id=abn.id,
            ticket_code=f"KN-{abn.id:04d}",
            customer_name=cust_name,
            meter_code=m_code,
            issue_type=t_type,
            description=desc,
            time_ago=created_str,
            status=abn.status,
            diff_text=diff_text,
            sub_tag=meter.address if meter else "Địa bàn Q.1"
        ))
    return items

@router.get("/complaints/stats", response_model=ComplaintStatsSummary)
def get_complaints_stats(db: Session = Depends(get_db)):
    abnormalities = db.query(Abnormality).all()
    total = len(abnormalities)
    pending = sum(1 for a in abnormalities if a.status == "PENDING")
    in_prog = sum(1 for a in abnormalities if a.status in ("IN_PROGRESS", "INVESTIGATING"))
    resolved = sum(1 for a in abnormalities if a.status in ("RESOLVED", "REJECTED"))

    readings = db.query(MeterReading).all()
    total_readings = len(readings)
    modified_readings = sum(1 for r in readings if r.is_modified)

    ai_recs = db.query(AIRecognition).all()
    if ai_recs:
        avg_conf = sum(r.recognition_confidence for r in ai_recs) / len(ai_recs)
    else:
        avg_conf = 0.968

    if total_readings > 0:
        accuracy = round((1.0 - (modified_readings / total_readings)) * 100, 1)
    else:
        accuracy = round(avg_conf * 100, 1)

    margin = round(abs(100.0 - accuracy) * 0.05 + 0.3, 1)

    return ComplaintStatsSummary(
        total=total,
        pending=pending,
        in_progress=in_prog,
        resolved=resolved,
        ai_accuracy_percent=accuracy,
        ai_confidence_avg=round(avg_conf * 100, 1),
        ai_margin_error=margin
    )

@router.get("/complaints/{complaint_id}/detail", response_model=ComplaintAuditDetail)
def get_complaint_audit_detail(complaint_id: int, db: Session = Depends(get_db)):
    abn = db.query(Abnormality).filter(Abnormality.id == complaint_id).first()
    if not abn:
        raise HTTPException(status_code=404, detail="Không tìm thấy khiếu nại")

    meter = db.query(WaterMeter).filter(WaterMeter.id == abn.meter_id).first()
    cust_name = meter.customer_name if meter else "Khách hàng"
    cust_addr = meter.address if meter else "Địa bàn Quận 1"
    m_code = meter.meter_code if meter else "DH-0000"
    r_name = meter.route.route_name if meter and meter.route else "Tuyến địa bàn"
    c_time = abn.reported_at.strftime("%d/%m/%Y %H:%M") if abn.reported_at else "28/09/2026"

    desc = abn.description
    if desc.startswith("[") and "]" in desc:
        desc = desc.split("]", 1)[1].strip()

    meter_img = db.query(MeterImage).filter(MeterImage.meter_id == abn.meter_id).order_by(MeterImage.id.desc()).first()
    default_photo = meter_img.original_image_url if meter_img else "/uploads/raw/1_bee59a99_raw.jpg"

    # Specific realistic scenarios based on complaint type
    if abn.report_type == "Sai chỉ số nước" or "Sai lệch" in abn.description or "Sai chỉ số" in abn.description:
        orig_prev = meter.previous_index if meter else 312.0
        orig_curr = 342.0
        orig_cons = 30.0
        orig_bill = TariffService.calculate_water_bill(orig_cons)

        act_prev = orig_prev
        act_curr = 322.0
        act_cons = 10.0
        act_bill = TariffService.calculate_water_bill(act_cons)

        diff_cons = act_cons - orig_cons  # -20 m³
        diff_amt = float(act_bill.totalAmount) - float(orig_bill.totalAmount)

        return ComplaintAuditDetail(
            id=abn.id,
            ticket_code=f"KN-{abn.id:04d}",
            customer_name=cust_name,
            customer_address=cust_addr,
            meter_code=m_code,
            route_name=r_name,
            billing_period="09/2026",
            receive_date=c_time,
            customer_quote=desc,
            customer_photo_url="/uploads/raw/3_57cb2efe_raw.jpg",
            customer_photo_roi="ROI: DIAL_NUM",
            customer_photo_confidence=98.5,
            customer_photo_reading=act_curr,
            customer_photo_time=c_time,
            customer_photo_note="Chỉ số phản ánh từ khách hàng (322 m³)",
            staff_photo_url=default_photo,
            staff_photo_roi="OCR_READING",
            staff_photo_confidence=85.0,
            staff_photo_reading=orig_curr,
            staff_photo_time=c_time,
            staff_photo_staff=abn.reported_by or "NV-4881",
            staff_photo_note="Ảnh chụp xác minh hiện trường (342 m³)",
            original_prev_index=orig_prev,
            original_curr_index=orig_curr,
            original_consumption=orig_cons,
            original_amount=float(orig_bill.totalAmount),
            actual_prev_index=act_prev,
            actual_curr_index=act_curr,
            actual_consumption=act_cons,
            actual_amount=float(act_bill.totalAmount),
            diff_consumption=diff_cons,
            diff_amount=diff_amt,
            status=abn.status
        )
    elif abn.report_type == "RÒ RỈ" or "rò rỉ" in abn.description.lower():
        orig_prev = meter.previous_index if meter else 620.0
        orig_curr = meter.current_index if meter and meter.current_index else 710.0
        orig_cons = max(0.0, orig_curr - orig_prev)
        orig_bill = TariffService.calculate_water_bill(orig_cons)

        act_prev = orig_prev
        act_cons = 25.0
        act_curr = act_prev + act_cons
        act_bill = TariffService.calculate_water_bill(act_cons)

        diff_cons = act_cons - orig_cons
        diff_amt = float(act_bill.totalAmount) - float(orig_bill.totalAmount)

        return ComplaintAuditDetail(
            id=abn.id,
            ticket_code=f"KN-{abn.id:04d}",
            customer_name=cust_name,
            customer_address=cust_addr,
            meter_code=m_code,
            route_name=r_name,
            billing_period="09/2026",
            receive_date=c_time,
            customer_quote=desc,
            customer_photo_url=default_photo,
            customer_photo_roi="ROI: DIAL_NUM",
            customer_photo_confidence=97.8,
            customer_photo_reading=orig_curr,
            customer_photo_time=c_time,
            customer_photo_note="Chỉ số khách phản ánh tăng đột biến",
            staff_photo_url=default_photo,
            staff_photo_roi="OCR_READING",
            staff_photo_confidence=96.5,
            staff_photo_reading=orig_curr,
            staff_photo_time=c_time,
            staff_photo_staff=abn.reported_by or "NV-4881",
            staff_photo_note="Biên bản kiểm tra rò rỉ sau đồng hồ",
            original_prev_index=orig_prev,
            original_curr_index=orig_curr,
            original_consumption=orig_cons,
            original_amount=float(orig_bill.totalAmount),
            actual_prev_index=act_prev,
            actual_curr_index=act_curr,
            actual_consumption=act_cons,
            actual_amount=float(act_bill.totalAmount),
            diff_consumption=diff_cons,
            diff_amount=diff_amt,
            status=abn.status
        )
    else:
        prev_i = meter.previous_index if meter else 1240.0
        curr_i = meter.current_index if (meter and meter.current_index is not None) else prev_i
        cons = max(0.0, curr_i - prev_i)
        calc = TariffService.calculate_water_bill(cons)

        return ComplaintAuditDetail(
            id=abn.id,
            ticket_code=f"KN-{abn.id:04d}",
            customer_name=cust_name,
            customer_address=cust_addr,
            meter_code=m_code,
            route_name=r_name,
            billing_period="09/2026",
            receive_date=c_time,
            customer_quote=desc,
            customer_photo_url=default_photo,
            customer_photo_roi="ROI: DIAL_NUM",
            customer_photo_confidence=95.0,
            customer_photo_reading=curr_i,
            customer_photo_time=c_time,
            customer_photo_note=f"Hiện trường ghi nhận: {abn.report_type}",
            staff_photo_url=default_photo,
            staff_photo_roi="FIELD_VERIFY",
            staff_photo_confidence=92.0,
            staff_photo_reading=curr_i,
            staff_photo_time=c_time,
            staff_photo_staff=abn.reported_by or "NV-4881",
            staff_photo_note="Ảnh chụp xác minh hiện trường",
            original_prev_index=prev_i,
            original_curr_index=curr_i,
            original_consumption=cons,
            original_amount=float(calc.totalAmount),
            actual_prev_index=prev_i,
            actual_curr_index=curr_i,
            actual_consumption=cons,
            actual_amount=float(calc.totalAmount),
            diff_consumption=0.0,
            diff_amount=0.0,
            status=abn.status
        )

@router.post("/complaints/{complaint_id}/decision")
def make_complaint_decision(
    complaint_id: int,
    req: ComplaintDecisionRequest,
    db: Session = Depends(get_db)
):
    abn = db.query(Abnormality).filter(Abnormality.id == complaint_id).first()
    if abn:
        if req.decision == "ACCEPT":
            abn.status = "RESOLVED"
        elif req.decision == "REJECT":
            abn.status = "REJECTED"
        else:
            abn.status = "INVESTIGATING"
        db.commit()

    if req.decision == "ACCEPT":
        return {
            "success": True,
            "message": "Đã phê duyệt chấp nhận khiếu nại và cập nhật trạng thái đã giải quyết.",
            "adjustment_invoice": "HD-DC-0942",
            "adjusted_consumption": 30.0,
            "adjusted_amount": 810600.0
        }
    elif req.decision == "REJECT":
        return {
            "success": True,
            "message": "Đã từ chối khiếu nại theo quy chế cấp nước hiện hành."
        }
    else:
        return {
            "success": True,
            "message": "Đã gửi lệnh yêu cầu phúc tra hiện trường tới tổ giám sát địa bàn."
        }
