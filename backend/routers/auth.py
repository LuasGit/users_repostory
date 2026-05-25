"""
routers/auth.py
---------------
Endpoints públicos de autenticación:

  POST /auth/register   – Registro de nuevos clientes
  POST /auth/login      – Login → devuelve JWT
  POST /auth/forgot-password  – Solicita enlace de restablecimiento
  POST /auth/reset-password   – Define la nueva contraseña con el token
  GET  /auth/me         – Perfil del usuario autenticado (protegido)
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from config.database import get_db
from models.usuario import Usuario
from schemas.usuario import (
    ClienteCreate, ClienteOut, ForgotPasswordRequest, LoginRequest,
    MessageResponse, ResetPasswordRequest, TokenOut, UsuarioOut
)
from utils.security import get_current_user

# Importamos el controlador
from controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=ClienteOut, status_code=status.HTTP_201_CREATED, summary="Registro público de clientes")
def register(payload: ClienteCreate, db: Session = Depends(get_db)):
    return auth_controller.registrar_cliente(db, payload)

@router.post("/login", response_model=TokenOut, summary="Iniciar sesión y obtener JWT")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    resultado = auth_controller.autenticar_usuario(db, payload)
    return TokenOut(
        access_token=resultado["access_token"],
        rol=resultado["rol"],
        usuario=UsuarioOut.model_validate(resultado["usuario"])
    )

@router.get("/me", response_model=UsuarioOut, summary="Perfil del usuario autenticado")
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password", response_model=MessageResponse, summary="Solicitar restablecimiento de contraseña")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_controller.solicitar_restablecimiento(db, payload)
    return MessageResponse(message="Si el correo existe en nuestro sistema, recibirás un enlace en breve.")

@router.post("/reset-password", response_model=MessageResponse, summary="Definir nueva contraseña con token")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_controller.confirmar_restablecimiento(db, payload)
    return MessageResponse(message="Contraseña actualizada exitosamente.")