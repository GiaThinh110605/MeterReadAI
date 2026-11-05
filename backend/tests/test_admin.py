import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_overview():
    response = client.get("/api/v1/admin/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_employees" in data
    assert "total_routes" in data
    assert "total_revenue_expected" in data
    assert "urgent_complaints" in data
    assert data["total_routes"] >= 18
    assert data["total_employees"] >= 32

def test_admin_routes_list():
    response = client.get("/api/v1/admin/routes")
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert len(data["routes"]) >= 18
    assert data["total_routes"] >= 18
    assert data["total_customers"] >= 517

def test_admin_assign_route():
    routes_res = client.get("/api/v1/admin/routes")
    assert routes_res.status_code == 200
    routes = routes_res.json()["routes"]
    route_id = routes[0]["id"]

    employees_res = client.get("/api/v1/admin/employees")
    assert employees_res.status_code == 200
    employees = employees_res.json()["employees"]
    emp_id = employees[0]["id"]

    payload = {
        "route_id": route_id,
        "employee_id": emp_id,
        "billing_period": "10/2026",
        "notes": "Kiểm tra hẻm 120-128"
    }
    assign_res = client.post("/api/v1/admin/routes/assign", json=payload)
    assert assign_res.status_code == 200
    result = assign_res.json()
    assert result["success"] is True
    assert result["route_id"] == route_id
    assert result["employee_id"] == emp_id

def test_admin_employees_list():
    response = client.get("/api/v1/admin/employees")
    assert response.status_code == 200
    data = response.json()
    assert "employees" in data
    assert len(data["employees"]) >= 32
    assert data["active_staff"] >= 28

def test_admin_invoices_list():
    response = client.get("/api/v1/admin/invoices")
    assert response.status_code == 200
    data = response.json()
    assert "invoices" in data
    assert len(data["invoices"]) >= 1
    assert data["total_invoices"] >= 4



def test_admin_pricing():
    response = client.get("/api/v1/admin/pricing")
    assert response.status_code == 200
    data = response.json()
    assert "tiers" in data
    assert len(data["tiers"]) == 4
    assert data["vat_percentage"] == 5.0
    assert data["env_fee_percentage"] == 10.0

def test_admin_reports():
    response = client.get("/api/v1/admin/reports")
    assert response.status_code == 200
    data = response.json()
    assert "monthly_trend" in data
    assert len(data["monthly_trend"]) == 6
    assert "routes" in data
    assert len(data["routes"]) == 4
    assert data["collection_rate"] > 0

    export_res = client.get("/api/v1/admin/reports/export?billing_period=Tháng 09/2026")
    assert export_res.status_code == 200
    assert export_res.headers["content-type"].startswith("text/csv")
    csv_text = export_res.content.decode("utf-8-sig")
    assert "BÁO CÁO TỔNG HỢP" in csv_text
    assert "CHI TIẾT THEO TUYẾN" in csv_text

def test_admin_complaints_list_and_decision():
    response = client.get("/api/v1/admin/complaints")
    assert response.status_code == 200
    complaints = response.json()
    assert len(complaints) >= 3

    detail_res = client.get(f"/api/v1/admin/complaints/{complaints[0]['id']}/detail")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["ticket_code"].startswith("KN-")
    assert "diff_consumption" in detail

    dec_res = client.post(f"/api/v1/admin/complaints/{complaints[0]['id']}/decision", json={"decision": "ACCEPT", "actual_reading": 1248.0})
    assert dec_res.status_code == 200
    assert dec_res.json()["success"] is True

    stats_res = client.get("/api/v1/admin/complaints/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "pending" in stats
    assert "ai_accuracy_percent" in stats
    assert stats["ai_accuracy_percent"] > 0

def test_admin_create_delete_toggle_employee():
    payload = {
        "full_name": "Trần Văn Kiểm Thử",
        "email": "tranvankiemthu@example.com",
        "phone": "0987111222",
        "password": "password123",
        "team_name": "Tổ Ghi Số Quận 1",
        "assigned_area": "Quận 1, TP. Hồ Chí Minh"
    }
    create_res = client.post("/api/v1/admin/employees", json=payload)
    assert create_res.status_code == 201
    created_emp = create_res.json()
    assert created_emp["full_name"] == "Trần Văn Kiểm Thử"
    assert created_emp["email"] == "tranvankiemthu@example.com"
    assert created_emp["employee_code"].startswith("NV-")
    emp_id = created_emp["id"]

    # Toggle status
    toggle_res = client.put(f"/api/v1/admin/employees/{emp_id}/toggle-status")
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_active"] is False

    # Delete employee
    del_res = client.delete(f"/api/v1/admin/employees/{emp_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify not found after delete
    del_again = client.delete(f"/api/v1/admin/employees/{emp_id}")
    assert del_again.status_code == 404

def test_admin_create_and_delete_route():
    payload = {
        "route_name": "Tuyến Mới - P. Cầu Kho",
        "route_code": "A99",
        "ward": "Phường Cầu Kho",
        "district": "Quận 1",
        "description": "Trục Trần Hưng Đạo - Nguyễn Văn Cừ"
    }
    create_res = client.post("/api/v1/admin/routes", json=payload)
    assert create_res.status_code == 201
    created_route = create_res.json()
    assert created_route["route_code"] == "A99"
    assert created_route["route_name"] == "Tuyến Mới - P. Cầu Kho"
    route_id = created_route["id"]

    del_res = client.delete(f"/api/v1/admin/routes/{route_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    del_again = client.delete(f"/api/v1/admin/routes/{route_id}")
    assert del_again.status_code == 404

def test_admin_pricing_history_and_updates():
    # 1. Get initial pricing
    price_res = client.get("/api/v1/admin/pricing")
    assert price_res.status_code == 200
    price_data = price_res.json()
    assert len(price_data["tiers"]) == 4
    tier_1_id = price_data["tiers"][0]["id"]

    # 2. Update a single tier price
    upd_res = client.put(f"/api/v1/admin/pricing/tiers/{tier_1_id}", json={"unit_price": 6800.0})
    assert upd_res.status_code == 200
    assert upd_res.json()["unit_price"] == 6800.0

    # 3. Get pricing history
    hist_res = client.get("/api/v1/admin/pricing/history")
    assert hist_res.status_code == 200
    histories = hist_res.json()
    assert len(histories) >= 1

    # 4. Create a new full tariff
    new_tariff_payload = {
        "name": "Biểu giá thử nghiệm 2026",
        "tariff_code": "TEST_SH_2026",
        "customer_type": "HỘ GIA ĐÌNH SINH HOẠT",
        "decision_number": "QĐ TEST/2026",
        "effective_date": "01/10/2026",
        "tier_1_price": 6900.0,
        "tier_2_price": 7200.0,
        "tier_3_price": 8800.0,
        "tier_4_price": 16000.0
    }
    create_tariff_res = client.post("/api/v1/admin/pricing/tariffs", json=new_tariff_payload)
    assert create_tariff_res.status_code == 201
    created_pricing = create_tariff_res.json()
    assert created_pricing["tariff_code"] == "TEST_SH_2026"
    assert created_pricing["tiers"][0]["unit_price"] == 6900.0

def test_admin_invoice_create_export_update_delete():
    # 1. Create a new invoice for existing meter DH001245
    invoice_payload = {
        "customer_name": "Nguyễn Văn An",
        "meter_code": "DH001245",
        "address": "123 Nguyễn Trãi, Phường Bến Nghé, Quận 1",
        "billing_period": "09/2026",
        "previous_index": 1240.0,
        "current_index": 1258.0,
        "payment_status": "UNPAID"
    }
    create_res = client.post("/api/v1/admin/invoices", json=invoice_payload)
    assert create_res.status_code == 201
    inv_data = create_res.json()
    assert inv_data["customer_name"] == "Nguyễn Văn An"
    assert inv_data["total_consumption"] == 18.0
    assert inv_data["payment_status"] == "UNPAID"
    inv_id = inv_data["id"]

    # Reject negative consumption
    bad_payload = {
        "customer_name": "Sai Chỉ Số",
        "meter_code": "DH001245",
        "previous_index": 1258.0,
        "current_index": 1240.0,
        "billing_period": "09/2026"
    }
    bad_res = client.post("/api/v1/admin/invoices", json=bad_payload)
    assert bad_res.status_code == 400

    # 2. Update status to PAID
    status_res = client.put(f"/api/v1/admin/invoices/{inv_id}/status", json={"payment_status": "PAID"})
    assert status_res.status_code == 200
    assert status_res.json()["payment_status"] == "PAID"

    # 3. Export to Excel (CSV with UTF-8 BOM)
    export_res = client.get("/api/v1/admin/invoices/export?billing_period=09/2026")
    assert export_res.status_code == 200
    assert export_res.headers["content-type"].startswith("text/csv")
    csv_text = export_res.content.decode("utf-8-sig")
    assert "Mã Hóa Đơn" in csv_text
    assert "Nguyễn Văn An" in csv_text

    # 4. Delete invoice
    del_res = client.delete(f"/api/v1/admin/invoices/{inv_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True
