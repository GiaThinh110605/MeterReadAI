import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable, PageBreak
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Đăng ký phông chữ Arial chuẩn Unicode tiếng Việt từ hệ thống macOS
font_dir = "/System/Library/Fonts/Supplemental"
pdfmetrics.registerFont(TTFont("Arial", os.path.join(font_dir, "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", os.path.join(font_dir, "Arial Bold.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Italic", os.path.join(font_dir, "Arial Italic.ttf")))

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Arial", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (từ trang 2 trở đi)
        if self._pageNumber > 1:
            self.drawString(40, 810, "Deploying FastAPI Application with Gunicorn and Nginx on Ubuntu 24.04")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(40, 802, 555, 802)
            
        # Footer
        text = f"Trang {self._pageNumber} / {page_count}"
        self.drawRightString(555, 25, text)
        self.drawString(40, 25, "MeterReadAI & WaterFlow | Hướng dẫn Deploy Production")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 35, 555, 35)
        self.restoreState()

def create_guide_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=45,
        bottomMargin=45
    )
    
    # Định nghĩa các style đồng bộ 100% phông chữ Arial (chống lỗi vỡ font tiếng Việt)
    title_style = ParagraphStyle(
        "DocTitle",
        fontName="Arial-Bold",
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        fontName="Arial",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12
    )
    section_h1 = ParagraphStyle(
        "SectionH1",
        fontName="Arial-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1D4ED8"), # Blue-700
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )
    substep_title = ParagraphStyle(
        "SubStepTitle",
        fontName="Arial-Bold",
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )
    body_p = ParagraphStyle(
        "BodyP",
        fontName="Arial",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155")
    )
    cmd_text = ParagraphStyle(
        "CmdText",
        fontName="Arial",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A")
    )
    out_text = ParagraphStyle(
        "OutText",
        fontName="Arial-Italic",
        fontSize=7.8,
        leading=10.5,
        textColor=colors.HexColor("#15803D")
    )
    note_text = ParagraphStyle(
        "NoteText",
        fontName="Arial-Italic",
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#0369A1")
    )

    def cmd_box(text):
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        p = Paragraph(escaped, cmd_text)
        t = Table([[p]], colWidths=[515])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        return t

    def out_box(text):
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        p = Paragraph(f"<b>Output:</b><br/>{escaped}", out_text)
        t = Table([[p]], colWidths=[515])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#86EFAC")),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        return t

    def note_box(text):
        escaped = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        p = Paragraph(f"💡 <b>Lưu ý kỹ thuật:</b> {escaped}", note_text)
        t = Table([[p]], colWidths=[515])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0F9FF")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#BAE6FD")),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        return t

    def alert_box(title, text):
        p = Paragraph(f"⚠️ <b>{title}:</b> {text}", note_text)
        t = Table([[p]], colWidths=[515])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFBEB")),
            ('BOX', (0,0), (-1,-1), 0.7, colors.HexColor("#F59E0B")),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        return t

    story = []

    # Title
    story.append(Paragraph("Deploying a FastAPI Application with Gunicorn and Nginx on Ubuntu 24.04", title_style))
    story.append(Paragraph("Cẩm nang hướng dẫn triển khai toàn diện từ đầu đến ra sản phẩm dành cho dự án <b>MeterReadAI & WaterFlow</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceAfter=8))

    # Prerequisites & Context
    story.append(Paragraph(
        "FastAPI là nền tảng web hiện đại hỗ trợ lập trình bất đồng bộ (async/await) với hiệu năng xử lý cao, tích hợp sẵn tài liệu Swagger UI. "
        "Giả định bạn hoặc đồng đội đã <b>hoàn thành mã nguồn Backend</b> (chứa <code>app/main.py</code>, database, mô hình AI YOLO11). "
        "Hướng dẫn này sẽ dẫn bạn từng bước từ khâu thiết lập môi trường máy chủ Ubuntu 24.04, cấu hình Gunicorn làm application server "
        "với Uvicorn worker, bảo vệ bằng Nginx Reverse Proxy với chứng chỉ SSL, kết nối Frontend React và tạo đường link công khai toàn cầu bằng Cloudflare Tunnel.",
        body_p
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Yêu cầu chuẩn bị (Prerequisites):</b> Máy tính macOS có cài đặt Multipass (để tạo máy ảo Ubuntu 24.04 chuẩn Production miễn phí) và thư mục mã nguồn <code>MeterReadAI</code> đã code xong.", body_p))
    story.append(Spacer(1, 4))

    # SECTION 1
    story.append(Paragraph("1. Set Up the Project & Environment on Ubuntu 24.04", section_h1))
    story.append(Paragraph("Khi backend đã code xong, bước đầu tiên là chuẩn bị máy chủ Ubuntu 24.04 và nạp mã nguồn vào môi trường:", body_p))

    story.append(Paragraph("1. Khởi tạo máy chủ Ubuntu 24.04 bằng Multipass (chạy trên Terminal máy Mac):", substep_title))
    story.append(cmd_box("$ brew install multipass\n$ multipass launch 24.04 --name vps-demo --memory 2G --disk 10G"))
    story.append(out_box("Launched: vps-demo"))

    story.append(Paragraph("2. Gắn (Mount) thư mục mã nguồn dự án từ máy Mac vào thẳng máy ảo VPS:", substep_title))
    story.append(cmd_box("$ multipass mount /Users/mac/MeterReadAI vps-demo:/home/ubuntu/MeterReadAI"))
    story.append(note_box("Lệnh mount giúp chia sẻ tệp theo thời gian thực: bạn sửa code trên Mac thì bên trong VPS tự động nhận mà không cần copy hay git push."))

    story.append(Paragraph("3. Truy cập vào giao diện dòng lệnh của VPS:", substep_title))
    story.append(cmd_box("$ multipass shell vps-demo"))
    story.append(out_box("ubuntu@vps-demo:~$"))

    story.append(Paragraph("4. Cập nhật hệ thống APT và cài đặt các gói cần thiết:", substep_title))
    story.append(cmd_box("$ sudo apt update && sudo apt install -y python3-venv python3-pip nginx libgl1 libglib2.0-0"))
    story.append(note_box("libgl1 và libglib2.0-0 là thư viện xử lý đồ họa bắt buộc cho OpenCV và Ultralytics."))

    story.append(Paragraph("5. Tạo môi trường ảo Python (venv) cô lập:", substep_title))
    story.append(cmd_box("$ cd /home/ubuntu\n$ python3 -m venv meter_env\n$ source meter_env/bin/activate"))
    story.append(out_box("(meter_env) ubuntu@vps-demo:~$"))

    story.append(Paragraph("6. Cài đặt các gói thư viện backend của dự án:", substep_title))
    story.append(cmd_box("$ pip install --no-cache-dir gunicorn fastapi \"uvicorn[standard]\" sqlalchemy pydantic \\\n    pydantic-settings email-validator python-multipart python-dotenv pillow httpx \\\n    opencv-python-headless numpy"))

    story.append(Paragraph("7. Cài đặt PyTorch bản CPU và Ultralytics (Tránh lỗi tràn đĩa):", substep_title))
    story.append(cmd_box("$ pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu\n$ pip install --no-cache-dir ultralytics"))
    story.append(note_box("Mặc định pip cài torch sẽ tải gói CUDA >4GB gây lỗi tràn ổ đĩa 'No space left on device'. Cài bản CPU chỉ nặng 170MB, chạy cực nhanh và an toàn."))

    story.append(Paragraph("8. Kiểm tra nạp thử ứng dụng backend đã code sẵn:", substep_title))
    story.append(cmd_box("$ cd /home/ubuntu/MeterReadAI/backend\n$ python3 -c \"import app.main; print('App loaded successfully!')\""))
    story.append(out_box("App loaded successfully!"))

    story.append(Paragraph("9. Chạy thử server tạm thời với Uvicorn:", substep_title))
    story.append(cmd_box("$ uvicorn app.main:app --host 0.0.0.0 --port 8000"))
    story.append(out_box("INFO:     Started server process\nINFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)"))

    story.append(Paragraph("10. Kiểm tra phản hồi trong một phiên terminal mới:", substep_title))
    story.append(cmd_box("$ curl http://localhost:8000/"))
    story.append(out_box("{\"system\":\"MeterReadAI & WaterFlow\",\"version\":\"1.0.0\",\"docs\":\"/api/v1/docs\",\"status\":\"online\"}"))
    story.append(Spacer(1, 4))

    # SECTION 2
    story.append(Paragraph("2. Deploy FastAPI Using Gunicorn & Systemd", section_h1))
    story.append(Paragraph(
        "Gunicorn là máy chủ WSGI/ASGI HTTP cho hệ điều hành UNIX, đóng vai trò quản lý các tiến trình (Process Manager). "
        "Nó hỗ trợ FastAPI thông qua lớp <code>uvicorn.workers.UvicornWorker</code>.",
        body_p
    ))

    story.append(Paragraph("1. Khởi động thử Gunicorn với Uvicorn worker:", substep_title))
    story.append(cmd_box("$ cd /home/ubuntu/MeterReadAI/backend\n$ gunicorn app.main:app -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000"))

    story.append(Paragraph("2. Kiểm tra phản hồi:", substep_title))
    story.append(cmd_box("$ curl http://localhost:8000/"))
    story.append(out_box("{\"system\":\"MeterReadAI & WaterFlow\",\"version\":\"1.0.0\",\"docs\":\"/api/v1/docs\",\"status\":\"online\"}"))
    story.append(Paragraph("(Bấm <code>Ctrl + C</code> để dừng server thử nghiệm).", body_p))

    story.append(Paragraph("3. Tạo file cấu hình Gunicorn (gunicorn_conf.py):", substep_title))
    story.append(cmd_box("$ nano /home/ubuntu/MeterReadAI/backend/gunicorn_conf.py"))

    story.append(Paragraph("4. Dán nội dung cấu hình sau vào file:", substep_title))
    story.append(cmd_box(
        "import os\n"
        "from multiprocessing import cpu_count\n\n"
        "# Socket path: BẮT BUỘC dùng /tmp để tránh lỗi quyền Operation not permitted của thư mục mount\n"
        "bind = 'unix:/tmp/gunicorn.sock'\n\n"
        "# Worker options: đa tiến trình theo số nhân CPU\n"
        "workers = cpu_count() + 1\n"
        "worker_class = 'uvicorn.workers.UvicornWorker'\n\n"
        "# Logging options\n"
        "keepalive = 5\n"
        "timeout = 120\n"
        "loglevel = 'info'\n"
        "accesslog = '/home/ubuntu/MeterReadAI/backend/access.log'\n"
        "errorlog = '/home/ubuntu/MeterReadAI/backend/error.log'"
    ))
    story.append(note_box("Thư mục mount từ Mac không hỗ trợ Unix Socket nên bắt buộc đặt socket tại /tmp/gunicorn.sock để Nginx kết nối."))

    story.append(Paragraph("5. Tạo file Systemd Unit Service để chạy ngầm và tự khởi động lại:", substep_title))
    story.append(cmd_box("$ sudo nano /etc/systemd/system/meterreadai.service"))

    story.append(Paragraph("6. Thêm nội dung sau vào file service:", substep_title))
    story.append(cmd_box(
        "[Unit]\n"
        "Description=Gunicorn & Uvicorn Service for MeterReadAI Backend\n"
        "After=network.target\n\n"
        "[Service]\n"
        "User=ubuntu\n"
        "Group=www-data\n"
        "WorkingDirectory=/home/ubuntu/MeterReadAI/backend\n"
        "ExecStart=/home/ubuntu/meter_env/bin/gunicorn -c /home/ubuntu/MeterReadAI/backend/gunicorn_conf.py app.main:app\n"
        "Restart=always\n"
        "RestartSec=3\n\n"
        "[Install]\n"
        "WantedBy=multi-user.target"
    ))
    story.append(note_box("Group=www-data cho phép Nginx đọc ghi socket. Restart=always tự bật lại app sau 3s nếu gặp crash."))

    story.append(Paragraph("7. Nạp lại cấu hình daemon của systemd:", substep_title))
    story.append(cmd_box("$ sudo systemctl daemon-reload"))

    story.append(Paragraph("8. Kích hoạt và khởi động dịch vụ:", substep_title))
    story.append(cmd_box("$ sudo systemctl enable --now meterreadai"))
    story.append(out_box("Created symlink /etc/systemd/system/multi-user.target.wants/meterreadai.service → /etc/systemd/system/meterreadai.service."))

    story.append(Paragraph("9. Kiểm tra trạng thái hoạt động của dịch vụ:", substep_title))
    story.append(cmd_box("$ sudo systemctl status meterreadai"))
    story.append(out_box("● meterreadai.service - Gunicorn & Uvicorn Service for MeterReadAI Backend\n     Loaded: loaded\n     Active: active (running)"))

    story.append(Paragraph("10. Kiểm tra kết nối Unix Socket trực tiếp:", substep_title))
    story.append(cmd_box("$ curl --unix-socket /tmp/gunicorn.sock http://localhost/"))
    story.append(out_box("{\"system\":\"MeterReadAI & WaterFlow\",\"version\":\"1.0.0\",\"docs\":\"/api/v1/docs\",\"status\":\"online\"}"))
    story.append(Spacer(1, 4))

    # SECTION 3
    story.append(Paragraph("3. Set Up Nginx as a Reverse Proxy", section_h1))
    story.append(Paragraph(
        "Nginx đóng vai trò Reverse Proxy nhận các kết nối mạng, xử lý mã hóa SSL, giới hạn dung lượng upload ảnh và chuyển tiếp vào socket của Gunicorn.",
        body_p
    ))

    story.append(Paragraph("1. Tạo file cấu hình VirtualHost cho ứng dụng:", substep_title))
    story.append(cmd_box("$ sudo nano /etc/nginx/sites-available/meterreadai"))

    story.append(Paragraph("2. Thêm nội dung cấu hình chuyển tiếp request vào file socket:", substep_title))
    story.append(cmd_box(
        "server {\n"
        "    listen 80;\n"
        "    server_name 192.168.252.2; # Hoặc domain của bạn\n\n"
        "    client_max_body_size 15M; # Cần thiết cho upload ảnh đồng hồ nước\n\n"
        "    location / {\n"
        "        proxy_pass http://unix:/tmp/gunicorn.sock;\n"
        "        proxy_set_header Host $host;\n"
        "        proxy_set_header X-Real-IP $remote_addr;\n"
        "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n"
        "        proxy_set_header X-Forwarded-Proto $scheme;\n"
        "        proxy_http_version 1.1;\n"
        "        proxy_set_header Upgrade $http_upgrade;\n"
        "        proxy_set_header Connection \"upgrade\";\n"
        "        proxy_connect_timeout 60s;\n"
        "        proxy_read_timeout 120s;\n"
        "    }\n"
        "}"
    ))

    story.append(Paragraph("3. Tạo liên kết kích hoạt cấu hình vào sites-enabled/:", substep_title))
    story.append(cmd_box("$ sudo rm -f /etc/nginx/sites-enabled/default\n$ sudo ln -sf /etc/nginx/sites-available/meterreadai /etc/nginx/sites-enabled/"))

    story.append(Paragraph("4. Kiểm tra cú pháp cấu hình Nginx:", substep_title))
    story.append(cmd_box("$ sudo nginx -t"))
    story.append(out_box("nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful"))

    story.append(Paragraph("5. Nạp lại cấu hình Nginx để áp dụng:", substep_title))
    story.append(cmd_box("$ sudo systemctl reload nginx"))
    story.append(Spacer(1, 4))

    # SECTION 4
    story.append(Paragraph("4. Secure Nginx with an SSL Certificate (HTTPS)", section_h1))
    story.append(Paragraph("Thiết lập mã hóa HTTPS qua cổng 443 với chứng chỉ SSL tự ký (Self-Signed SSL) bằng OpenSSL:", body_p))

    story.append(Paragraph("1. Kiểm tra IP máy ảo và tạo chứng chỉ SSL 365 ngày:", substep_title))
    story.append(cmd_box(
        "$ hostname -I # Ví dụ in ra 192.168.252.2\n"
        "$ sudo mkdir -p /etc/nginx/ssl\n"
        "$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\\n"
        "    -keyout /etc/nginx/ssl/meterreadai.key \\\n"
        "    -out /etc/nginx/ssl/meterreadai.crt \\\n"
        "    -subj \"/C=VN/ST=HCM/L=HCM/O=MeterReadAI/CN=192.168.252.2\""
    ))

    story.append(Paragraph("2. Cập nhật file Nginx cấu hình cả chuyển hướng HTTP sang HTTPS và lắng nghe cổng 443:", substep_title))
    story.append(cmd_box("$ sudo nano /etc/nginx/sites-available/meterreadai"))
    story.append(Paragraph("Thay thế bằng nội dung hoàn chỉnh:", body_p))
    story.append(cmd_box(
        "# 1. Tự động chuyển toàn bộ HTTP (80) sang HTTPS (443)\n"
        "server {\n"
        "    listen 80;\n"
        "    server_name 192.168.252.2;\n"
        "    return 301 https://$host$request_uri;\n"
        "}\n\n"
        "# 2. Máy chủ HTTPS chính\n"
        "server {\n"
        "    listen 443 ssl;\n"
        "    server_name 192.168.252.2;\n"
        "    ssl_certificate /etc/nginx/ssl/meterreadai.crt;\n"
        "    ssl_certificate_key /etc/nginx/ssl/meterreadai.key;\n"
        "    ssl_protocols TLSv1.2 TLSv1.3;\n"
        "    ssl_ciphers HIGH:!aNULL:!MD5;\n"
        "    client_max_body_size 15M;\n\n"
        "    location / {\n"
        "        proxy_pass http://unix:/tmp/gunicorn.sock;\n"
        "        proxy_set_header Host $host;\n"
        "        proxy_set_header X-Real-IP $remote_addr;\n"
        "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n"
        "        proxy_set_header X-Forwarded-Proto https;\n"
        "        proxy_http_version 1.1;\n"
        "        proxy_set_header Upgrade $http_upgrade;\n"
        "        proxy_set_header Connection \"upgrade\";\n"
        "        proxy_read_timeout 120s;\n"
        "    }\n"
        "}"
    ))

    story.append(Paragraph("3. Kiểm tra cú pháp và khởi động lại Nginx:", substep_title))
    story.append(cmd_box("$ sudo nginx -t && sudo systemctl restart nginx"))
    story.append(out_box("nginx: configuration file /etc/nginx/nginx.conf test is successful"))

    story.append(Paragraph("4. Xác nhận kết nối HTTPS hoạt động:", substep_title))
    story.append(cmd_box("$ curl -k -i https://192.168.252.2/api/v1/docs"))
    story.append(out_box("HTTP/1.1 200 OK\nServer: nginx/1.24.0 (Ubuntu)\nContent-Type: text/html; charset=utf-8"))
    story.append(Spacer(1, 4))

    # SECTION 5
    story.append(Paragraph("5. Cấu hình Frontend React & Mở Tunnel ra Toàn cầu để Demo", section_h1))
    story.append(Paragraph("Thực hiện trên máy Mac để kết nối Frontend React Vite và tạo đường link công khai toàn cầu:", body_p))

    story.append(Paragraph("1. Cập nhật frontend/vite.config.ts:", substep_title))
    story.append(cmd_box(
        "export default defineConfig({\n"
        "  plugins: [react()],\n"
        "  server: {\n"
        "    port: 3000,\n"
        "    host: '0.0.0.0',\n"
        "    allowedHosts: true, // Cho phép domain Cloudflare Tunnel truy cập (chống lỗi 403)\n"
        "    proxy: {\n"
        "      '/api': {\n"
        "        target: 'https://192.168.252.2',\n"
        "        changeOrigin: true,\n"
        "        secure: false, // Bỏ qua xác thực SSL tự ký\n"
        "      },\n"
        "      '/uploads': {\n"
        "        target: 'https://192.168.252.2',\n"
        "        changeOrigin: true,\n"
        "        secure: false,\n"
        "      }\n"
        "    }\n"
        "  }\n"
        "});"
    ))

    story.append(Paragraph("2. Bật máy chủ Frontend trên máy Mac:", substep_title))
    story.append(cmd_box("$ cd /Users/mac/MeterReadAI/frontend\n$ npm run dev"))
    story.append(out_box("VITE v5.4.21 ready in 210 ms\n➜ Local: http://localhost:3000/"))

    story.append(Paragraph("3. Mở đường link HTTPS toàn cầu bằng Cloudflare Tunnel:", substep_title))
    story.append(cmd_box("$ brew install cloudflared\n$ cloudflared tunnel --url http://localhost:3000"))
    story.append(out_box(
        "+--------------------------------------------------------------------------------------------+\n"
        "| Your quick Tunnel has been created! Visit it at:                                           |\n"
        "| https://previous-prepare-meeting-betting.trycloudflare.com                                 |\n"
        "+--------------------------------------------------------------------------------------------+"
    ))
    story.append(note_box("Đường link HTTPS này mở được trên điện thoại và máy tính ở bất kỳ đâu trên thế giới để demo trực tiếp!"))
    story.append(Spacer(1, 4))

    # SECTION 6
    story.append(Paragraph("6. Quy trình Khởi động lại cho các lần làm việc sau (Daily Restart)", section_h1))
    story.append(Paragraph("Mỗi ngày bật máy Mac làm việc, bạn <b>không cần cấu hình lại gì</b>, chỉ cần 3 lệnh sau:", body_p))

    daily_table = [
        [Paragraph("<b>Thứ tự</b>", cmd_text), Paragraph("<b>Thao tác</b>", cmd_text), Paragraph("<b>Lệnh thực thi trên Mac</b>", cmd_text)],
        [
            Paragraph("<b>Bước 1</b>", body_p),
            Paragraph("Bật VPS (Backend & Nginx tự chạy ngầm)", body_p),
            Paragraph("<code>multipass start vps-demo</code>", cmd_text)
        ],
        [
            Paragraph("<b>Bước 2</b>", body_p),
            Paragraph("Bật Frontend React", body_p),
            Paragraph("<code>cd frontend &amp;&amp; npm run dev</code>", cmd_text)
        ],
        [
            Paragraph("<b>Bước 3</b>", body_p),
            Paragraph("Mở đường hầm ra Internet", body_p),
            Paragraph("<code>cloudflared tunnel --url http://localhost:3000</code>", cmd_text)
        ]
    ]
    t_d = Table(daily_table, colWidths=[65, 205, 245])
    t_d.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_d)
    story.append(Spacer(1, 4))
    story.append(alert_box(
        "Khắc phục sự cố Web bị xoay tròn không tải được dữ liệu",
        "Khi máy ảo VPS vừa khởi động lại sau khi tắt/ngủ máy Mac, thư mục mount 9p chia sẻ có thể kết nối chậm khiến Gunicorn bị đứt socket. Nếu mở giao diện web thấy xoay liên tục không load data, hãy chạy ngay lệnh sau trên Terminal Mac để khởi động lại Backend tức thì:<br/>"
        "<b><code>multipass exec vps-demo -- sudo systemctl restart meterreadai</code></b>"
    ))
    story.append(PageBreak())

    # SECTION 7
    story.append(Paragraph("7. Bảng Tài khoản Kiểm thử & Tra cứu Lệnh Nhanh (Cheatsheet)", section_h1))
    acc_table = [
        [Paragraph("<b>Vai trò</b>", cmd_text), Paragraph("<b>Email đăng nhập</b>", cmd_text), Paragraph("<b>Mật khẩu</b>", cmd_text), Paragraph("<b>Quyền hạn</b>", cmd_text)],
        [
            Paragraph("<b>ADMIN</b>", body_p),
            Paragraph("<code>admin@waterflow.vn</code>", cmd_text),
            Paragraph("<code>mock_hashed_password</code>", cmd_text),
            Paragraph("Dashboard doanh thu, phân tuyến, bảng giá bậc thang, duyệt hóa đơn.", body_p)
        ],
        [
            Paragraph("<b>READER</b>", body_p),
            Paragraph("<code>nguyentuan@waterflow.vn</code>", cmd_text),
            Paragraph("<code>mock_hashed_password</code>", cmd_text),
            Paragraph("Xem tuyến, chụp camera AI nhận diện chỉ số, kiểm tra Imới &ge; Icũ.", body_p)
        ]
    ]
    t_a = Table(acc_table, colWidths=[75, 145, 135, 160])
    t_a.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_a)
    story.append(Spacer(1, 6))

    cmd_table = [
        [Paragraph("<b>Thao tác quản trị & Xử lý sự cố</b>", cmd_text), Paragraph("<b>Lệnh thực thi trên Terminal Mac</b>", cmd_text)],
        [Paragraph("Khởi động lại Backend khi sửa code / khi web bị xoay tròn", body_p), Paragraph("<code>multipass exec vps-demo -- sudo systemctl restart meterreadai</code>", cmd_text)],
        [Paragraph("Kiểm tra trạng thái dịch vụ Backend", body_p), Paragraph("<code>multipass exec vps-demo -- sudo systemctl status meterreadai</code>", cmd_text)],
        [Paragraph("Xem log thời gian thực của Backend", body_p), Paragraph("<code>multipass exec vps-demo -- sudo journalctl -u meterreadai -f</code>", cmd_text)],
        [Paragraph("Khởi động lại web server Nginx", body_p), Paragraph("<code>multipass exec vps-demo -- sudo systemctl restart nginx</code>", cmd_text)],
        [Paragraph("Lấy nhanh link Cloudflare đang chạy", body_p), Paragraph("<code>curl -s http://localhost:20241/quicktunnel</code>", cmd_text)],
        [Paragraph("Vào trực tiếp Terminal của VPS", body_p), Paragraph("<code>multipass shell vps-demo</code>", cmd_text)]
    ]
    t_c = Table(cmd_table, colWidths=[185, 330])
    t_c.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(t_c)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Full Vultr-style PDF successfully created at: {output_path}")

if __name__ == "__main__":
    out_file = "/Users/mac/MeterReadAI/HUONG_DAN_DEPLOY_VA_KHOI_DONG.pdf"
    create_guide_pdf(out_file)