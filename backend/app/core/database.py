from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Create SQLite engine
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

# Enable SQLite WAL mode and Foreign Keys enforcement
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    # Only execute pragma on sqlite
    if "sqlite" in settings.DATABASE_URL:
        cursor = dbapi_connection.cursor()

        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency that provides a database session to endpoints."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
