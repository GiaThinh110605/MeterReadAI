import base64
import os
import subprocess

img_path = "/Users/mac/MeterReadAI/README_IMAGE/yolo11_c3k2star_detailed_architecture.png"
with open(img_path, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode('utf-8')

html_file = "/Users/mac/MeterReadAI/Huong_Dan_Chinh_Sua_Bao_Cao_Moc3_Nhom07.html"
pdf_file = "/Users/mac/MeterReadAI/Huong_Dan_Chinh_Sua_Bao_Cao_Moc3_Nhom07.pdf"

cmd = [
    "wkhtmltopdf",
    "--enable-local-file-access",
    "--page-size", "A4",
    "--margin-top", "15mm",
    "--margin-bottom", "15mm",
    "--margin-left", "15mm",
    "--margin-right", "15mm",
    "--encoding", "UTF-8",
    html_file,
    pdf_file
]
subprocess.run(cmd, check=True)
print("PDF generated successfully.")
