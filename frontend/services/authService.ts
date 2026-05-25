// services/authService.ts
import api from "./api";

export const authService = {
  login: async (correo: string, contrasena: string) => {
    const response = await api.post("/auth/login", { correo, contrasena });
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  forgotPassword: async (correo: string) => {
    const response = await api.post("/auth/forgot-password", { correo });
    return response.data;
  },

  resetPassword: async (token: string, nueva_contrasena: string, confirmar_contrasena: string) => {
    const response = await api.post("/auth/reset-password", { 
      token, 
      nueva_contrasena,
      confirmar_contrasena // Requerido por el schema de Pydantic
    });
    return response.data;
  }
};