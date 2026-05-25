"""
schemas/usuario.py
------------------
Modelos Pydantic que definen la forma de los datos entrantes y salientes
de la API. Separados por propósito:

  *Create  → entrada al registrar/crear
  *Update  → entrada al actualizar (campos opcionales)
  *Out     → salida serializada (nunca expone la contraseña)
  *Login   → credenciales de autenticación

"""
import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator

from models.usuario import RolEnum


# ── Schemas base compartidos ───────────────────────────────────────────────────
class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    correo: EmailStr


# ── Salida genérica de usuario (nunca expone contraseña) ──────────────────────
class UsuarioOut(UsuarioBase):
    id_usuario: int
    rol: RolEnum
    estado: bool
    fecha_registro: datetime

    model_config = {"from_attributes": True}


# ── Schemas de CLIENTE ─────────────────────────────────────────────────────────
class ClienteCreate(UsuarioBase):
    contrasena: str = Field(..., description="Contraseña fuerte requerida")
    confirmar_contrasena: str

    # Aplicamos el validador a la contraseña
    @field_validator("contrasena")
    @classmethod
    def validar_fuerza(cls, v: str) -> str:
        return validar_password_fuerte(v)

    @model_validator(mode="after")
    def passwords_match(self) -> "ClienteCreate":
        if self.contrasena != self.confirmar_contrasena:
            raise ValueError("Las contraseñas no coinciden.")
        return self

    tipo_cliente: str = Field(default="estandar")

class ClienteOut(UsuarioOut):
    tipo_cliente: str

    model_config = {"from_attributes": True}


# ── Schemas de EMPLEADO ────────────────────────────────────────────────────────
class EmpleadoCreate(UsuarioBase):
    """Solo el Admin puede crear empleados."""
    contrasena: str = Field(..., min_length=8)

    @field_validator("contrasena")
    @classmethod
    def validar_fuerza(cls, v: str) -> str:
        return validar_password_fuerte(v)

    cargo: str = Field(..., min_length=2, max_length=100)


class EmpleadoOut(UsuarioOut):
    cargo: str

    model_config = {"from_attributes": True}


# ── Schemas de ADMINISTRADOR ───────────────────────────────────────────────────
class AdministradorCreate(UsuarioBase):
    """Solo para seed interno o super-admin."""
    contrasena: str = Field(..., min_length=8)
    @field_validator("contrasena")
    @classmethod
    def validar_fuerza(cls, v: str) -> str:
        return validar_password_fuerte(v)


class AdministradorOut(UsuarioOut):
    model_config = {"from_attributes": True}


# ── Update genérico (Admin CRUD) ───────────────────────────────────────────────
class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)
    correo: Optional[EmailStr] = None
    estado: Optional[bool] = None
    # Campos específicos de rol
    tipo_cliente: Optional[str] = None
    cargo: Optional[str] = None


# ── Autenticación ──────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: RolEnum
    usuario: UsuarioOut


# ── Recuperación de contraseña ─────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    correo: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    nueva_contrasena: str
    confirmar_contrasena: str

    @field_validator("nueva_contrasena")
    @classmethod
    def validar_fuerza(cls, v: str) -> str:
        return validar_password_fuerte(v)

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.nueva_contrasena != self.confirmar_contrasena:
            raise ValueError("Las contraseñas no coinciden.")
        return self
class MessageResponse(BaseModel):
    message: str



# ── Validador reutilizable de contraseñas ──────────────────────────────────────
def validar_password_fuerte(v: str) -> str:
    if len(v) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
    if not re.search(r"[a-z]", v):
        raise ValueError("La contraseña debe contener al menos una letra minúscula.")
    if not re.search(r"\d", v):
        raise ValueError("La contraseña debe contener al menos un número.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
        raise ValueError("La contraseña debe contener al menos un carácter especial.")
    return v
