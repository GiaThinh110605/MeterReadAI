"""test_admin_stats.py – API Tổng quan Admin (UI 12) và Thống kê báo cáo (UI 18)."""
import pytest
from fastapi.testclient import TestClient

from app.services.admin_stats_service import period_range, shift_period


@pytest.fixture
def admin_headers(client: TestClient) -> dict:
    res = client.post("/api/v1/auth/login", json={"identifier": "admin@waterflow.vn", "password": "Admin@123"})
    return {"Authorization": f"Bearer {res.json()['accessToken']}"}


def test_period_helpers():
    assert shift_period("2025-01", -1) == "2024-12"
    assert shift_period("2024-12", 1) == "2025-01"
    assert period_range("2024-11", "2025-02") == ["2024-11", "2024-12", "2025-01", "2025-02"]


# ------------------------------------------------------------------ UI 12
def test_dashboard_meter_counts_are_consistent(client: TestClient, admin_headers: dict):
    res = client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["billingPeriod"] == "2025-04"

    m = data["meters"]
    assert m["total"] == 45  # 25 đồng hồ tuyến A01 + 20 đồng hồ tuyến A02 trong seed
    assert m["recorded"] + m["pending"] + m["abnormal"] + m["locked"] == m["total"]
    assert 0 <= m["progressPercent"] <= 100

    assert {r["routeCode"] for r in data["routes"]} == {"A01", "A02"}
    assert sum(r["totalMeters"] for r in data["routes"]) == m["total"]
    assert data["totalReaders"] >= 2 and data["totalCustomers"] >= 1
    # Đồng hồ đã ghi trong kỳ hiện hành phải có lượt ghi tương ứng -> sản lượng > 0
    assert data["totalConsumption"] > 0
    assert data["ai"]["totalReadings"] >= m["recorded"]


def test_dashboard_history_period_has_revenue_and_ai(client: TestClient, admin_headers: dict):
    data = client.get("/api/v1/admin/dashboard?billingPeriod=2025-03", headers=admin_headers).json()
    rev = data["revenue"]
    assert rev["invoiceCount"] > 0
    assert rev["paidAmount"] + rev["unpaidAmount"] == pytest.approx(rev["totalAmount"])
    assert 0 < rev["collectionRate"] < 100  # seed có một phần hóa đơn chưa thu

    ai = data["ai"]
    assert ai["acceptedAsIs"] + ai["corrected"] == ai["totalReadings"]
    assert ai["corrected"] > 0
    assert data["totalConsumption"] > 0
    assert data["previousPeriodConsumption"] > 0
    assert data["consumptionChangePercent"] is not None


def test_dashboard_invalid_period(client: TestClient, admin_headers: dict):
    res = client.get("/api/v1/admin/dashboard?billingPeriod=2025-13", headers=admin_headers)
    assert res.status_code == 422


# ------------------------------------------------------------------ UI 18
def test_report_default_six_months(client: TestClient, admin_headers: dict):
    res = client.get("/api/v1/admin/reports/statistics", headers=admin_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["fromPeriod"] == "2024-11" and data["toPeriod"] == "2025-04"
    assert [m["period"] for m in data["monthly"]] == period_range("2024-11", "2025-04")

    totals = data["totals"]
    assert totals["revenue"] == pytest.approx(sum(m["revenue"] for m in data["monthly"]))
    assert totals["paidAmount"] + totals["unpaidAmount"] == pytest.approx(totals["revenue"])
    assert totals["consumption"] > 0


def test_report_breakdowns(client: TestClient, admin_headers: dict):
    data = client.get(
        "/api/v1/admin/reports/statistics?fromPeriod=2024-11&toPeriod=2025-03", headers=admin_headers
    ).json()
    assert len(data["monthly"]) == 5

    labels = {c["label"] for c in data["consumptionByMeterType"]}
    assert "HỘ GIA ĐÌNH SINH HOẠT" in labels
    assert sum(c["value"] for c in data["consumptionByMeterType"]) == pytest.approx(data["totals"]["consumption"])

    assert sum(a["count"] for a in data["abnormalitiesByType"]) == 5

    tops = [t["consumption"] for t in data["topConsumers"]]
    assert 0 < len(tops) <= 5
    assert tops == sorted(tops, reverse=True)

    codes = {e["employeeCode"]: e for e in data["employeePerformance"]}
    assert {"NV-4881", "NV-5102"} <= set(codes)
    assert codes["NV-4881"]["fullName"] == "Nguyễn Tuấn"


def test_report_rejects_bad_ranges(client: TestClient, admin_headers: dict):
    url = "/api/v1/admin/reports/statistics"
    assert client.get(f"{url}?fromPeriod=2025-04&toPeriod=2025-01", headers=admin_headers).status_code == 422
    assert client.get(f"{url}?fromPeriod=2020-01&toPeriod=2025-01", headers=admin_headers).status_code == 422
    assert client.get(f"{url}?fromPeriod=abc", headers=admin_headers).status_code == 422


def test_report_requires_admin(client: TestClient):
    res = client.post("/api/v1/auth/login", json={"identifier": "khachhang@waterflow.vn", "password": "Customer@123"})
    headers = {"Authorization": f"Bearer {res.json()['accessToken']}"}
    assert client.get("/api/v1/admin/reports/statistics", headers=headers).status_code == 403
    assert client.get("/api/v1/admin/reports/statistics").status_code == 401
