"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation" // <-- Agregado useRouter
import Cookies from "js-cookie" // <-- Agregada la importación de js-cookie
import { 
  Users, 
  Film, 
  Calendar,
  TicketCheck,
  Settings,
  LogOut,
  ChevronRight,
  LayoutDashboard
} from "lucide-react"
import { CinenovaLogo } from "@/components/cinenova-logo"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  children: React.ReactNode
}

const menuItems = [
  { 
    label: "Dashboard", 
    href: "/admin", 
    icon: LayoutDashboard 
  },
  { 
    label: "Gestión de Usuarios", 
    href: "/admin/usuarios", 
    icon: Users 
  },
  { 
    label: "Películas", 
    href: "/admin/peliculas", 
    icon: Film 
  },
  { 
    label: "Funciones", 
    href: "/admin/funciones", 
    icon: Calendar 
  },
  { 
    label: "Reservas", 
    href: "/admin/reservas", 
    icon: TicketCheck 
  },
  { 
    label: "Configuración", 
    href: "/admin/configuracion", 
    icon: Settings 
  },
]

export function AdminSidebar({ children }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter() // <-- Inicializado el router

  const handleLogout = () => {
    // 1. Destruimos la sesión local
    Cookies.remove("access_token")
    Cookies.remove("user_role")
    
    // 2. Redirigimos al login manualmente
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] border-r border-[#374151]/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#374151]/30">
          <CinenovaLogo size="md" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-[#DC2626] text-[#F9FAFB]" 
                    : "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB]"
                )}
              >
                <item.icon size={20} className={cn(
                  isActive ? "text-[#F9FAFB]" : "text-[#9CA3AF] group-hover:text-[#FBBF24]"
                )} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#374151]/30">
          {/* Cambiado <Link> por <button> */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#DC2626] transition-all"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}