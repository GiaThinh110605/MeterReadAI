# HƯỚNG DẪN TRIỂN KHAI & KHỞI ĐỘNG HỆ THỐNG METERREADAI & WATERFLOW
> **Kiến trúc:** Ubuntu 24.04 (Multipass) + Gunicorn ASGI + Nginx HTTPS Reverse Proxy + React Vite + Cloudflare Tunnel

---

## 1. Thiết lập Môi trường & Mã nguồn trên Ubuntu 24.04 (Multipass)

### Bước 1: Khởi tạo máy ảo Ubuntu 24.04
Chạy trên Terminal máy Mac:
```bash
brew install multipass
multipass launch 24.04 --name vps-demo --memory 2G --disk 10G
```

### Bước 2: Gắn (Mount) thư mục mã nguồn từ Mac vào VPS
```bash
multipass mount /Users/mac/MeterReadAI vps-demo:/home/ubuntu/MeterReadAI
```
*Lưu ý: Lệnh mount giúp đồng bộ thời gian thực: khi sửa mã nguồn trên Mac, VPS tự động nhận mà không cần copy hay git push.*

### Bước 3: Truy cập vào máy ảo và cài đặt môi trường
```bash
multipass shell vps-demo
sudo apt update && sudo apt install -y python3-venv python3-pip nginx libgl1 libglib2.0-0

cd /home/ubuntu
python3 -m venv meter_env
source meter_env/bin/activate

pip install --no-cache-dir gunicorn fastapi "uvicorn[standard]" sqlalchemy pydantic \
pydantic-settings email-validator python-multipart python-dotenv pillow httpx \
opencv-python-headless numpy

# Cài đặt PyTorch bản CPU (tránh lỗi tràn đĩa No space left on device)
pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install --no-cache-dir ultralytics
```

---

## 2. Cấu hình Gunicorn & Systemd Service

### Cấu hình `gunicorn_conf.py`
Tệp cấu hình tại `/home/ubuntu/MeterReadAI/backend/gunicorn_conf.py`:
- Sử dụng Unix Socket tại `/tmp/gunicorn.sock` (bắt buộc đặt tại `/tmp` để tránh giới hạn quyền của 9p mount).
- Quản lý worker Uvicorn: `uvicorn.workers.UvicornWorker`.

### Đăng ký Systemd Service (`meterreadai.service`)
Tạo tệp `/etc/systemd/system/meterreadai.service`:
```ini
[Unit]
Description=Gunicorn instance to serve MeterReadAI FastAPI
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/MeterReadAI/backend
Environment="PATH=/home/ubuntu/meter_env/bin"
ExecStart=/home/ubuntu/meter_env/bin/gunicorn -c gunicorn_conf.py app.main:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Kích hoạt dịch vụ:
```bash
sudo systemctl daemon-reload
sudo systemctl start meterreadai
sudo systemctl enable meterreadai
```

---

## 3. Cấu hình Nginx Reverse Proxy với HTTPS (SSL Tự ký)

Tạo chứng chỉ SSL nội bộ:
```bash
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/meterreadai.key \
  -out /etc/nginx/ssl/meterreadai.crt \
  -subj "/C=VN/ST=HCM/L=HCM/O=MeterReadAI/CN=192.168.252.2"
```

Cấu hình máy chủ ảo `/etc/nginx/sites-available/meterreadai`:
- Lắng nghe port 80 và tự động chuyển hướng 301 sang HTTPS (443).
- Lắng nghe port 443 SSL và reverse proxy về `http://unix:/tmp/gunicorn.sock`.
- Cấu hình `client_max_body_size 15M;` cho phép upload ảnh hiện trường độ phân giải cao.

---

## 4. Cấu hình Frontend React & Mở Tunnel ra Toàn cầu

### Frontend Vite Proxy (`frontend/vite.config.ts`)
```typescript
server: {
  port: 3000,
  host: '0.0.0.0',
  allowedHosts: true,
  proxy: {
    '/api': {
      target: 'https://192.168.252.2',
      changeOrigin: true,
      secure: false, // Bỏ qua SSL tự ký
    },
    '/uploads': {
      target: 'https://192.168.252.2',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

---

## 5. Quy trình Khởi động Hàng ngày (Daily Restart Workflow)

Mỗi khi mở máy Mac làm việc, chỉ cần 3 bước đơn giản:

| Thứ tự | Thao tác | Lệnh thực thi trên Terminal Mac |
| :--- | :--- | :--- |
| **Bước 1** | Bật VPS (Backend & Nginx tự chạy ngầm) | `multipass start vps-demo` |
| **Bước 2** | Bật Frontend React | `cd frontend && npm run dev` |
| **Bước 3** | Mở đường hầm ra Internet | `cloudflared tunnel --url http://localhost:3000` |

### ⚠️ Khắc phục sự cố khi Web bị xoay tròn không tải được dữ liệu
> Khi máy ảo VPS vừa bật lại sau khi tắt máy Mac hoặc máy Mac thức dậy từ chế độ sleep, thư mục mount 9p chia sẻ có thể kết nối trễ vài giây khiến Gunicorn bị lỗi mất socket kết nối cũ. Nếu mở web thấy biểu tượng xoay liên tục không load data, hãy chạy ngay lệnh sau trên Terminal máy Mac để khởi động lại Backend lập tức:
> ```bash
> multipass exec vps-demo -- sudo systemctl restart meterreadai
> ```

---

## 6. Bảng Tra cứu Lệnh Nhanh (Cheatsheet)

| Thao tác quản trị & Xử lý sự cố | Lệnh thực thi trên Terminal Mac |
| :--- | :--- |
| **Khởi động lại Backend khi sửa code / khi web treo** | `multipass exec vps-demo -- sudo systemctl restart meterreadai` |
| **Kiểm tra trạng thái dịch vụ Backend** | `multipass exec vps-demo -- sudo systemctl status meterreadai` |
| **Xem log thời gian thực của Backend** | `multipass exec vps-demo -- sudo journalctl -u meterreadai -f` |
| **Khởi động lại web server Nginx** | `multipass exec vps-demo -- sudo systemctl restart nginx` |
| **Lấy nhanh link Cloudflare đang chạy** | `curl -s http://localhost:20241/quicktunnel` |
| **Vào trực tiếp shell của VPS** | `multipass shell vps-demo` |

---

## 7. Tài khoản Đăng nhập Hệ thống Kiểm thử

- **Quản trị viên (ADMIN):** `admin@waterflow.vn` / `mock_hashed_password` (Quản lý tuyến, nhân viên, bảng giá bậc thang, duyệt hóa đơn).
- **Nhân viên tác nghiệp (READER):** `nguyentuan@waterflow.vn` / `mock_hashed_password` (Ghi chỉ số, chụp ảnh camera AI, kiểm tra $I_{mới} \ge I_{cũ}$).
