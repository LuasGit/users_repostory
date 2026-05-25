from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.usuario import Administrador, Empleado, RolEnum, Usuario
from schemas.usuario import (
    AdministradorCreate,
    EmpleadoCreate,
    UsuarioUpdate,
)
from utils.security import hash_password

def _check_correo_unico(db: Session, correo: str) -> None:
    if db.query(Usuario).filter(Usuario.correo == correo).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese correo.",
        )

def listar_usuarios(db: Session, rol: Optional[RolEnum], estado: Optional[bool], skip: int, limit: int) -> List[Usuario]:
    query = db.query(Usuario)
    if rol is not None:
        query = query.filter(Usuario.rol == rol)
    if estado is not None:
        query = query.filter(Usuario.estado == estado)
    return query.order_by(Usuario.fecha_registro.desc()).offset(skip).limit(limit).all()

def obtener_usuario(db: Session, id_usuario: int) -> Usuario:
    usuario = db.get(Usuario, id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return usuario

def crear_empleado(db: Session, payload: EmpleadoCreate) -> Empleado:
    _check_correo_unico(db, payload.correo)
    empleado = Empleado(
        nombre=payload.nombre,
        apellido=payload.apellido,
        correo=payload.correo,
        contrasena=hash_password(payload.contrasena),
        rol=RolEnum.EMPLEADO,
        cargo=payload.cargo,
    )
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado

def crear_administrador(db: Session, payload: AdministradorCreate) -> Administrador:
    _check_correo_unico(db, payload.correo)
    admin = Administrador(
        nombre=payload.nombre,
        apellido=payload.apellido,
        correo=payload.correo,
        contrasena=hash_password(payload.contrasena),
        rol=RolEnum.ADMIN,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

def actualizar_usuario(db: Session, id_usuario: int, payload: UsuarioUpdate) -> Usuario:
    usuario = db.get(Usuario, id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    data = payload.model_dump(exclude_unset=True)

    if "correo" in data and data["correo"] != usuario.correo:
        _check_correo_unico(db, data["correo"])

    for campo, valor in data.items():
        if hasattr(usuario, campo):
            setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario

def desactivar_usuario(db: Session, id_usuario: int) -> str:
    usuario = db.get(Usuario, id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    usuario.estado = False
    db.commit()
    return f"Usuario {id_usuario} desactivado correctamente."