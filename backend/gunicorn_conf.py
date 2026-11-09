import os
from multiprocessing import cpu_count

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Đường dẫn file Unix Socket để Nginx kết nối vào (dùng /tmp để tương thích thư mục chia sẻ)
bind = "unix:/tmp/gunicorn.sock"

# 2. Số lượng worker chạy song song (2 * CPU + 1 hoặc CPU + 1)
workers = cpu_count() + 1
worker_class = "uvicorn.workers.UvicornWorker"

# 3. Timeout và giới hạn kết nối
keepalive = 5
timeout = 120

# 4. Ghi log
loglevel = "info"
accesslog = os.path.join(BASE_DIR, "access.log")
errorlog = os.path.join(BASE_DIR, "error.log")
