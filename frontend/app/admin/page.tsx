"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { authService } from "@/services/authService"
import { Users, Film, TicketCheck, TrendingUp } from "lucide-react"

const stats = [
  { label: "Usuarios Totales", value: "1,234", icon: Users, trend: "+12%" },
  { label: "Películas Activas", value: "45", icon: Film, trend: "+3" },
  { label: "Reservas Hoy", value: "89", icon: TicketCheck, trend: "+23%" },
  { label: "Ingresos del Mes", value: "$12,450", icon: TrendingUp, trend: "+8%" },
]

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F9FAFB]">Dashboard</h1>
        <p className="text-[#9CA3AF] mt-1">Bienvenido al panel de administración de CINENOVA</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="bg-[#111827] rounded-xl p-6 border border-[#374151]/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#DC2626]/10 rounded-lg">
                <stat.icon className="text-[#DC2626]" size={24} />
              </div>
              <span className="text-[#FBBF24] text-sm font-medium">{stat.trend}</span>
            </div>
            <p className="text-2xl font-bold text-[#F9FAFB]">{stat.value}</p>
            <p className="text-[#9CA3AF] text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] rounded-xl p-6 border border-[#374151]/30 min-h-[300px]">
          <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Reservas Recientes</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-[#374151] rounded-lg">
            <p className="text-[#9CA3AF]">Gráfico de reservas próximamente</p>
          </div>
        </div>
        <div className="bg-[#111827] rounded-xl p-6 border border-[#374151]/30 min-h-[300px]">
          <h3 className="text-lg font-semibold text-[#F9FAFB] mb-4">Películas Más Populares</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-[#374151] rounded-lg">
            <p className="text-[#9CA3AF]">Estadísticas de películas próximamente</p>
          </div>
        </div>
      </div>
    </div>
  )
}
