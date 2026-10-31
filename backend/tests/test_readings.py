from fastapi.testclient import TestClient

def test_record_reading_success(client: TestClient):
    """Kiểm tra chốt chỉ số đúng quy tắc Imới >= Icũ."""
    # Đồng hồ 1 (Nguyễn Văn An) có previous_index = 1240.0
    payload = {
        "meterId": 1,
        "billingPeriod": "2025-04",
        "confirmedIndex": 1258.0,
        "isModified": False,
        "originalAIValue": "01258",
        "recordedBy": "NV-4881"
    }
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["readingId"] > 0
    assert data["consumption"] == 18.0  # 1258 - 1240
    assert data["readingStatus"] == "CONFIRMED"
    assert data["recordedBy"] == "NV-4881"

def test_record_reading_rejects_negative_consumption(client: TestClient):
    """
    RÀNG BUỘC BẤT BIẾN: Imới < Icũ bắt buộc từ chối lưu và ném lỗi 422.
    Tuyệt đối không tự động đảo dấu hay gán về 0.
    """
    # Đồng hồ 1 có previous_index = 1240.0, gửi chỉ số mới 1230.0 < 1240.0
    payload = {
        "meterId": 1,
        "billingPeriod": "2025-04",
        "confirmedIndex": 1230.0,
        "isModified": False,
        "originalAIValue": "01230",
        "recordedBy": "NV-4881"
    }
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    error_msg = response.json()["detail"]
    assert "Chỉ số mới không được nhỏ hơn chỉ số cũ" in error_msg
    assert "Abnormality" in error_msg

def test_audit_trail_requires_reason_when_modified(client: TestClient):
    """
    CHUỖI TRUY VẾT KIỂM TOÁN (AUDIT TRAIL):
    Khi nhân viên sửa số (isModified=True), bắt buộc phải điền lý do chỉnh sửa.
    """
    payload = {
        "meterId": 1,
        "billingPeriod": "2025-04",
        "confirmedIndex": 1260.0,
        "isModified": True,
        "originalAIValue": "01258",
        "correctionReason": None,  # Không có lý do
        "recordedBy": "NV-4881"
    }
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 422
    assert "correctionReason" in response.json()["detail"]

def test_audit_trail_success_with_reason(client: TestClient):
    """Kiểm tra sửa số thành công khi cung cấp đầy đủ lý do chỉnh sửa."""
    payload = {
        "meterId": 1,
        "billingPeriod": "2025-04",
        "confirmedIndex": 1260.0,
        "isModified": True,
        "originalAIValue": "01258",
        "correctionReason": "Số 8 cuối bị lóa đèn flash, nhân viên nhìn mắt thường xác nhận là số 0",
        "recordedBy": "NV-4881"
    }
    response = client.post("/api/v1/readings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["readingStatus"] == "CORRECTED"
    assert data["consumption"] == 20.0

def test_report_abnormality(client: TestClient):
    """Kiểm tra lập biên bản bất thường tại hiện trường."""
    payload = {
        "meterId": 3,  # Hộ Lê Văn Nam
        "reportType": "LOCKED_DOOR",
        "description": "Nhà đóng cửa khóa xích, gọi điện thoại chuông reo nhưng không ai bắt máy",
        "reportedBy": "NV-4881"
    }
    response = client.post("/api/v1/readings/abnormalities", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["reportType"] == "LOCKED_DOOR"
    assert data["status"] == "PENDING"
