from prometheus_client import Counter, Histogram, Gauge

# 1. Counter: chỉ tăng (đếm lượt dự đoán & tỷ lệ nhân viên sửa kết quả)
# sum by (status) (ai_predictions_total)
AI_PREDICTIONS_TOTAL = Counter(
    "ai_predictions_total",
    "Total AI predictions",
    ["status", "model_version"]  # status: success | empty_crop | empty_ocr | error
)

READING_CONFIRMATIONS_TOTAL = Counter(
    "reading_confirmations_total",
    "Total confirmed vs corrected readings",
    ["result"],  # CONFIRMED | CORRECTED
)

# 2. Histogram: phân phối độ trễ & độ tin cậy (tính được p50, p95, p99)
# histogram_quantile(0.95, sum by (le, stage) (rate(ai_inference_duration_seconds_bucket[5m])))
AI_LATENCY = Histogram(
    "ai_inference_duration_seconds",
    "Inference duration in seconds",
    ["stage"],  # yolo | crnn | total
    buckets=(0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, float("inf")),
)

AI_CONFIDENCE = Histogram(
    "ai_prediction_confidence",
    "Confidence score distribution",
    ["stage"],  # det | rec | overall
    buckets=(0.2, 0.4, 0.6, 0.75, 0.85, 0.9, 0.95, 1.0),
)

# 3. Gauge: tăng/giảm tức thời (số ảnh đang xử lý đồng thời)
# ai_inference_in_progress
AI_IN_PROGRESS = Gauge("ai_inference_in_progress", "AI predictions currently running")