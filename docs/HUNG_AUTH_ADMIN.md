# Phần việc của Hưng – Xác thực & Thống kê Admin (Sprint 2 tuần)

Theo bảng phân công trong `Ke_Hoach_Thiet_Ke_UI_API_Va_Phan_Cong_Nhiem_Vu_2_Tuan.pdf` (mục 4, thành viên 1):

| Hạng mục | Nội dung |
|---|---|
| Use case | Đăng nhập / Đăng xuất · Đăng ký tài khoản · Xem thống kê báo cáo |
| Màn hình | UI 1 Đăng nhập · UI 2 Đăng ký · UI 12 Tổng quan Admin · UI 18 Thống kê báo cáo Admin |
| Backend | Auth JWT (bcrypt), `/auth/login`, `/auth/register`, API báo cáo tổng quan, phân quyền theo vai trò |
| Test | `tests/test_auth.py`, `tests/test_admin_stats.py` |

## 1. Chạy thử

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env          # rồi đổi SECRET_KEY
pytest -q                       # 43 test
uvicorn app.main:app --reload --port 8000   # Swagger: http://localhost:8000/api/v1/docs

# Frontend
cd frontend
npm install
npm run dev                     # http://localhost:3000
```

Tài khoản demo (tự tạo khi khởi động, chỉ dùng cho dev/demo – xem `app/seeds/seed_auth_and_reports.py`):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| ADMIN | admin@waterflow.vn | Admin@123 |
| READER (NV-4881) | nguyentuan@waterflow.vn | Reader@123 |
| READER (NV-5102) | lethihanh@waterflow.vn | Reader@123 |
| CUSTOMER | khachhang@waterflow.vn | Customer@123 |

Đăng nhập được bằng email **hoặc** số điện thoại. Nếu đã có `meter_read.db` cũ thì xóa đi để seed lại dữ liệu demo.

## 2. API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Công khai | Đăng ký Khách hàng (luôn là `CUSTOMER`), trả cặp token |
| POST | `/api/v1/auth/login` | Công khai | Body `{identifier, password}` – identifier là email hoặc SĐT |
| POST | `/api/v1/auth/refresh` | Công khai | Đổi refresh token lấy cặp token mới |
| GET | `/api/v1/auth/me` | Đã đăng nhập | Thông tin người dùng hiện tại |
| GET | `/api/v1/admin/dashboard?billingPeriod=YYYY-MM` | ADMIN | UI 12: tiến độ ghi số, sản lượng so với kỳ trước, doanh thu/công nợ, tỷ lệ AI đọc đúng, sự cố, tiến độ từng tuyến |
| GET | `/api/v1/admin/reports/statistics?fromPeriod=&toPeriod=` | ADMIN | UI 18: số liệu theo tháng, tỷ lệ thu tiền, AI, tiêu thụ theo loại KH, sự cố theo loại, top 5 tiêu thụ, hiệu suất nhân viên (mặc định 6 kỳ gần nhất, tối đa 24 kỳ) |

Mã lỗi: `401` chưa đăng nhập / token sai / hết hạn · `403` sai vai trò hoặc tài khoản bị khóa · `409` trùng email/SĐT · `422` dữ liệu không hợp lệ.

## 3. Thiết kế bảo mật

- Mật khẩu băm **bcrypt** có salt (`app/core/security.py`); không bao giờ trả `hashed_password` ra API.
- JWT HS256, khóa đọc từ `.env` (`SECRET_KEY`). Access token 60 phút, refresh token 7 ngày; claim `type` ngăn dùng lẫn access/refresh.
- Đăng nhập sai luôn trả cùng một thông báo → không lộ email nào đã đăng ký.
- Đăng ký công khai không thể tự đặt vai trò ADMIN/READER.
- Frontend: “Ghi nhớ đăng nhập” lưu phiên ở `localStorage`, ngược lại `sessionStorage`; tự làm mới token khi gặp 401, thất bại thì đăng xuất.

## 4. Dùng cho các bạn khác trong nhóm

Bảo vệ API của mình bằng dependency trong `app/api/deps.py`:

```python
from fastapi import Depends
from app.api.deps import get_current_user, require_roles

# Cả router chỉ cho ADMIN
router = APIRouter(prefix="/admin/routes", dependencies=[Depends(require_roles("ADMIN"))])

# Lấy user hiện tại (vd. khách hàng chỉ xem hóa đơn của mình)
@router.get("/customer/invoices")
def my_invoices(current_user = Depends(require_roles("CUSTOMER"))): ...
```

Frontend gọi API có token bằng `authFetch` trong `src/services/http.ts`; lấy user bằng `useAuth()` trong `src/context/AuthContext.tsx`.
Sidebar Admin (`src/components/admin/AdminLayout.tsx`) đã có đủ 8 mục UI 12–19, các mục của bạn khác đang để “Sắp có” – chỉ cần thêm `page` và component.

## 5. File đã thêm / sửa

Backend: `app/core/security.py`, `app/api/deps.py`, `app/api/v1/auth.py`, `app/api/v1/admin_stats.py`, `app/schemas/auth.py`, `app/schemas/admin_stats.py`, `app/services/auth_service.py`, `app/services/admin_stats_service.py`, `app/seeds/seed_auth_and_reports.py`, `tests/test_auth.py`, `tests/test_admin_stats.py`, `.env.example`; sửa nhỏ `config.py`, `api_router.py`, `seed_data.py`, `requirements.txt`.

Frontend: `src/context/AuthContext.tsx`, `src/services/{http,authApi,adminApi}.ts`, `src/types/{auth,admin}.ts`, `src/pages/auth/{LoginPage,RegisterPage}.tsx`, `src/pages/admin/{AdminDashboardPage,AdminReportsPage}.tsx`, `src/pages/CustomerHomePage.tsx` (màn tạm), `src/components/auth/*`, `src/components/admin/*`; sửa `App.tsx` (điều hướng theo vai trò), `main.tsx`, `Header.tsx` (thêm nút đăng xuất).

## 6. Ghi chú

- Các API cũ của nhóm (`/reader`, `/readings`, `/ai`) **chưa** gắn kiểm tra token để không làm vỡ phần của bạn khác; mỗi người tự thêm `require_roles(...)` khi ghép.
- Dữ liệu lịch sử 5 kỳ (11/2024–03/2025) là dữ liệu demo cho biểu đồ; tắt bằng `SEED_REPORT_DEMO=0`.
