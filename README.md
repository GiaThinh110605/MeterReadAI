
# MeterReadAI — Dataset & EDA

## Lấy dataset

- Kaggle (Yandex Toloka Water Meters): https://www.kaggle.com/datasets/tapakah68/yandextoloka-water-meters-dataset
- Dryad: https://datadryad.org/dataset/doi:10.5061/dryad.7d7wm3860



## EDA (bản tóm tắt hiện tại)

## Chi tiết EDA — notebook summary

Các notebook EDA hiện có (chạy từng ô để thu kết quả):

- `eda/check_WaterMeters.ipynb` — Tổng quan `data/WaterMeters`:
	- Kiểm tra số lượng ảnh và masks
	- Kiểm tra mask rỗng và tính diện tích mask (mask area)
	- Tính tỷ lệ mask_area / image_area và vẽ histogram
	- Kiểm tra định dạng file, phát hiện ảnh trùng lặp bằng MD5
	- Hiển thị ví dụ ảnh + mask + overlay
	- Vẽ heatmap centroid mask để xem vùng tập trung
	- Kiểm tra lỗi segmentation (too_small, too_large, touch_boundary, multi_components)
	- Kiểm tra file CSV metadata `data/WaterMeters/data.csv`

- `eda/check_word_wheel_water_meter_train_dataset.ipynb` — Kiểm tra tập train (`Word-Wheel_Water_Meter_Dataset/detection/train`):
	- Số lượng ảnh/masks, mask validity, phân bố mask ratio
	- Thống kê định dạng file và phát hiện trùng lặp
	- Visualization (example image + mask + overlay)
	- Heatmap centroid và kiểm tra lỗi segmentation
	- Kiểm tra file CSV nhãn train

- `eda/check_word_wheel_water_meter_test_dataset.ipynb` — Kiểm tra tập test (tác vụ tương tự tập train):
	- Số lượng ảnh/masks, mask validity, mask ratio distribution
	- Format check, duplicate detection, visualization, heatmap, segmentation errors
	- Kiểm tra file CSV nhãn test
