import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://user:password@localhost/portfolio_db')

db_url = DATABASE_URL
if db_url.startswith('mysql://'):
    db_url = db_url.replace('mysql://', 'mysql+pymysql://', 1)

engine = create_engine(
    db_url,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
