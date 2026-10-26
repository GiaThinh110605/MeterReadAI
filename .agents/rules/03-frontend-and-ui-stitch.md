# Rule 03: Frontend & Google Stitch UI Guidelines

## 1. Tuân thủ thiết kế Stitch (Google Stitch Fidelity)
- Mọi màn hình giao diện phải đối chiếu và bám sát nguyên mẫu trên Google Stitch:
  `https://stitch.withgoogle.com/projects/3346993615529581711`
- **Tránh giao diện mẫu AI generic:**
  - Không sử dụng màu sắc sơ sài (như xanh lá cây, đỏ, xanh dương đơn điệu).
  - Sử dụng bảng màu chuyên nghiệp lấy cảm hứng từ ngành nước và công nghệ: màu chủ đạo xanh lam thẫm (`blue-600` / `indigo-700`), nền slate thanh lịch (`slate-50` / `slate-100`), điểm nhấn cam đất (`amber-500` cho trạng thái chờ) và xanh ngọc (`emerald-600` cho trạng thái thành công).
  - Phông chữ hiện đại: Inter, Roboto hoặc system font sạch sẽ.

## 2. Quy chuẩn React & TypeScript
- **Cấu trúc Component:**
  - Áp dụng nguyên lý Single Responsibility. Mỗi component chỉ xử lý một nhiệm vụ.
  - Sử dụng Type interface rõ ràng cho Props:
    ```typescript
    interface MeterReadingProps {
      meterCode: string;
      previousIndex: number;
      currentIndex: number;
      onConfirm: (index: number) => Promise<void>;
      onReportAbnormality: () => void;
    }
    ```
- **Tối ưu Re-render (React Performance):**
  - Không định nghĩa inline functions trong props của danh sách dài (`useCallback`).
  - Phân tách State cục bộ (form state, modal open/close) khỏi State toàn cục (user auth, active route).
  - Sử dụng TanStack Query (React Query) hoặc SWR cho data-fetching để có caching và re-validation tự động.

## 3. Trải nghiệm Tác nghiệp Hiện trường (Mobile Reader Experience)
- Giao diện dành cho nhân viên ghi số phải tối ưu trên màn hình điện thoại di động:
  - Nút bấm lớn (tối thiểu 44px x 44px) để dễ chạm ngoài trời.
  - Khung chụp ảnh hiển thị rõ lưới hỗ trợ căn chỉnh mặt số đồng hồ nước.
  - Khi AI trả kết quả: Hiển thị ngay ảnh crop phóng to mặt số, vẽ đường viền (Bounding Box) màu xanh lá bao quanh chuỗi số và ô nhập liệu nổi bật để nhân viên kiểm tra đối chiếu chỉ bằng 1 tay.
