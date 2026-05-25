"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/adminService";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Alineamos el Type con lo que devuelve FastAPI (minúsculas)
type UserRole = "admin" | "empleado" | "cliente";

interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: UserRole; 
  fecha_registro: string;
  estado: boolean;
}

const getRoleBadgeColor = (rol: UserRole) => {
  switch (rol) {
    case "admin":
      return "bg-[#DC2626]/20 text-[#DC2626] border-[#DC2626]/30";
    case "empleado":
      return "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30";
    case "cliente":
      return "bg-[#9CA3AF]/20 text-[#9CA3AF] border-[#9CA3AF]/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

// Helper para mostrar la primera letra en mayúscula en la UI
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function GestionUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // 2. Agregamos "apellido" al estado inicial
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    rol: "empleado" as UserRole, // Por defecto empleado para evitar crear admins por error
    password: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsuarios = async () => {
    try {
      const data = await adminService.getUsuarios();
      setUsers(data.filter((u: User) => u.estado === true));
    } catch (error) {
      console.error("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCreate = async () => {
    try {
      if (formData.rol === "empleado") {
        await adminService.crearEmpleado({
          nombre: formData.nombre,
          apellido: formData.apellido, // Enviamos el dato real
          correo: formData.correo,
          contrasena: formData.password,
          cargo: "Atención al Cliente" // Dato por defecto para el schema
        });
      } else if (formData.rol === "admin") {
        await adminService.crearAdmin({
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          contrasena: formData.password,
        });
      } else {
        alert("Los clientes deben registrarse por su cuenta en el portal público.");
        return;
      }
      
      await fetchUsuarios();
      setIsCreateModalOpen(false);
      // Limpiar formulario
      setFormData({ nombre: "", apellido: "", correo: "", rol: "empleado", password: "" });
    } catch (error: any) {
      alert(error.response?.data?.detail?.[0]?.msg || error.response?.data?.detail || "Error al crear usuario. Verifica la contraseña fuerte.");
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    try {
      // 3. Conectamos la edición con el Backend usando PATCH
      await adminService.actualizarUsuario(selectedUser.id_usuario, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
      });

      await fetchUsuarios();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setFormData({ nombre: "", apellido: "", correo: "", rol: "empleado", password: "" });
    } catch (error: any) {
      alert(error.response?.data?.detail || "Error al actualizar el usuario.");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await adminService.eliminarUsuario(selectedUser.id_usuario);
      await fetchUsuarios();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert("Error al desactivar al usuario");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      rol: user.rol,
      password: "", // No traemos la contraseña por seguridad
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F9FAFB]">
            Gestión de Usuarios
          </h1>
          <p className="text-[#9CA3AF] mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ nombre: "", apellido: "", correo: "", rol: "empleado", password: "" });
            setIsCreateModalOpen(true);
          }}
          className="bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB] font-semibold gap-2"
        >
          <Plus size={18} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            size={18}
          />
          <Input
            placeholder="Buscar por nombre, correo o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#111827] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] rounded-xl border border-[#374151]/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#374151]/30 hover:bg-transparent">
              <TableHead className="text-[#9CA3AF] font-semibold">Nombre Completo</TableHead>
              <TableHead className="text-[#9CA3AF] font-semibold">Correo</TableHead>
              <TableHead className="text-[#9CA3AF] font-semibold">Rol</TableHead>
              <TableHead className="text-[#9CA3AF] font-semibold">Fecha de Registro</TableHead>
              <TableHead className="text-[#9CA3AF] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow
                key={user.id_usuario}
                className="border-[#374151]/30 hover:bg-[#1F2937]/50"
              >
                <TableCell className="text-[#F9FAFB] font-medium">
                  {user.nombre} {user.apellido}
                </TableCell>
                <TableCell className="text-[#9CA3AF]">{user.correo}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getRoleBadgeColor(user.rol)}
                  >
                    {capitalize(user.rol)}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#9CA3AF]">
                  {/* 4. Cambiado a user.fecha_registro */}
                  {new Date(user.fecha_registro).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 rounded-lg hover:bg-[#FBBF24]/10 text-[#FBBF24] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    {/* Evitar que el admin se borre a sí mismo accidentalmente (opcional visual) */}
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="p-2 rounded-lg hover:bg-[#DC2626]/10 text-[#DC2626] transition-colors"
                      title="Desactivar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#374151]/30">
          <p className="text-sm text-[#9CA3AF]">
            Mostrando {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a{" "}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de{" "}
            {filteredUsers.length} usuarios
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-[#9CA3AF] px-2">
              Página {totalPages === 0 ? 0 : currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[#111827] border-[#374151] text-[#F9FAFB]">
          <DialogHeader>
            <DialogTitle className="text-[#F9FAFB]">
              Crear Nuevo Usuario
            </DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              Nota: La contraseña debe tener 8 caracteres, 1 mayúscula, 1 número y 1 especial.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#F9FAFB]">Nombres</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]"
                  placeholder="Nombres"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#F9FAFB]">Apellidos</Label>
                <Input
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]"
                  placeholder="Apellidos"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#F9FAFB]">Correo Electrónico</Label>
              <Input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#F9FAFB]">Contraseña</Label>
              <Input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]"
                placeholder="Ej: Cinenova123!"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#F9FAFB]">Rol</Label>
              <Select
                value={formData.rol}
                onValueChange={(value: UserRole) => setFormData({ ...formData, rol: value })}
              >
                <SelectTrigger className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1F2937] border-[#374151]">
                  <SelectItem value="admin" className="text-[#F9FAFB]">Admin</SelectItem>
                  <SelectItem value="empleado" className="text-[#F9FAFB]">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              className="bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB]"
            >
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#111827] border-[#374151] text-[#F9FAFB]">
          <DialogHeader>
            <DialogTitle className="text-[#F9FAFB]">Editar Usuario</DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              Modifica los datos del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#F9FAFB]">Nombres</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#F9FAFB]">Apellidos</Label>
                <Input
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#F9FAFB]">Correo Electrónico</Label>
              <Input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="bg-[#1F2937] border-[#374151] text-[#F9FAFB]"
              />
            </div>
            {/* Ocultamos el select de Rol en la edición, generalmente un cambio de rol requiere otra lógica de negocio */}
            <div className="space-y-2">
              <Label className="text-[#F9FAFB]">Rol Actual (Solo lectura)</Label>
              <Input
                disabled
                value={capitalize(formData.rol)}
                className="bg-[#1F2937] border-[#374151] text-[#9CA3AF] cursor-not-allowed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-[#FBBF24] hover:bg-[#FCD34D] text-[#020617]"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#111827] border-[#374151] text-[#F9FAFB]">
          <DialogHeader>
            <DialogTitle className="text-[#F9FAFB]">
              Desactivar Usuario
            </DialogTitle>
            <DialogDescription className="text-[#9CA3AF]">
              ¿Estás seguro de que deseas desactivar a{" "}
              <span className="text-[#F9FAFB] font-medium">
                {selectedUser?.nombre} {selectedUser?.apellido}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB]"
            >
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}