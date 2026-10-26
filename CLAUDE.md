# MeterReadAI & WaterFlow — Claude Code Rules

## Build & Test Commands
- Backend test: `pytest` or `pytest -v --cov=app`
- Backend run: `uvicorn app.main:app --reload --port 8000`
- Frontend dev: `npm run dev`
- Frontend build: `npm run build`
- Docker deploy: `docker-compose up --build`

## Architecture & Code Standards
- **Tech Stack:** React (Vite + TS + Tailwind), FastAPI (Python 3.10+), YOLO11-seg, OpenCV, SQLite, SQLAlchemy 2.0, Pytest, Docker.
- **UI Design:** Replicate Google Stitch prototype (https://stitch.withgoogle.com/projects/3346993615529581711).
- **Reading Validation:** `currentIndex >= previousIndex`. If less, reject and report `Abnormality`.
- **String Formats:** Always format meter digits as Strings to keep leading zeros (e.g., `"01277"`).
- **Audit Trail:** Log all human edits over AI predictions with `isModified`, `originalAIValue`, `correctionReason`.
- **Invoicing:** Tiered calculation ($q_j \times p_j$) + 10% Env Fee + 5% VAT. Save `InvoiceTierDetail` snapshot.
- **Security:** Use `.env` for secrets. Verify image magic bytes on uploads. Avoid raw SQL.
