"""
routers/admin.py
----------------
Endpoints protegidos – solo accesibles con rol ADMIN.

  GET    /admin/usuarios          – Listar todos los usuarios (paginado)
  GET    /admin/usuarios/{id}     – Detalle de un usuario
  POST   /admin/usuarios/empleado – Crear empleado
  POST   /admin/usuarios/admin    – Crear administrador
  PATCH  /admin/usuarios/{id}     – Actualizar datos de usuario
  DELETE /admin/usuarios/{id}     – Desactivar (soft-delete)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from config.database import get_db
from models.usuario import RolEnum
from schemas.usuario import (
    AdministradorCreate, AdministradorOut, EmpleadoCreate,
    EmpleadoOut, MessageResponse, UsuarioOut, UsuarioUpdate
)
from utils.security import require_roles

# Importamos el controlador
from controllers import admin_controller

router = APIRouter(
    prefix="/admin",
    tags=["Administración"],
    dependencies=[Depends(require_roles(RolEnum.ADMIN))],
)

@router.get("/usuarios", response_model=List[UsuarioOut], summary="Listar todos los usuarios")
def listar_usuarios(
    rol: Optional[RolEnum] = Query(None, description="Filtrar por rol"),
    estado: Optional[bool] = Query(None, description="Filtrar por estado"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return admin_controller.listar_usuarios(db, rol, estado, skip, limit)

@router.get("/usuarios/{id_usuario}", response_model=UsuarioOut, summary="Detalle de un usuario")
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db)):
    return admin_controller.obtener_usuario(db, id_usuario)

@router.post("/usuarios/empleado", response_model=EmpleadoOut, status_code=status.HTTP_201_CREATED, summary="Crear nuevo empleado")
def crear_empleado(payload: EmpleadoCreate, db: Session = Depends(get_db)):
    return admin_controller.crear_empleado(db, payload)

@router.post("/usuarios/admin", response_model=AdministradorOut, status_code=status.HTTP_201_CREATED, summary="Crear nuevo administrador")
def crear_administrador(payload: AdministradorCreate, db: Session = Depends(get_db)):
    return admin_controller.crear_administrador(db, payload)

@router.patch("/usuarios/{id_usuario}", response_model=UsuarioOut, summary="Actualizar datos de un usuario")
def actualizar_usuario(id_usuario: int, payload: UsuarioUpdate, db: Session = Depends(get_db)):
    return admin_controller.actualizar_usuario(db, id_usuario, payload)

@router.delete("/usuarios/{id_usuario}", response_model=MessageResponse, summary="Desactivar un usuario (soft delete)")
def desactivar_usuario(id_usuario: int, db: Session = Depends(get_db)):
    mensaje = admin_controller.desactivar_usuario(db, id_usuario)
    return MessageResponse(message=mensaje)