---
name: meterreadai-architecture
description: Kiến trúc kỹ thuật và quy chuẩn phát triển cho hệ thống MeterReadAI & WaterFlow gồm FastAPI, YOLO11, OpenCV, SQLAlchemy 2.0, SQLite, React TypeScript và quy tắc nghiệp vụ đồng hồ nước. Kích hoạt khi lập trình backend, xử lý AI inference, tính toán tiền nước bậc thang hoặc tích hợp dữ liệu.
---

# MeterReadAI & WaterFlow Architecture Skill

## 1. Phân định ranh giới kiến trúc (System Boundaries)
- **Khối AI Vision (`MeterReadAI`):** Chịu trách nhiệm tiếp nhận ảnh, định vị vùng mặt số bằng mô hình YOLO11-seg (đầu ra: polygon, bounding box, cropped image) và nhận dạng chuỗi chữ số OCR (CRNN/YOLO). Kết quả trả về `predictedSequence` (chuỗi ký tự, **bắt buộc giữ nguyên số 0 ở đầu**, ví dụ: `"01277"`) kèm điểm tin cậy `detectionConfidence`, `recognitionConfidence`.
- **Khối Nghiệp vụ Quản lý & Tính tiền (`WaterFlow`):** Nhận kết quả từ AI, cung cấp giao diện cho nhân viên kiểm tra, xác nhận hoặc sửa lại số đúng; chốt chỉ số chính thức vào `MeterReading`; tính toán tiêu thụ $q = I_{mới} - I_{cũ}$; áp biểu giá bậc thang `Tariff` và xuất hóa đơn `Invoice`.

## 2. Quy tắc nghiệp vụ bắt buộc (Critical Business Rules)
1. **Ràng buộc chỉ số:** Luôn kiểm tra $I_{mới} \ge I_{cũ}$.
   - Nếu $I_{mới} < I_{cũ}$: Không được tự động đảo dấu hay đặt bằng 0. Hệ thống phải từ chối lưu và yêu cầu nhân viên lập biên bản bất thường (`Abnormality`).
2. **Chuỗi bằng chứng kiểm toán (Audit Trail):**
   - Khi nhân viên sửa lại kết quả đọc của AI: Bắt buộc lưu `isModified = true`, `originalAIValue`, `confirmedIndex`, `correctionReason`, `recordedBy`, `recordedAt`.
   - Kết quả gốc của AI trong `AIRecognition` là **bất biến (immutable)**, không bao giờ được ghi đè.
3. **Snapshot biểu giá trên hóa đơn (Tariff Snapshot):**
   - Hóa đơn `Invoice` khi được lập phải ghi lại chi tiết từng bậc `InvoiceTierDetail` (bậc số, lượng nước phân bổ, đơn giá, thành tiền).
   - Khi Admin cập nhật biểu giá mới, các hóa đơn cũ vẫn phải tái hiện chính xác cách tính tiền tại thời điểm phát hành.
   - Các khoản phụ thu theo luật: Tiền nước sạch + Phí bảo vệ môi trường (10%) + Thuế GTGT (VAT 5%).

## 3. Quy chuẩn Backend (FastAPI + SQLAlchemy 2.0)
- **Cấu trúc thư mục chuẩn:**
  ```text
  backend/
  ├── app/
  │   ├── api/v1/          # Endpoints (auth, reader, customer, admin, ai)
  │   ├── core/            # Config, security, database session
  │   ├── models/          # SQLAlchemy ORM models (Mapped, mapped_column)
  │   ├── schemas/         # Pydantic v2 schemas (Request/Response)
  │   ├── services/        # Business logic & AI inference pipeline
  │   └── main.py          # FastAPI application entrypoint
  ├── tests/               # Pytest suites
  ├── Dockerfile
  └── requirements.txt
  ```
- **SQLAlchemy 2.0 Style:**
  - Sử dụng cú pháp mới `Mapped[T]` và `mapped_column()`.
  - Luôn bật `PRAGMA foreign_keys = ON;` và `PRAGMA journal_mode = WAL;` cho SQLite.
- **Xử lý ảnh an toàn (OpenCV):**
  - Không truyền trực tiếp path file không an toàn vào OpenCV.
  - Đọc file từ `UploadFile.read()`, giải mã bằng `cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)`.
  - Bắt lỗi khi ảnh bị hỏng/không decode được $\rightarrow$ trả HTTP `400 Bad Request`.
