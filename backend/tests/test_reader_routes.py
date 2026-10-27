from fastapi.testclient import TestClient

def test_get_assigned_routes(client: TestClient):
    """Kiểm tra API lấy danh sách tuyến được phân công và tổng quan ca."""
    response = client.get("/api/v1/reader/assigned-routes")
    assert response.status_code == 200
    data = response.json()
    assert "shiftProgressPercent" in data
    assert "totalMetersInShift" in data
    assert len(data["routes"]) >= 2
    assert len(data["priorityAlerts"]) >= 1

    # Tuyến A01
    route_a01 = next(r for r in data["routes"] if r["routeCode"] == "A01")
    assert route_a01["routeName"] == "Tuyến A01 – Phường Bến Nghé, Quận 1"
    assert route_a01["totalMeters"] == 25

def test_get_route_meters(client: TestClient):
    """Kiểm tra API lấy danh sách đồng hồ trong tuyến."""
    response = client.get("/api/v1/reader/routes/1/meters")
    assert response.status_code == 200
    meters = response.json()
    assert len(meters) == 25
    
    # Kiểm tra hộ Nguyễn Văn An
    an = next(m for m in meters if m["customerName"] == "Nguyễn Văn An")
    assert an["meterCode"] == "DH001245"
    assert an["previousIndex"] == 1240.0
    assert an["meterSize"] == "15mm"

def test_calculate_tariff(client: TestClient):
    """Kiểm tra tính tiền nước bậc thang sinh hoạt cho 18m3."""
    response = client.post("/api/v1/tariffs/calculate", json={"consumption": 18.0})
    assert response.status_code == 200
    data = response.json()
    assert data["consumption"] == 18.0
    assert data["totalAmount"] > 140000.0  # Tạm tính nước sinh hoạt 18m3
    assert data["waterAmount"] == 123000.0  # 10*6700 + 8*7000
    assert len(data["tiers"]) == 4
