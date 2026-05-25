"""
utils/security.py
-----------------
Lógica de seguridad centralizada:
  · Hash y verificación de contraseñas con Bcrypt.
  · Creación y decodificación de tokens JWT (acceso y reset).
  · Dependencia `get_current_user` para proteger endpoints.
  · Decorador `require_roles` para control de acceso por rol.
"""
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config.database import get_db
from config.settings import settings
from models.usuario import RolEnum, Usuario

# ── Bcrypt ─────────────────────────────────────────────────────────────────────
# utils/security.py
import bcrypt


def hash_password(password: str) -> str:
    # Convertimos la contraseña a bytes, generamos la sal y hasheamos
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)

    # Retornamos el hash como string para guardarlo en la BD
    return hashed_password.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Comprobamos la contraseña contra el hash
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

# ── JWT ────────────────────────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: int, rol: str) -> str:
    return _create_token(
        {"sub": str(subject), "rol": rol, "type": "access"},
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_reset_token(subject: int) -> str:
    return _create_token(
        {"sub": str(subject), "type": "reset"},
        timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES),
    )


def decode_token(token: str, expected_type: str = "access") -> dict:
    """
    Decodifica y valida un JWT.
    Lanza HTTPException 401 si el token es inválido o de tipo incorrecto.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != expected_type:
            raise JWTError("Tipo de token incorrecto.")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Dependencia: usuario autenticado ──────────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    payload = decode_token(token, expected_type="access")
    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token sin sujeto.")
    usuario = db.get(Usuario, int(user_id))
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    if not usuario.estado:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta inactiva.")
    return usuario


# ── Dependencia: verificar rol ─────────────────────────────────────────────────
def require_roles(*roles: RolEnum):
    """
    Dependencia de FastAPI que verifica que el usuario autenticado
    tenga al menos uno de los roles indicados.

    Uso:
        @router.get("/", dependencies=[Depends(require_roles(RolEnum.ADMIN))])
    """
    def _checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción.",
            )
        return current_user
    return _checker
