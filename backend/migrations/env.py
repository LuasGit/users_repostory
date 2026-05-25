"""
migrations/env.py
-----------------
Configuración de Alembic adaptada al proyecto CINENOVA.

Soporta migraciones tanto offline (sin conexión DB) como online.
Autodescubre todos los modelos a través de `models.__init__`.
"""
import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# ── Añadir raíz del proyecto al path ──────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ── Importar Base y todos los modelos (para autogeneración) ───────────────────
from config.database import Base          # noqa: E402
import models                             # noqa: E402, F401  ← activa el autodiscovery

# ── Leer la URL de la base de datos desde settings ────────────────────────────
from config.settings import settings      # noqa: E402

# ── Configuración de Alembic ──────────────────────────────────────────────────
config = context.config

# Inyectar la URL desde settings (sobrescribe alembic.ini)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ── Modo offline ──────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Modo online ───────────────────────────────────────────────────────────────
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
