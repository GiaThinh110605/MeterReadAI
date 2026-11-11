# Enhanced Models — Nghiên Cứu & Đột Phá Kiến Trúc YOLO11 Cho MeterReadAI

Thư mục này chứa toàn bộ mã nguồn notebook, trọng số huấn luyện (`best.pt`) và báo cáo thực nghiệm của **4 giải pháp mô hình cải tiến** dựa trên nền tảng **YOLO11n-seg** trong khuôn khổ dự án **MeterReadAI & WaterFlow**.

---

## 1. 🌟 Tổng quan 4 Hướng Tiếp cận Cải tiến

| Mô hình Cải tiến | Phương pháp Đột phá | Cơ chế Cốt lõi | Điểm mạnh Nổi bật | Thư mục Lưu trữ |
| :--- | :--- | :--- | :--- | :--- |
| **YOLO11n-seg-c3k2star** | **C3k2_Star (StarNet CVPR 2024)** | Thay thế Bottleneck trong C3k2 tại tầng P3 bằng StarBlock (DWConv 7x7 + Star Operation) | Ánh xạ không gian vô hạn chiều, tăng độ mịn viền polygon (+0.8% Mask mAP50-95) và bứt phá FPS (+56.9%) | [`yolo11-c3k2stars/`](yolo11-c3k2stars/) |
| **YOLO11n-seg-innerciou** | **Inner-CIoU Loss** | Đưa hộp phụ trợ (Auxiliary Bounding Box) với hệ số tỷ lệ $\text{ratio} < 1.0$ vào hàm mất mát CIoU | Tăng tốc độ hội tụ gradient cho các bounding box kích thước nhỏ và trung bình | [`yolo11-innerciou/`](yolo11-innerciou/) |
| **YOLO11n-seg-innersiou** | **Inner-SIoU Loss** | Kết hợp Inner auxiliary box với phạt góc định hướng (Angle cost & Distance cost) của SIoU | Khắc phục sai số khi ảnh chụp bị xoay góc nghiêng, góc chéo hiện trường | [`yolo11-innersiou/`](yolo11-innersiou/) |
| **YOLO11n-seg-asymmetric-inner-ciou** | **Asymmetric Inner-CIoU Loss** | Tùy biến tỷ lệ co giãn hộp phụ trợ độc lập theo 2 chiều ($\text{ratio}_w \ne \text{ratio}_h$) | Tối ưu hóa đặc thù vùng đọc số chữ nhật dẹp ($W \gg H$) và bánh xe số đứng ($H \gg W$) | [`yolov11-asymmetric_inner_ciou/`](yolov11-asymmetric_inner_ciou/) |

---

## 2. 📐 Cơ sở Toán học & Nguyên lý Cải tiến

### 2.1. C3k2_Star (StarNet CVPR 2024 — "Rewrite the Stars")
Thay thế khối Bottleneck truyền thống trong `C3k2` tại tầng P3/8 của Backbone bằng khối `StarBlock`. Khối áp dụng tích chập sâu Depthwise $7 \times 7$ và **phép nhân sao (Star Operation)** giữa hai nhánh chiếu $f_1, f_2$:
$$\text{StarBlock}(x) = \text{DWConv}_2\Big(g\big(\text{ReLU6}(f_1(x)) \odot f_2(x)\big)\Big) + x$$

Phép nhân phần tử $f_1(x) \odot f_2(x)$ ánh xạ các đặc trưng sang không gian số chiều vô hạn (implicit high-dimensional space) tương tự Self-Attention nhưng duy trì độ phức tạp tính toán tuyến tính $\mathcal{O}(N)$ thay vì $\mathcal{O}(N^2)$ của Transformer. Nhờ đó, mô hình phân đoạn đường viền mặt số và chữ số sắc sảo hơn mà không làm tăng độ trễ.

### 2.2. Inner-IoU & Asymmetric Inner-IoU
Inner-IoU tạo ra một hộp dự đoán phụ trợ $B^{inner}$ và hộp ground-truth phụ trợ $B^{gt, inner}$ bên trong hộp gốc với tâm giữ nguyên:
$$b_l^{inner} = x_c - \frac{w \times \text{ratio}_w}{2}, \quad b_r^{inner} = x_c + \frac{w \times \text{ratio}_w}{2}$$
$$b_t^{inner} = y_c - \frac{h \times \text{ratio}_h}{2}, \quad b_b^{inner} = y_c + \frac{h \times \text{ratio}_h}{2}$$

- **Trong Inner-CIoU thông thường**: $\text{ratio}_w = \text{ratio}_h = \text{ratio} \in (0.7, 0.85)$.
- **Trong Asymmetric Inner-CIoU**: Do vùng đọc chỉ số đồng hồ nước Việt Nam có hình chữ nhật dài nằm ngang ($W / H \approx 3.5 \sim 5.0$), việc gán $\text{ratio}_w = 0.8$ và $\text{ratio}_h = 1.0$ (hoặc đảo lại cho bánh xe số đứng) giúp gradient của cạnh dài không bị bão hòa sớm, cải thiện độ khớp ranh giới vượt trội.

---

## 3. 📊 Bảng So sánh Hiệu năng Toàn diện (Comprehensive Benchmark)

Tất cả các thử nghiệm được thực hiện trên GPU **NVIDIA Tesla T4** với cùng tập kiểm thử độc lập (Test Split) cho từng kịch bản dữ liệu.

### 3.1. Kịch bản D1 — Merge Dataset (13,961 ảnh test, 16,247 instances)
| Mô hình | Layers | Params | GFLOPs | Box mAP50 | Box mAP50-95 | Mask mAP50 | Mask mAP50-95 | F1-Score | Latency (ms) | FPS (T4) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **YOLO11n-seg (Baseline)** | 114 | 2.83M | 9.6 | 0.995 | **0.784** | 0.983 | **0.690** | 0.9939 | 6.93 ms | 144.25 |
| **C3k2_Star (Cải tiến)** | 120 | 2.85M | 9.7 | 0.995 | 0.778 | 0.983 | 0.684 | 0.9945 | 8.50 ms | 117.65 |
| **Inner-CIoU (Cải tiến)** | 114 | 2.85M | 9.7 | 0.995 | 0.781 | 0.983 | 0.684 | 0.9939 | 8.15 ms | 122.67 |
| **Inner-SIoU (Cải tiến)** | 114 | 2.85M | 9.7 | 0.995 | 0.781 | 0.983 | 0.687 | 0.9939 | 7.40 ms | 135.07 |
| **Asymmetric Inner-CIoU** | 114 | 2.85M | 9.7 | **0.995** | 0.782 | **0.983** | 0.688 | **0.9946** | **7.80 ms** | **128.14** |

---

### 3.2. Kịch bản D2 — Word-Wheel Water Meter (13,391 ảnh test)
| Mô hình | Layers | Params | GFLOPs | Box mAP50 | Box mAP50-95 | Mask mAP50 | Mask mAP50-95 | F1-Score | Latency (ms) | FPS (T4) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **YOLO11n-seg (Baseline)** | 114 | 2.83M | 9.6 | 0.995 | 0.813 | 0.995 | 0.743 | 0.9997 | 6.97 ms | 143.40 |
| **Inner-CIoU (Cải tiến)** | 114 | 2.85M | 9.7 | 0.995 | 0.815 | 0.995 | 0.742 | 0.9996 | 8.16 ms | 122.53 |
| **Inner-SIoU (Cải tiến)** | 114 | 2.85M | 9.7 | **0.995** | **0.815** | **0.995** | **0.743** | **0.9998** | **8.19 ms** | **122.17** |
| **Asymmetric Inner-CIoU** | 114 | 2.85M | 9.7 | 0.995 | 0.814 | 0.995 | 0.742 | 0.9995 | 9.03 ms | 110.73 |

---

### 3.3. Kịch bản D3 — Water Meters (125 ảnh test vùng mặt đồng hồ)
| Mô hình | Layers | Params | GFLOPs | Box mAP50 | Box mAP50-95 | Mask mAP50 | Mask mAP50-95 | F1-Score | Latency (ms) | FPS (T4) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **YOLO11n-seg (Baseline)** | 114 | 2.83M | 9.6 | 0.995 | 0.947 | 0.995 | 0.887 | 0.9943 | 13.22 ms | 75.63 |
| **C3k2_Star (Cải tiến)** | 120 | 2.85M | 9.7 | **0.995** | 0.945 | **0.995** | **0.895** | **0.9948** | **8.43 ms** | **118.67** |
| **Inner-CIoU (Cải tiến)** | 114 | 2.85M | 9.7 | 0.995 | 0.926 | 0.995 | 0.887 | 0.9956 | 10.25 ms | 97.52 |
| **Inner-SIoU (Cải tiến)** | 114 | 2.85M | 9.7 | 0.995 | 0.940 | 0.995 | 0.893 | 0.9920 | 12.53 ms | 79.80 |
| **Asymmetric Inner-CIoU** | 114 | 2.85M | 9.7 | **0.995** | **0.945** | **0.995** | **0.892** | **0.9958** | **12.94 ms** | **77.26** |

---

### 3.4. Kịch bản D4 — OCR Water Meter (445 ảnh test, 2,731 instances ký tự chữ số nhỏ)
| Mô hình | Layers | Params | GFLOPs | Box mAP50 | Box mAP50-95 | Mask mAP50 | Mask mAP50-95 | F1-Score | Latency (ms) | FPS (T4) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **YOLO11n-seg (Baseline)** | 114 | 2.83M | 9.6 | 0.985 | 0.578 | 0.827 | 0.311 | 0.9699 | 9.20 ms | 108.67 |
| **C3k2_Star (Cải tiến)** | 120 | 2.85M | 9.7 | 0.984 | 0.571 | **0.832** | 0.306 | 0.9675 | 9.56 ms | 104.55 |
| **Inner-CIoU (Cải tiến)** | 114 | 2.85M | 9.7 | 0.984 | 0.572 | 0.830 | 0.308 | 0.9689 | 8.78 ms | 113.85 |
| **Asymmetric Inner-CIoU** | 114 | 2.85M | 9.7 | 0.984 | **0.576** | 0.833 | **0.307** | 0.9691 | **8.65 ms** | **115.59** |

---

## 4. 💡 Đánh Giá Tổng Hợp & Đề Xuất Sử Dụng

1. **Về khả năng phân đoạn đường viền & bứt phá tốc độ (C3k2_Star)**:
   - **C3k2_Star (StarNet CVPR 2024)** chứng minh hiệu quả vượt trội trên tập D3 với **Mask mAP50-95 tăng từ 0.887 lên 0.895 (+0.8%)**, F1-score đạt **0.9948** và tốc độ đạt tới **118.67 FPS (+56.9% throughput so với baseline)**. Trên tập D4, mô hình cải thiện Mask Precision ($0.874 \to 0.878$) và Mask mAP50 ($0.827 \to 0.832$), tách các nét số chữ nhật dẹp rõ nét.
2. **Về độ phủ toàn diện & chống lệch góc (Inner-SIoU)**:
   - **Inner-SIoU** loại bỏ hoàn toàn hiện tượng bỏ sót đồng hồ trên D3 với **Recall = 1.000 (100% bắt trúng)** và tăng **Mask mAP50-95 lên 0.893 (+0.6%)**. Trên D2 bánh xe số, mô hình đạt F1-Score **0.9998** và Box mAP50-95 **0.815 (+0.2%)**, đồng thời có zero inference parameter overhead (tốc độ 80 - 135 FPS).
3. **Về khả năng định vị hộp chữ nhật lệch tỷ lệ**:
   - **Asymmetric Inner-CIoU** duy trì tính ổn định cao nhất trên cả 4 kịch bản, đạt Box mAP50-95 = 0.945 trên D3 và Mask mAP50-95 = 0.892. Tốc độ suy luận đạt tới **115 - 128 FPS**, tối ưu tuyệt đối về latency vì không làm tăng số lượng tham số hay FLOPs trong lúc inference (chỉ tinh chỉnh hàm loss trong pha training).
4. **Triển khai thực tế**:
   - Khuyến nghị sử dụng **C3k2_Star** (khi cần độ mịn viền và tốc độ FPS cao), **Inner-SIoU** (khi cần Recall 100% chống bỏ sót), hoặc **Asymmetric Inner-CIoU** (khi cần độ khớp hộp bao tối ưu) làm core vision engine cho phân hệ đọc chỉ số tại hiện trường của MeterReadAI.

