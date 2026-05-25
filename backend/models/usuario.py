"""
models/usuario.py
-----------------
Define la jerarquía de tablas con herencia por tabla unida (joined-table
inheritance) de SQLAlchemy:

    USUARIO  ──┬── CLIENTE
               ├── EMPLEADO
               └── ADMINISTRADOR
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey,
    Integer, String,
)
from sqlalchemy.orm import relationship

from config.database import Base


# ── Enum de roles ──────────────────────────────────────────────────────────────
class RolEnum(str, enum.Enum):
    ADMIN = "admin"
    EMPLEADO = "empleado"
    CLIENTE = "cliente"


# ── Tabla padre: USUARIO ───────────────────────────────────────────────────────
class Usuario(Base):
    __tablename__ = "usuario"

    # Columna discriminadora para la herencia ORM
    __mapper_args__ = {
        "polymorphic_on": "rol",
        "polymorphic_identity": None,
    }

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    correo = Column(String(255), unique=True, index=True, nullable=False)
    contrasena = Column(String(255), nullable=False)      # Almacena el hash
    estado = Column(Boolean, default=True, nullable=False)
    fecha_registro = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    rol = Column(Enum(RolEnum), nullable=False)

    def __repr__(self) -> str:
        return f"<Usuario id={self.id_usuario} correo={self.correo} rol={self.rol}>"


# ── Tabla hija: CLIENTE ────────────────────────────────────────────────────────
class Cliente(Usuario):
    __tablename__ = "cliente"

    __mapper_args__ = {"polymorphic_identity": RolEnum.CLIENTE}

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        primary_key=True,
    )
    tipo_cliente = Column(String(50), default="estandar")   # estandar | premium | vip


# ── Tabla hija: EMPLEADO ───────────────────────────────────────────────────────
class Empleado(Usuario):
    __tablename__ = "empleado"

    __mapper_args__ = {"polymorphic_identity": RolEnum.EMPLEADO}

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        primary_key=True,
    )
    cargo = Column(String(100), nullable=False, default="cajero")


# ── Tabla hija: ADMINISTRADOR ──────────────────────────────────────────────────
class Administrador(Usuario):
    __tablename__ = "administrador"

    __mapper_args__ = {"polymorphic_identity": RolEnum.ADMIN}

    id_usuario = Column(
        Integer,
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        primary_key=True,
    )
