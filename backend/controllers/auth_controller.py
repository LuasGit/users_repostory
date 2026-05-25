from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.usuario import Cliente, RolEnum, Usuario
from schemas.usuario import (
    ClienteCreate, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from utils.email import send_reset_password_email, send_welcome_email
from utils.security import (
    create_access_token, create_reset_token, decode_token,
    hash_password, verify_password
)

def registrar_cliente(db: Session, payload: ClienteCreate) -> Cliente:
    if db.query(Usuario).filter(Usuario.correo == payload.correo).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese correo.",
        )

    nuevo_cliente = Cliente(
        nombre=payload.nombre,
        apellido=payload.apellido,
        correo=payload.correo,
        contrasena=hash_password(payload.contrasena),
        rol=RolEnum.CLIENTE,
        tipo_cliente=payload.tipo_cliente,
    )
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)

    send_welcome_email(to=nuevo_cliente.correo, nombre=nuevo_cliente.nombre)
    return nuevo_cliente

def autenticar_usuario(db: Session, payload: LoginRequest) -> dict:
    usuario = db.query(Usuario).filter(Usuario.correo == payload.correo).first()

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales incorrectas.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not usuario or not verify_password(payload.contrasena, usuario.contrasena):
        raise credentials_error
    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta está desactivada. Contacta al administrador.",
        )

    token = create_access_token(subject=usuario.id_usuario, rol=usuario.rol.value)
    return {
        "access_token": token,
        "rol": usuario.rol,
        "usuario": usuario
    }

def solicitar_restablecimiento(db: Session, payload: ForgotPasswordRequest) -> None:
    usuario = db.query(Usuario).filter(Usuario.correo == payload.correo).first()

    if usuario and usuario.estado:
        token = create_reset_token(subject=usuario.id_usuario)
        send_reset_password_email(
            to=usuario.correo,
            nombre=usuario.nombre,
            token=token,
        )

def confirmar_restablecimiento(db: Session, payload: ResetPasswordRequest) -> None:
    token_data = decode_token(payload.token, expected_type="reset")
    user_id = int(token_data["sub"])

    usuario = db.get(Usuario, user_id)
    if not usuario or not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado o inactivo.",
        )

    usuario.contrasena = hash_password(payload.nueva_contrasena)
    db.commit()