"""
main.py
-------
Punto de entrada de la aplicación CINENOVA.

Levanta el servidor con:
    uvicorn main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, admin

# ── Instancia de la aplicación ─────────────────────────────────────────────────
app = FastAPI(
    title="CINENOVA – API de Gestión de Usuarios",
    description=(
        "API REST para el módulo de autenticación y gestión de usuarios "
        "del sistema de venta de boletos CINENOVA.\n\n"
        "**Roles disponibles:** `admin` · `empleado` · `cliente`"
    ),
    version="1.0.0",
    contact={"name": "Equipo CINENOVA", "email": "dev@cinenova.com"},
    license_info={"name": "MIT"},
)

# ── CORS (ajustar origins en producción) ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Registrar routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(admin.router)


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="Estado de la API")
def root():
    return {"status": "ok", "service": "CINENOVA API", "version": "1.0.0"}
