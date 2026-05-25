# 🎬 CINENOVA – Módulo de Gestión de Usuarios y Autenticación

API REST construida con **FastAPI + PostgreSQL + SQLAlchemy + JWT**.

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Clonar y configurar el entorno](#2-clonar-y-configurar-el-entorno)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Ejecutar migraciones](#4-ejecutar-migraciones)
5. [Cargar datos iniciales (Seeds)](#5-cargar-datos-iniciales-seeds)
6. [Levantar el servidor](#6-levantar-el-servidor)
7. [Probar la API](#7-probar-la-api)
8. [Estructura del proyecto](#8-estructura-del-proyecto)
9. [Roles y permisos](#9-roles-y-permisos)
10. [Guía de contribución](#10-guía-de-contribución)

---

## 1. Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Python | 3.11+ |
| PostgreSQL | 14+ |
| pip | 23+ |

Asegúrate de que PostgreSQL esté corriendo y de haber creado la base de datos:

```sql
-- Conéctate con psql o pgAdmin y ejecuta:
CREATE DATABASE cinenova;
```

---

## 2. Clonar y configurar el entorno

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/cinenova-api.git
cd cinenova-api

# Crear entorno virtual
python -m venv venv

# Activar (Linux/macOS)
source venv/bin/activate

# Activar (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

---

## 3. Variables de entorno

```bash
# Copiar la plantilla
cp .env .env
```

Edita `.env` con tus valores reales:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/cinenova

# Genera una clave segura con: openssl rand -hex 32
SECRET_KEY=pega_aqui_tu_clave_secreta

ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
RESET_TOKEN_EXPIRE_MINUTES=30

MAIL_FROM=noreply@cinenova.com
FRONTEND_URL=http://localhost:5173
```

---

## 4. Ejecutar migraciones

```bash
# Crear la migración inicial (solo la primera vez)
alembic revision --autogenerate -m "crear_tablas_usuario"

# Aplicar todas las migraciones pendientes
alembic upgrade head
```

Para migraciones posteriores al modificar modelos:

```bash
alembic revision --autogenerate -m "descripcion_del_cambio"
alembic upgrade head
```

Para revertir la última migración:

```bash
alembic downgrade -1
```

---

## 5. Cargar datos iniciales (Seeds)

```bash
python seeds.py
```

Esto crea el administrador por defecto:

| Campo | Valor |
|---|---|
| Correo | `admin@cinenova.com` |
| Contraseña | `Admin1234!` |

> ⚠️ **Cambia la contraseña inmediatamente en producción.**

---

## 6. Levantar el servidor

```bash
# Modo desarrollo (con recarga automática)
uvicorn main:app --reload --port 8000

# Modo producción
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

La API queda disponible en: `http://localhost:8000`

Documentación interactiva:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 7. Probar la API

### Usando Swagger UI

1. Abre `http://localhost:8000/docs`
2. Ejecuta `POST /auth/login` con las credenciales del admin.
3. Copia el `access_token` de la respuesta.
4. Haz clic en el botón **Authorize** (candado) y pega el token.
5. Ya puedes probar los endpoints protegidos.

### Usando curl

**Registrar un cliente:**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "López",
    "correo": "ana@ejemplo.com",
    "contrasena": "MiClave123",
    "confirmar_contrasena": "MiClave123"
  }'
```

**Iniciar sesión:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "admin@cinenova.com", "contrasena": "Admin1234!"}'
```

**Listar usuarios (requiere token de admin):**
```bash
curl -X GET "http://localhost:8000/admin/usuarios?limit=10" \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Solicitar reset de contraseña:**
```bash
curl -X POST http://localhost:8000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"correo": "ana@ejemplo.com"}'
```
El token de reset aparecerá en la consola del servidor (modo simulado).

---

## 8. Estructura del proyecto

```
cinenova/
├── main.py                  # Entrypoint FastAPI
├── alembic.ini              # Configuración Alembic
├── requirements.txt
├── seeds.py                 # Carga de datos iniciales
├── .env.example             # Plantilla de variables de entorno
│
├── config/
│   ├── settings.py          # Variables de entorno (Pydantic-Settings)
│   └── database.py          # Engine, SessionLocal, Base, get_db()
│
├── models/
│   ├── __init__.py          # Autodiscovery para Alembic
│   └── usuario.py           # Usuario, Cliente, Empleado, Administrador
│
├── schemas/
│   ├── __init__.py
│   └── usuario.py           # Pydantic schemas (Input / Output)
│
├── routers/
│   ├── __init__.py
│   ├── auth.py              # /auth/* (registro, login, reset password)
│   └── admin.py             # /admin/* (CRUD usuarios, solo ADMIN)
│
├── utils/
│   ├── __init__.py
│   ├── security.py          # Bcrypt, JWT, get_current_user, require_roles
│   └── email.py             # Envío de correos (simulado / SMTP)
│
└── migrations/
    ├── env.py               # Configuración Alembic adaptada
    ├── script.py.mako
    └── versions/            # Archivos de migración generados
```

---

## 9. Roles y permisos

| Endpoint | Público | Cliente | Empleado | Admin |
|---|:---:|:---:|:---:|:---:|
| `POST /auth/register` | ✅ | – | – | – |
| `POST /auth/login` | ✅ | – | – | – |
| `POST /auth/forgot-password` | ✅ | – | – | – |
| `POST /auth/reset-password` | ✅ | – | – | – |
| `GET /auth/me` | – | ✅ | ✅ | ✅ |
| `GET /admin/usuarios` | – | – | – | ✅ |
| `POST /admin/usuarios/empleado` | – | – | – | ✅ |
| `POST /admin/usuarios/admin` | – | – | – | ✅ |
| `PATCH /admin/usuarios/{id}` | – | – | – | ✅ |
| `DELETE /admin/usuarios/{id}` | – | – | – | ✅ |

---

## 10. Guía de contribución

1. Crea una rama desde `main`: `git checkout -b feat/nombre-funcionalidad`
2. Aplica el patrón de módulos existente (models → schemas → routers).
3. Para nuevas tablas: crea el modelo, agrégalo a `models/__init__.py`, genera la migración.
4. Haz commit con mensajes descriptivos: `git commit -m "feat: agregar endpoint de boletos"`
5. Abre un Pull Request con descripción del cambio.

---

> Desarrollado con ❤️ para el proyecto CINENOVA · Stack: FastAPI · PostgreSQL · SQLAlchemy · JWT
