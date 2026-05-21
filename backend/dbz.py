import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()
USER=os.getenv("DB_USER")
PASSWORD=os.getenv("DB_PASSWORD")
HOST=os.getenv("DB_HOST")
DB_NAME=os.getenv("DB_NAME")

DATABASE_URL = f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}/{DB_NAME}"
engine = create_engine(DATABASE_URL,pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False,autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()