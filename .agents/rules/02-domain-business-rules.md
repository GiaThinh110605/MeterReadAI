# Rule 02: Domain & Business Logic Rules

Mọi tính toán, lưu trữ và phản hồi dữ liệu trong hệ thống MeterReadAI & WaterFlow phải tuân thủ chính xác các nguyên tắc nghiệp vụ sau:

## 1. Ràng buộc Chỉ số Nước (Meter Reading Integrity)
- **Quy tắc không giảm:** Chỉ số mới chốt luôn luôn lớn hơn hoặc bằng chỉ số cũ: $I_{mới} \ge I_{cũ}$.
- **Trường hợp vi phạm:** Nếu phát hiện $I_{mới} < I_{cũ}$:
  - Hệ thống **tuyệt đối không được tự động đổi dấu** hoặc tự gán mức tiêu thụ về $0$.
  - Backend phải trả về mã lỗi HTTP `422 Unprocessable Entity` kèm thông báo hướng dẫn nhân viên lập biên bản bất thường (`Abnormality`).
- **Bảo toàn số 0 ở đầu:** Chuỗi số do AI nhận diện và nhân viên xác nhận (`predictedSequence`, `confirmedIndex`) phải được định dạng kiểu chuỗi (String) khi truyền qua API để không bị mất các chữ số `0` ở đầu (ví dụ: `"01277"` không được chuyển thành số nguyên `1277`).

## 2. Chuỗi bằng chứng và Truy vết Kiểm toán (Audit Trail)
- **Tính bất biến của dữ liệu AI:** Bản ghi `AIRecognition` lưu trữ kết quả kỹ thuật của mô hình (chuỗi số, điểm tin cậy `detectionConfidence`, `recognitionConfidence`, tọa độ polygon) là dữ liệu **chỉ đọc (Read-only)**, không bao giờ được phép sửa đổi hay ghi đè.
- **Lưu vết khi con người can thiệp:** Khi nhân viên hiện trường chỉnh sửa số do AI đọc nhầm, bản ghi `MeterReading` bắt buộc phải cập nhật:
  - `isModified = True`
  - `originalAIValue = "chuỗi số gốc của AI"`
  - `confirmedIndex = giá trị con người chốt`
  - `correctionReason = "lý do sửa cụ thể (kính mờ, lóa đèn...)"`
  - `recordedBy = "mã nhân viên"`
  - `readingDate = thời điểm chốt`

## 3. Thuật toán Lập Hóa đơn Bậc thang (Progressive Tariff Calculation)
- **Công thức lượng tiêu thụ:** $q = I_{mới} - I_{cũ}$ ($m^3$).
- **Phân bổ theo bậc:** Với biểu giá gồm các bậc $j$ từ $a_j$ đến $b_j$ với đơn giá $p_j$:
  $$q_j = \max(0, \min(q, b_j) - a_j)$$
  $$\text{Tiền nước sạch} = \sum (q_j \times p_j)$$
- **Các khoản phụ thu theo luật:**
  - Phí dịch vụ thoát nước & bảo vệ môi trường: Thường là $10\%$ tiền nước sạch.
  - Thuế giá trị gia tăng (VAT): Thường là $5\%$ trên (tiền nước sạch + phí BVMT).
  - Tổng hóa đơn: $\text{Tổng thanh toán} = \text{Tiền nước} + \text{Phí BVMT} + \text{Thuế VAT}$.
- **Lưu vết Snapshot:** Mỗi hóa đơn `Invoice` bắt buộc phải lưu kèm danh sách `InvoiceTierDetail` thể hiện lượng nước và thành tiền của từng bậc tại thời điểm xuất hóa đơn. Không được tính động từ bảng `Tariff` khi xem lại hóa đơn cũ.
