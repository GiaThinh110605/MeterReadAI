from ultralytics import YOLO

onnx_model = YOLO(
    "/Users/mac/MeterReadAI/models_baseline/yolo11n-seg/merge-dataset/results/runs/segment/train/weights/best.onnx",
    task="segment"
)

print("Class names:", onnx_model.names)

results = onnx_model.predict(
    "/Users/mac/MeterReadAI/data/DataAfterHandle/water_meters/images/id_1_value_13_116.jpg",
    save=False
)

results[0].show()