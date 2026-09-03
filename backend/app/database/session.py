from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Handle Oracle specific arguments if required (e.g. max_identifier_length for older clients)
engine_kwargs = {"pool_pre_ping": True}
if "oracle" in settings.get_database_url:
    engine_kwargs["max_identifier_length"] = 128

engine = create_engine(settings.get_database_url, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
