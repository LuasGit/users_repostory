# backend/tests/test_admin.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# 1. FIXTURE: Obtiene el token de administrador antes de ejecutar las pruebas
@pytest.fixture
def admin_token():
    response = client.post(
        "/auth/login",
        # Usamos el admin garantizado por tu archivo seeds.py
        json={"correo": "admin@cinenova.com", "contrasena": "Admin123!"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


# 2. PRUEBA DE SEGURIDAD: Intentar acceder sin token
def test_listar_usuarios_sin_token():
    response = client.get("/admin/usuarios")
    # Debe ser bloqueado inmediatamente
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


# 3. PRUEBA DE ÉXITO: Listar usuarios con el token correcto
def test_listar_usuarios_con_token(admin_token):
    # Adjuntamos el token en las cabeceras (Headers) de la petición
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/usuarios", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)  # Debe devolver una lista de usuarios


# 4. PRUEBA DE CREACIÓN: Registrar un empleado aplicando validación de contraseña
def test_crear_empleado_como_admin(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    nuevo_empleado = {
        "nombre": "Prueba",
        "apellido": "Empleado",
        "correo": "prueba_empleado@cinenova.com",
        "contrasena": "Fuerte123!",  # Cumple con mayúscula, minúscula, número y especial
        "cargo": "Taquilla"
    }

    response = client.post("/admin/usuarios/empleado", json=nuevo_empleado, headers=headers)

    # Manejamos ambos casos: 201 si es la primera vez que se corre el test,
    # o 409 si el test ya se corrió antes y el correo quedó registrado.
    assert response.status_code in [201, 409]

    if response.status_code == 201:
        data = response.json()
        assert data["correo"] == "prueba_empleado@cinenova.com"
        assert data["rol"] == "empleado"


# 5. PRUEBA DE FALLO: Intentar crear empleado con contraseña débil
def test_crear_empleado_contrasena_debil(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    empleado_malo = {
        "nombre": "Hacker",
        "apellido": "Malo",
        "correo": "hacker@cinenova.com",
        "contrasena": "12345",  # Contraseña débil, debe fallar la validación de Pydantic
        "cargo": "Sistemas"
    }

    response = client.post("/admin/usuarios/empleado", json=empleado_malo, headers=headers)
    assert response.status_code == 422  # Error de validación de datos


# 6. PRUEBA DE MODIFICACIÓN: Desactivar al usuario que acabamos de crear
def test_desactivar_usuario(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Primero obtenemos la lista para buscar al usuario de prueba
    res_lista = client.get("/admin/usuarios", headers=headers)
    usuarios = res_lista.json()

    # Filtramos para encontrar el ID del usuario de prueba
    usuario_prueba = next((u for u in usuarios if u["correo"] == "prueba_empleado@cinenova.com"), None)

    if usuario_prueba:
        id_usuario = usuario_prueba["id_usuario"]
        res_delete = client.delete(f"/admin/usuarios/{id_usuario}", headers=headers)

        assert res_delete.status_code == 200
        assert "desactivado correctamente" in res_delete.json()["message"]