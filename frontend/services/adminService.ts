import api from "./api";

export const adminService = {
  getUsuarios: async (skip = 0, limit = 100) => {
    const response = await api.get(`/admin/usuarios?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  crearEmpleado: async (data: any) => {
    const response = await api.post("/admin/usuarios/empleado", data);
    return response.data;
  },

  crearAdmin: async (data: any) => {
    const response = await api.post("/admin/usuarios/admin", data);
    return response.data;
  },

  actualizarUsuario: async (id: number, data: any) => {
    const response = await api.patch(`/admin/usuarios/${id}`, data);
    return response.data;
  },

  eliminarUsuario: async (id: number) => {
    const response = await api.delete(`/admin/usuarios/${id}`);
    return response.data;
  }
};