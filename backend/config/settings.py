"""
config/settings.py
------------------
Centraliza todas las variables de entorno usando Pydantic-Settings.
Importar siempre desde aquí: `from config.settings import settings`
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Base de datos
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # Correo (simulado)
    MAIL_FROM: str = "noreply@cinenova.com"
    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
