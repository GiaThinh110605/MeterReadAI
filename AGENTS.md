# AGENTS.md — Master AI Instructions for MeterReadAI & WaterFlow

Dự án **MeterReadAI & WaterFlow** là hệ thống Đọc chỉ số đồng hồ nước bằng Trí tuệ nhân tạo (YOLO11-seg + OCR) kết hợp Hệ thống Quản lý và Tính tiền nước tự động. Mọi AI Coding Assistant (Antigravity, Cursor, Windsurf, Claude Code, Codex...) khi làm việc trên kho mã nguồn này **BẮT BUỘC** phải đọc và tuân thủ các chỉ dẫn dưới đây.

---

## 1. Bắt buộc 9 Thành phần Công nghệ (Mandatory Tech Stack)
1. **Frontend:** React 18+ với TypeScript và Vite.
2. **UI Framework:** Tailwind CSS v3+, bám sát nguyên mẫu [Google Stitch](https://stitch.withgoogle.com/projects/3346993615529581711).
3. **Backend Framework:** FastAPI (Python 3.10+) với Pydantic v2.
4. **AI & Vision:** YOLO11-seg (Ultralytics) + OpenCV tiền xử lý ảnh.
5. **Database:** SQLite (chế độ WAL, bật foreign key constraints).
6. **ORM:** SQLAlchemy 2.0 (cú pháp hiện đại `Mapped[T]` và `mapped_column`).
7. **API Architecture:** RESTful API chuẩn OpenAPI 3.0, tiền tố `/api/v1`.
8. **Containerization:** Docker & Docker Compose (`backend` port 8000, `frontend` port 3000).
9. **Testing:** Pytest (TDD workflow, FastAPI TestClient).

---

## 2. Quy tắc Nghiệp vụ Bất biến (Core Domain Rules)
1. **Ràng buộc chỉ số:** Luôn kiểm tra $I_{mới} \ge I_{cũ}$. Nếu $I_{mới} < I_{cũ}$, từ chối lưu và yêu cầu lập biên bản bất thường (`Abnormality`). Tuyệt đối không tự đảo dấu hay đặt về $0$.
2. **Bảo toàn số 0 ở đầu:** Chuỗi số đọc được (`predictedSequence`) phải lưu ở dạng String để giữ nguyên các chữ số `0` ở đầu (ví dụ: `"01277"`).
3. **Audit Trail (Chuỗi bằng chứng):** Khi nhân viên sửa kết quả AI, bắt buộc ghi log: `isModified = True`, `originalAIValue`, `confirmedIndex`, `correctionReason`, `recordedBy`, `readingDate`. Dữ liệu gốc trong `AIRecognition` là bất biến.
4. **Tính tiền nước bậc thang:** $q = I_{mới} - I_{cũ}$. Tính từng bậc $q_j \times p_j$, cộng phí BVMT (10%) và VAT (5%). Mỗi hóa đơn `Invoice` phải lưu kèm snapshot chi tiết `InvoiceTierDetail`.

---

## 3. Quy chuẩn Thiết kế UI (Stitch Fidelity)
- Tham chiếu trực tiếp: `https://stitch.withgoogle.com/projects/3346993615529581711`
- Không sử dụng màu sắc AI generic. Dùng bảng màu tinh tế: chủ đạo xanh nước biển (`blue-600` / `indigo-700`), nền `slate-50`, điểm nhấn `emerald-600` và `amber-500`.
- Giao diện nhân viên ghi số phải tối ưu cho Mobile (nút bấm to, thao tác 1 tay, camera kèm khung lưới ngắm).

---

## 4. Kỷ luật Kỹ thuật & Kiểm thử (Engineering & Verification)
- **TDD:** Viết test trước hoặc song song với code. Sử dụng `pytest` kiểm tra mọi endpoint.
- **Verification before completion:** Không bao giờ tuyên bố hoàn thành nếu chưa chạy lệnh kiểm thử thực tế và xác nhận test pass.
- **An toàn tệp:** Kiểm tra magic bytes ảnh tải lên (JPEG/PNG), giới hạn dung lượng < 10MB.
- **Không hardcode:** Đọc toàn bộ SECRET_KEY, JWT key từ file `.env`.
