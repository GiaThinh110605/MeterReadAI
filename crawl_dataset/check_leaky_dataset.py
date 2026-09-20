import hashlib
from collections import defaultdict
from pathlib import Path
import os

DATA_PATH = Path("/Users/mac/MeterReadAI/images")
hash_dict = defaultdict(list)

for img_path in DATA_PATH.glob("*.*"):
    if img_path.is_file():
        with open(img_path, "rb") as f:
            file_hash = hashlib.md5(f.read()).hexdigest()
            hash_dict[file_hash].append(img_path)

duplicates = {h: files for h, files in hash_dict.items() if len(files) > 1}

if duplicates:
    total_groups = len(duplicates)
    total_files_to_delete = sum(len(files) - 1 for files in duplicates.values())
    
    print(f"Phát hiện {total_groups} nhóm trùng lặp.")
    print(f"Chuẩn bị xóa {total_files_to_delete} file thừa (giữ lại 1 file gốc mỗi nhóm)...")
    
    confirm = input("Bạn có chắc chắn muốn xóa không? (y/n): ").strip().lower()
    
    if confirm == 'y':
        deleted_count = 0
        for h, files in duplicates.items():
            original = files[0]
            redundant_files = files[1:]
            
            for file_path in redundant_files:
                try:
                    file_path.unlink()
                    deleted_count += 1
                    print(f"Đã xóa: {file_path.name}")
                except Exception as e:
                    print(f"Lỗi khi xóa {file_path.name}: {e}")
                    
        print(f"Hoàn thành! Đã dọn dẹp và xóa thành công {deleted_count} file trùng lặp.")
    else:
        print("Đã hủy thao tác xóa.")
else:
    print(len(os.listdir(DATA_PATH)))
    print("Không tìm thấy file nào trùng lặp chính xác.")