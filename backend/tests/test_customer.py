from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_customer_overview():
    res = client.get("/api/v1/customer/overview")
    assert res.status_code == 200
    data = res.json()
    assert "customerName" in data
    assert "currentBill" in data
    assert "stats" in data
    assert data["stats"]["currentIndex"] == 1258.0

def test_get_customer_invoices():
    res = client.get("/api/v1/customer/invoices")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    assert "202609" in data[0]["invoiceCode"]
    assert data[0]["amount"] == 245000.0

def test_pay_invoice():
    res = client.post("/api/v1/customer/invoices/1/pay")
    assert res.status_code == 200
    data = res.json()
    assert data["paymentStatus"] == "PAID"

def test_complaints_flow():
    get_res = client.get("/api/v1/customer/complaints")
    assert get_res.status_code == 200

    create_res = client.post("/api/v1/customer/complaints", json={
        "ticketType": "Sai chỉ số đồng hồ",
        "invoiceCode": "HD202609001",
        "content": "Chỉ số thực tế khác với hóa đơn",
    })
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert "ticketCode" in created_data

