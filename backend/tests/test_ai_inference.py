import io
import cv2
import numpy as np
from fastapi.testclient import TestClient
from pathlib import Path

def test_predict_rejects_non_image_file(client: TestClient):
    """Kiểm tra validation magic bytes: từ chối file văn bản/không phải ảnh (trả về 400)."""
    fake_txt_file = io.BytesIO(b"Hello world, this is a plain text file pretending to be an image.")
    response = client.post(
        "/api/v1/ai/predict",
        data={"meterId": 1},
        files={"file": ("fake.txt", fake_txt_file, "text/plain")}
    )
    assert response.status_code == 400
    assert "Định dạng tệp không hợp lệ" in response.json()["detail"]

def test_predict_rejects_nonexistent_meter(client: TestClient):
    """Kiểm tra khi meterId không tồn tại trong hệ thống (trả về 404)."""
    # Tạo ảnh JPEG giả lập hợp lệ
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buf = cv2.imencode(".jpg", dummy_img)
    img_bytes = io.BytesIO(buf.tobytes())

    response = client.post(
        "/api/v1/ai/predict",
        data={"meterId": 999999},
        files={"file": ("sample.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 404
    assert "Không tìm thấy đồng hồ nước" in response.json()["detail"]

def test_predict_valid_image(client: TestClient):
    """Kiểm tra xử lý ảnh hợp lệ: giải mã OpenCV -> YOLO11-seg -> CRNN -> trả bbox và confidence."""
    test_dir = Path(__file__).parent
    candidates = [
        test_dir / "sample_meter.jpg",
        Path("backend/uploads/meter_capture.jpg"),
        Path("uploads/meter_capture.jpg"),
        Path("data/DataAfterHandle/water_meters/images/id_1000_value_176_881.jpg"),
    ]
    img_bytes = None
    for p in candidates:
        if p.exists():
            with open(p, "rb") as f:
                img_bytes = io.BytesIO(f.read())
            break

    if img_bytes is None:
        test_img = np.ones((480, 640, 3), dtype=np.uint8) * 128
        cv2.putText(test_img, "01258", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        _, buf = cv2.imencode(".jpg", test_img)
        img_bytes = io.BytesIO(buf.tobytes())

    response = client.post(
        "/api/v1/ai/predict",
        data={"meterId": 1},
        files={"file": ("valid_meter.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "requestId" in data
    assert data["meterId"] == 1
    assert "meterCode" in data
    
    # Kiểm tra prediction
    pred = data["prediction"]
    assert isinstance(pred["predictedSequence"], str)
    assert pred["confidence"] > 0
    assert pred["numericalValue"] > 0
    
    # Kiểm tra visualization
    vis = data["visualization"]
    assert "originalImageUrl" in vis
    assert "croppedImageUrl" in vis
    assert len(vis["bbox"]) == 4


def test_predict_unreadable_image_returns_zero_confidence(client: TestClient):
    blank_img = np.zeros((480, 640, 3), dtype=np.uint8)
    _, buf = cv2.imencode(".jpg", blank_img)
    img_bytes = io.BytesIO(buf.tobytes())

    response = client.post(
        "/api/v1/ai/predict",
        data={"meterId": 1},
        files={"file": ("blank_meter.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    pred = data["prediction"]
    assert pred["predictedSequence"] != "01258"
    assert pred["confidence"] == 0.0 or pred["predictedSequence"] == ""
