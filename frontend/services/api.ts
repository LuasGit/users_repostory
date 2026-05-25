// services/api.ts
import axios from "axios";
import Cookies from "js-cookie";

// Creamos la instancia base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Peticiones: Adjunta el JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas: Maneja errores globales (ej. Token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verificamos si la petición original era hacia el endpoint de login
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      // Solo cerramos sesión automáticamente si NO es un intento de login
      Cookies.remove("access_token");
      Cookies.remove("user_role");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;