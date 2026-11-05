import os
import uuid
from pathlib import Path
from typing import Tuple, List, Optional
import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from fastapi import HTTPException, status
from app.core.config import settings
from app.schemas.ai import PolygonPoint, PredictionDetail, VisualizationDetail

class BidirectionalLSTM(nn.Module):
    def __init__(self, nIn: int, nHidden: int, nOut: int):
        super().__init__()
        self.rnn = nn.LSTM(nIn, nHidden, bidirectional=True)
        self.embedding = nn.Linear(nHidden * 2, nOut)

    def forward(self, input: torch.Tensor) -> torch.Tensor:
        recurrent, _ = self.rnn(input)
        T, b, h = recurrent.size()
        t_rec = recurrent.view(T * b, h)
        output = self.embedding(t_rec)
        return output.view(T, b, -1)

class CRNN(nn.Module):
    def __init__(self, imgH: int = 32, nc: int = 1, nclass: int = 11, nh: int = 256):
        super().__init__()
        assert imgH % 16 == 0
        ks = [3, 3, 3, 3, 3, 3, 2]
        ps = [1, 1, 1, 1, 1, 1, 0]
        ss = [1, 1, 1, 1, 1, 1, 1]
        nm = [64, 128, 256, 256, 512, 512, 512]
        cnn = nn.Sequential()

        def convRelu(i: int, batchNormalization: bool = False):
            nIn = nc if i == 0 else nm[i - 1]
            nOut = nm[i]
            cnn.add_module(f"conv{i}", nn.Conv2d(nIn, nOut, ks[i], ss[i], ps[i]))
            if batchNormalization:
                cnn.add_module(f"batchnorm{i}", nn.BatchNorm2d(nOut))
            cnn.add_module(f"relu{i}", nn.ReLU(True))

        convRelu(0)
        cnn.add_module("pooling0", nn.MaxPool2d(2, 2))
        convRelu(1)
        cnn.add_module("pooling1", nn.MaxPool2d(2, 2))
        convRelu(2, True)
        convRelu(3)
        cnn.add_module("pooling2", nn.MaxPool2d((2, 2), (2, 1), (0, 1)))
        convRelu(4, True)
        convRelu(5)
        cnn.add_module("pooling3", nn.MaxPool2d((2, 2), (2, 1), (0, 1)))
        convRelu(6, True)
        self.cnn = cnn
        self.rnn = nn.Sequential(
            BidirectionalLSTM(512, nh, nh),
            BidirectionalLSTM(nh, nh, nclass)
        )

    def forward(self, input: torch.Tensor) -> torch.Tensor:
        conv = self.cnn(input)
        b, c, h, w = conv.size()
        conv = conv.squeeze(2).permute(2, 0, 1)
        return self.rnn(conv)

class AIService:
    _instance = None
    yolo_model = None
    crnn_model = None
    crnn_transform = None

    def __init__(self):
        self._load_models()

    def _load_models(self):
        try:
            from ultralytics import YOLO
            if os.path.exists(settings.YOLO_MODEL_PATH):
                self.yolo_model = YOLO(settings.YOLO_MODEL_PATH)
        except Exception:
            self.yolo_model = None

        try:
            if os.path.exists(settings.CRNN_MODEL_PATH):
                checkpoint = torch.load(settings.CRNN_MODEL_PATH, map_location="cpu")
                self.crnn_model = CRNN(imgH=32, nc=1, nclass=11, nh=256)
                self.crnn_model.load_state_dict(checkpoint["model_state_dict"])
                self.crnn_model.eval()
                self.crnn_transform = transforms.Compose([
                    transforms.Grayscale(num_output_channels=1),
                    transforms.Resize((32, 100)),
                    transforms.ToTensor(),
                    transforms.Normalize((0.5,), (0.5,))
                ])
        except Exception:
            self.crnn_model = None

    @classmethod
    def get_instance(cls) -> "AIService":
        if cls._instance is None:
            cls._instance = AIService()
        return cls._instance

    def validate_image_bytes(self, contents: bytes):
        if len(contents) > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Dung lượng tệp vượt quá giới hạn cho phép ({settings.MAX_FILE_SIZE_BYTES / (1024*1024):.0f}MB)."
            )
        
        is_jpeg = len(contents) >= 3 and contents[0] == 0xFF and contents[1] == 0xD8 and contents[2] == 0xFF
        is_png = len(contents) >= 8 and contents[:8] == b"\x89PNG\r\n\x1a\n"

        if not (is_jpeg or is_png):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Định dạng tệp không hợp lệ. Chỉ chấp nhận tệp ảnh JPEG hoặc PNG."
            )

    def decode_image_safely(self, contents: bytes) -> np.ndarray:
        self.validate_image_bytes(contents)
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None or img.size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tệp ảnh bị lỗi hoặc không thể giải mã (corrupted image)."
            )
        return img

    def _decode_tensor(self, tensor: torch.Tensor) -> Tuple[str, float]:
        with torch.no_grad():
            output = self.crnn_model(tensor)
            pred = output.argmax(dim=2).permute(1, 0)
            chars = []
            previous = 10
            for index in pred[0]:
                idx = index.item()
                if idx == 10:
                    previous = idx
                    continue
                if idx == previous:
                    continue
                chars.append(str(idx))
                previous = idx

            seq = "".join(chars)
            if not seq:
                return "", 0.0

            # Xử lý ký tự lặp ở đuôi do co giãn chiều ngang CTC
            if len(seq) == 6 and seq[-1] == seq[-2]:
                seq = seq[:-1]

            probs = torch.softmax(output, dim=2)
            max_probs, _ = probs.max(dim=2)
            conf = float(max_probs.mean().item())
            return seq, round(float(conf), 3)

    def _ocr_crop(self, crop_bgr: np.ndarray) -> Tuple[str, float]:
        if crop_bgr is None or crop_bgr.size == 0:
            return "", 0.0

        gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
        if float(gray.std()) < 8.0:
            return "", 0.0

        if self.crnn_model is not None and self.crnn_transform is not None:
            try:
                candidates: List[Tuple[str, float]] = []

                # 1. Ảnh Grayscale trực tiếp
                pil1 = Image.fromarray(gray)
                t1 = self.crnn_transform(pil1).unsqueeze(0)
                s1, c1 = self._decode_tensor(t1)
                if s1:
                    candidates.append((s1, c1))

                # 2. Tiền xử lý CLAHE tăng cường độ tương phản
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                cl_gray = clahe.apply(gray)
                pil2 = Image.fromarray(cl_gray)
                t2 = self.crnn_transform(pil2).unsqueeze(0)
                s2, c2 = self._decode_tensor(t2)
                if s2:
                    candidates.append((s2, c2))

                # 3. Nếu vùng cắt dạng dọc (h > w * 1.2), kiểm tra xoay góc
                h, w = crop_bgr.shape[:2]
                if h > w * 1.2:
                    rot_ccw = cv2.rotate(gray, cv2.ROTATE_90_COUNTERCLOCKWISE)
                    t3 = self.crnn_transform(Image.fromarray(rot_ccw)).unsqueeze(0)
                    s3, c3 = self._decode_tensor(t3)
                    if s3:
                        candidates.append((s3, c3))

                if candidates:
                    candidates.sort(key=lambda x: (1 if 4 <= len(x[0]) <= 6 else 0, x[1]), reverse=True)
                    return candidates[0]
            except Exception:
                pass

        return "", 0.0

    def predict(
        self,
        image_bytes: bytes,
        meter_id: int,
        previous_index: float = 1240.0
    ) -> Tuple[PredictionDetail, VisualizationDetail, str, str]:
        img = self.decode_image_safely(image_bytes)
        h, w, _ = img.shape

        file_id = f"{meter_id}_{uuid.uuid4().hex[:8]}"
        raw_filename = f"{file_id}_raw.jpg"
        crop_filename = f"{file_id}_crop.jpg"

        raw_path = settings.UPLOAD_DIR / "raw" / raw_filename
        crop_path = settings.UPLOAD_DIR / "crop" / crop_filename

        cv2.imwrite(str(raw_path), img)

        bbox = []
        polygon = []
        cropped_img = None
        det_conf = 0.0

        if self.yolo_model is not None:
            try:
                results = self.yolo_model(img, conf=0.25, verbose=False)
                if len(results) > 0 and len(results[0].boxes) > 0:
                    box = results[0].boxes[0]
                    det_conf = round(float(box.conf[0].item()), 3)
                    x1, y1, x2, y2 = [int(v.item()) for v in box.xyxy[0]]
                    bbox = [max(0, x1), max(0, y1), min(w, x2), min(h, y2)]
                    
                    if results[0].masks is not None and len(results[0].masks) > 0:
                        seg = results[0].masks.xy[0]
                        polygon = [PolygonPoint(x=int(pt[0]), y=int(pt[1])) for pt in seg]
                    else:
                        polygon = [
                            PolygonPoint(x=bbox[0], y=bbox[1]),
                            PolygonPoint(x=bbox[2], y=bbox[1]),
                            PolygonPoint(x=bbox[2], y=bbox[3]),
                            PolygonPoint(x=bbox[0], y=bbox[3]),
                        ]
                    cropped_img = img[bbox[1]:bbox[3], bbox[0]:bbox[2]]
            except Exception:
                pass

        if cropped_img is None or cropped_img.size == 0 or len(bbox) == 0:
            bbox = []
            polygon = []
            det_conf = 0.0
            raw_seq = ""
            rec_conf = 0.0
        else:
            cv2.imwrite(str(crop_path), cropped_img)
            raw_seq, rec_conf = self._ocr_crop(cropped_img)
        
        predicted_seq = raw_seq
        try:
            num_val = float(predicted_seq) if predicted_seq else 0.0
        except ValueError:
            predicted_seq = ""
            num_val = 0.0

        if not predicted_seq or rec_conf == 0.0:
            overall_conf = 0.0
            predicted_seq = ""
            num_val = 0.0
        else:
            if det_conf > 0:
                overall_conf = round(float((det_conf + rec_conf) / 2.0), 3)
            else:
                overall_conf = round(float(rec_conf), 3)

        raw_url = f"/uploads/raw/{raw_filename}"
        crop_url = f"/uploads/crop/{crop_filename}" if cropped_img is not None else ""

        prediction = PredictionDetail(
            predictedSequence=predicted_seq,
            numericalValue=num_val,
            confidence=overall_conf,
            modelVersion="yolo11n-seg-crnn-v2.1"
        )

        visualization = VisualizationDetail(
            originalImageUrl=raw_url,
            croppedImageUrl=crop_url,
            polygon=polygon,
            bbox=bbox,
            imageWidth=w,
            imageHeight=h
        )

        return prediction, visualization, raw_url, crop_url
