import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse, urlunparse

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL 누락: backend/.env에 설정하세요.")

# Ensure SSL for Supabase Postgres
parsed = urlparse(DATABASE_URL)
query = parsed.query or ""
if "sslmode" not in query.lower():
    query = (query + ("&" if query else "") + "sslmode=require")
    DATABASE_URL = urlunparse(parsed._replace(query=query))

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=5,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def healthcheck_db():
    with engine.connect() as conn:
        conn.execute(text("select 1"))

