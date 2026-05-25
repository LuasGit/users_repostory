# backend/tests/test_auth.py
from fastapi.testclient import TestClient
# Cámbialo a:
from main import app

# Creamos un cliente de pruebas que simula peticiones sin levantar el servidor real
client = TestClient(app)

def test_login_exitoso():
    # Usamos las credenciales del seed que creamos
    response = client.post(
        "/auth/login",
        json={"correo": "admin@cinenova.com", "contrasena": "Admin123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["rol"] == "admin"

def test_login_fallido_contrasena_incorrecta():
    response = client.post(
        "/auth/login",
        json={"correo": "admin@cinenova.com", "contrasena": "ClaveEquivocada123!"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciales incorrectas."

def test_registro_cliente_password_debil():
    response = client.post(
        "/auth/register",
        json={
            "nombre": "Test",
            "apellido": "User",
            "correo": "test@cinenova.com",
            "contrasena": "123", # Contraseña débil para probar la validación
            "confirmar_contrasena": "123",
            "tipo_cliente": "estandar"
        }
    )
    assert response.status_code == 422 # 422 Unprocessable Entity (Fallo de validación Pydantic)