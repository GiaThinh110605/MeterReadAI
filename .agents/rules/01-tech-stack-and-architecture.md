# Rule 01: Tech Stack & System Architecture

## 1. Ngăn xếp công nghệ bắt buộc (Mandatory Tech Stack)
Tất cả các thành viên và tác nhân AI phải tuân thủ nghiêm ngặt 9 thành phần công nghệ sau, không được tự ý thay thế bằng thư viện khác:
1. **Frontend:** React 18+ với TypeScript và Vite.
2. **UI Design:** Tuân thủ nguyên mẫu Google Stitch (`https://stitch.withgoogle.com/projects/3346993615529581711`), hiện thực bằng Tailwind CSS v3+.
3. **Backend Framework:** FastAPI (Python 3.10+) với Pydantic v2.
4. **AI & Vision:** Mô hình YOLO11-seg (Ultralytics) kết hợp tiền xử lý ảnh OpenCV (`opencv-python-headless`).
5. **Database:** SQLite (chế độ WAL, bật foreign key constraints).
6. **ORM:** SQLAlchemy 2.0 (sử dụng cú pháp hiện đại `Mapped[T]` và `mapped_column`).
7. **API Architecture:** RESTful API chuẩn OpenAPI 3.0 với prefix `/api/v1`.
8. **Containerization:** Docker và Docker Compose (`docker-compose.yml` gồm Frontend và Backend).
9. **Testing:** Pytest với `pytest-asyncio` và FastAPI `TestClient`.

## 2. Cấu trúc thư mục dự án (Project Directory Structure)
Hệ thống được chia thành 2 thư mục chính:
- `backend/`: Mã nguồn FastAPI, AI inference, ORM models, migrations và test.
- `frontend/`: Mã nguồn React + TypeScript + Vite + Tailwind CSS.
- `docker-compose.yml`: Điều phối container toàn hệ thống.

## 3. Quy chuẩn viết mã Backend
- Sử dụng mô hình phân tầng chặt chẽ: `Router -> Service -> Repository / ORM Model`.
- Không viết logic nghiệp vụ phức tạp trực tiếp bên trong route handler.
- Mọi model SQLAlchemy phải có type hint đầy đủ:
  ```python
  from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
  from sqlalchemy import String, Integer, Numeric, ForeignKey, DateTime
  from datetime import datetime

  class Base(DeclarativeBase):
      pass
  ```
- Luôn xử lý bất đồng bộ (`async def`) khi truy vấn database hoặc gọi IO ngoại trừ hàm suy luận mô hình AI (đặt trong threadpool / background task để tránh block event loop).
