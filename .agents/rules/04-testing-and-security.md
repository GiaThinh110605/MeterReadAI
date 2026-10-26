# Rule 04: Testing & Security Best Practices

## 1. Phương pháp phát triển theo hướng kiểm thử (TDD & Pytest)
- **Quy tắc TDD:** Viết ca kiểm thử (Test Case) trước hoặc song song với code nghiệp vụ.
- **Tiêu chuẩn kiểm thử:**
  - Mọi API endpoint phải có ít nhất 2 ca kiểm thử: 1 ca thành công (`happy path`) và 2 ca thất bại (dữ liệu sai, không có quyền).
  - Sử dụng FastAPI `TestClient` kết hợp SQLite in-memory (`sqlite:///:memory:`) cho bộ test tự động để tránh làm bẩn dữ liệu thật.
  - Mock mô hình AI nặng trong unit test bằng cách giả lập kết quả `predict()` (chỉ chạy mô hình thật trong integration test chuyên biệt).
- **Nguyên tắc "Verification before completion":**
  - Không bao giờ tuyên bố tính năng hoàn thành nếu chưa chạy lệnh `pytest` và kiểm chứng toàn bộ test cases đều xanh (PASSED).

## 2. Tiêu chuẩn An ninh & Bảo mật (Security Standards)
- **Quản lý Secrets & Biến môi trường:**
  - Tuyệt đối không hardcode mật khẩu, SECRET_KEY, JWT key hoặc token vào mã nguồn.
  - Luôn nạp qua biến môi trường (`.env` file) và đọc bằng `pydantic-settings`.
- **Xác thực & Phân quyền (RBAC):**
  - Mật khẩu người dùng bắt buộc mã hóa bằng `bcrypt` trước khi lưu vào SQLite.
  - Truyền JWT qua Header `Authorization: Bearer <TOKEN>`.
  - Phân quyền theo vai trò: Khách hàng chỉ được xem hóa đơn và ảnh đồng hồ của chính mình (`customer_id == current_user.id`).
- **Bảo mật tiếp nhận File ảnh hiện trường:**
  - Giới hạn dung lượng ảnh tải lên: Tối đa 10MB mỗi ảnh.
  - Kiểm tra MIME type và magic bytes để đảm bảo tệp tải lên là ảnh thật (`image/jpeg`, `image/png`), không nhận file thực thi hoặc script độc hại giả mạo đuôi `.jpg`.
- **Cấu hình CORS & Injection:**
  - Giới hạn CORS chỉ cho phép nguồn gốc đáng tin cậy của Frontend (ví dụ: `http://localhost:3000`, `http://localhost:5173`).
  - Toàn bộ truy vấn cơ sở dữ liệu phải qua SQLAlchemy ORM hoặc parameterized query, tuyệt đối không nối chuỗi raw SQL để tránh SQL Injection.
