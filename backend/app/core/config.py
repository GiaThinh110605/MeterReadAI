import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
REPO_ROOT = BASE_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "MeterReadAI & WaterFlow"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/meter_read.db")
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024
    
    YOLO_MODEL_PATH: str = os.getenv(
        "YOLO_MODEL_PATH",
        str(REPO_ROOT / "models_baseline/yolo11n-seg/word-wheel-water-meter/results/yolo11n-seg.pt")
    )
    CRNN_MODEL_PATH: str = os.getenv(
        "CRNN_MODEL_PATH",
        str(REPO_ROOT / "models_baseline/crnn/results/weights/best_model.pth")
    )
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "waterflow-meterreadai-secret-key-2025")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR / "raw", exist_ok=True)
os.makedirs(settings.UPLOAD_DIR / "crop", exist_ok=True)
