

# 🎬 CINENOVA – Sistema de Venta de Boletos

Plataforma integral para la gestión de cines, desarrollada con una arquitectura desacoplada: **Backend en FastAPI** y **Frontend en Next.js**.

---

## 🚀 Guía de Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone git@github.com:TU_USUARIO/cinenova.git
cd cinenova
```


### 2. Configurar el Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # O venv\Scripts\activate en Windows

pip install -r requirements.txt

# Copia el ejemplo de variables de entorno y ajústalo (DB, JWT, etc.)
cp .env.example .env

# Ejecutar migraciones
alembic upgrade head

# Cargar administrador por defecto
python seeds.py

# Levantar API
uvicorn main:app --reload --port 8000

```

### 3. Configurar el Frontend (Next.js)

En una nueva terminal:

```bash
cd frontend
pnpm install

# Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Levantar Frontend
pnpm dev

```

---

## 🛠️ Arquitectura del Proyecto

* **Backend:** FastAPI, SQLAlchemy, Alembic, JWT Auth.
* **Frontend:** Next.js (App Router), Tailwind CSS, Lucide Icons, Shadcn UI.
* **Base de Datos:** PostgreSQL.

### Estructura de carpetas

```text
cinenova/
├── backend/    # Lógica API, Modelos, Controladores
└── frontend/   # Vistas, Servicios, Componentes UI

```

---

## 🔒 Seguridad y Roles

El sistema implementa protección de rutas mediante **Middleware** en el frontend y **Depends(require_roles)** en el backend.

| Rol | Acceso |
| --- | --- |
| **Admin** | Panel completo, CRUD usuarios, Gestión total. |
| **Empleado** | Cartelera, Funciones, Ventas. |
| **Cliente** | Registro, Cartelera, Reservas. |

---

## 🧪 Pruebas Automatizadas

Para verificar que todo funciona correctamente:

1. **Backend:** Ejecuta `python -m pytest -v` dentro de la carpeta `backend/`.
2. **Postman:** Importa la colección `Cinenova.postman_collection.json` y ejecuta el **Collection Runner** para validar el flujo completo de autenticación y CRUD.

---

## 💡 Notas para el equipo

* Asegúrate de tener **PostgreSQL 14+** corriendo localmente.
* Si recibes errores de autenticación en WSL, configura tus llaves SSH en GitHub siguiendo la guía oficial.
* Cualquier cambio en la base de datos debe generar una nueva migración con `alembic revision --autogenerate`.
