import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

from app.seeds.seed_data import seed_database

# Use in-memory or dedicated test db
TEST_DATABASE_URL = "sqlite:///./test_meter_read.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    # Override get_db
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    
    # Seed data
    db = TestingSessionLocal()
    from app.seeds.seed_data import seed_database
    # Temporarily monkeypatch engine/SessionLocal in seed_data if needed
    import app.seeds.seed_data as sd
    sd.engine = test_engine
    sd.SessionLocal = TestingSessionLocal
    seed_database()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client():
    return TestClient(app)
