"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { authService } from "@/services/authService"


import Link from "next/link"
import { Calendar, Film, Clock, LogOut, TicketCheck, Users } from "lucide-react"
import { CinenovaLogo } from "@/components/cinenova-logo"
import { Button } from "@/components/ui/button"

const quickActions = [
  { label: "Cartelera de Hoy", href: "/empleado/cartelera", icon: Film, description: "Ver películas en exhibición" },
  { label: "Funciones Activas", href: "/empleado/funciones", icon: Clock, description: "Gestionar horarios y salas" },
  { label: "Venta de Boletos", href: "/empleado/ventas", icon: TicketCheck, description: "Realizar ventas en taquilla" },
  { label: "Clientes", href: "/empleado/clientes", icon: Users, description: "Buscar y clientes" },
]

export default function EmpleadoWelcomePage() {
  const router = useRouter()
  // 2. Estado para guardar los datos del usuario
  const [user, setUser] = useState<{nombre: string, apellido: string} | null>(null)

  // 3. Obtener el perfil al cargar la página
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await authService.getProfile()
        setUser(userData)
      } catch (error) {
        // Si el token falló o expiró, lo mandamos al login
        Cookies.remove("access_token")
        router.push("/login")
      }
    }
    fetchProfile()
  }, [router])

  // 4. Mostrar un estado de carga mientras llega el dato
  if (!user) return <div className="min-h-screen bg-[#020617] flex justify-center items-center text-white">Cargando...</div>

  return (
    <div className="min-h-screen bg-[#020617]">
      <header className="bg-[#111827] border-b border-[#374151]/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <CinenovaLogo size="md" />
            <div className="flex items-center gap-4">
              <span className="text-[#9CA3AF] text-sm">
                {/* 5. Reemplazar el texto quemado por las variables */}
                Hola, <span className="text-[#F9FAFB] font-medium">{user.nombre} {user.apellido}</span>
              </span>
              <button 
                onClick={() => {
                  Cookies.remove("access_token");
                  Cookies.remove("user_role");
                  router.push("/login");
                }}
                className="flex items-center text-sm text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#F9FAFB] mb-2">
            {/* 6. Reemplazar aquí también */}
            ¡Bienvenido a CINENOVA, {user.nombre}!
          </h1>
          <p className="text-[#9CA3AF] text-lg">
            Panel de empleado - Gestiona la cartelera y las ventas del día
          </p>
        </div>

        {/* Today&apos;s Summary */}
        <div className="bg-[#111827] rounded-xl p-6 border border-[#374151]/30 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-[#FBBF24]" size={24} />
            <h2 className="text-xl font-semibold text-[#F9FAFB]">Resumen del Día</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1F2937] rounded-lg p-4">
              <p className="text-3xl font-bold text-[#F9FAFB]">12</p>
              <p className="text-[#9CA3AF] text-sm">Funciones programadas</p>
            </div>
            <div className="bg-[#1F2937] rounded-lg p-4">
              <p className="text-3xl font-bold text-[#F9FAFB]">156</p>
              <p className="text-[#9CA3AF] text-sm">Boletos vendidos hoy</p>
            </div>
            <div className="bg-[#1F2937] rounded-lg p-4">
              <p className="text-3xl font-bold text-[#F9FAFB]">8</p>
              <p className="text-[#9CA3AF] text-sm">Películas en cartelera</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold text-[#F9FAFB] mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickActions.map((action) => (
            <Link 
              key={action.label}
              href={action.href}
              className="bg-[#111827] rounded-xl p-6 border border-[#374151]/30 hover:border-[#DC2626]/50 transition-all group"
            >
              <div className="p-3 bg-[#DC2626]/10 rounded-lg w-fit mb-4 group-hover:bg-[#DC2626]/20 transition-colors">
                <action.icon className="text-[#DC2626]" size={24} />
              </div>
              <h3 className="text-[#F9FAFB] font-semibold mb-1">{action.label}</h3>
              <p className="text-[#9CA3AF] text-sm">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Cartelera de Hoy Placeholder */}
        <div className="bg-[#111827] rounded-xl p-6 border border-[#374151]/30">
          <h2 className="text-xl font-semibold text-[#F9FAFB] mb-4">Cartelera de Hoy</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-[#374151] rounded-lg">
            <div className="text-center">
              <Film className="mx-auto text-[#374151] mb-2" size={48} />
              <p className="text-[#9CA3AF]">Las películas en cartelera se mostrarán aquí</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
