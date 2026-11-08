from ultralytics import YOLO

path = input("Enter your path:")
model = YOLO(path)
model.export(format="onnx")