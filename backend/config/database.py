"""
config/database.py
------------------
Configura el motor de SQLAlchemy, la fábrica de sesiones y la clase Base
que usarán todos los modelos ORM del proyecto.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from config.settings import settings


# ── Motor ──────────────────────────────────────────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,          # Reconecta si la conexión cae
    pool_size=10,
    max_overflow=20,
    echo=False,                  # Cambiar a True para depurar SQL en desarrollo
)

# ── Sesión ─────────────────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ── Base declarativa ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependencia FastAPI ────────────────────────────────────────────────────────
def get_db():
    """Generador de sesiones para inyección de dependencias en FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
