"""
models/__init__.py
Importar todos los modelos aquí para que Alembic los detecte automáticamente
cuando autogenera migraciones.
"""
from models.usuario import Usuario, Cliente, Empleado, Administrador, RolEnum  # noqa: F401
