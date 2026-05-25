"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

import { CinenovaLogo } from "@/components/cinenova-logo"
import { RecaptchaWidget } from "@/components/recaptcha-widget"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Asumiendo que creaste este servicio en el paso anterior
import { authService } from "@/services/authService"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  
  // Nuevos estados para la petición a la API
  const [globalError, setGlobalError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError("")
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingresa un correo electrónico válido"
    }
    
    if (!password) {
      newErrors.password = "La contraseña es requerida"
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }
    
    setErrors(newErrors)
    
    // Si no hay errores de validación local, disparamos la petición
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true)
      
      try {
        const data = await authService.login(email, password)
        
        // Guardar token y rol en cookies (expiran en 1 día)
        Cookies.set("access_token", data.access_token, { expires: 1 })
        Cookies.set("user_role", data.rol, { expires: 1 })

        // Redirección basada en el rol de la base de datos
        if (data.rol === "admin") {
          router.push("/admin")
        } else if (data.rol === "empleado") {
          router.push("/empleado")
        } else {
          router.push("/cliente")
        }
      } catch (err: any) {
        // Capturamos el error 401 o 403 que envía FastAPI
        setGlobalError(err.response?.data?.detail || "Ocurrió un error al intentar iniciar sesión.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl p-8 shadow-2xl border border-[#374151]/30">
          <div className="flex justify-center mb-8">
            <CinenovaLogo size="lg" />
          </div>

          {/* Alerta de Error Global (Credenciales incorrectas) */}
          {globalError && (
            <div className="mb-6 p-3 bg-[#DC2626]/10 border border-[#DC2626]/50 rounded-md">
              <p className="text-[#DC2626] text-sm text-center font-medium">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F9FAFB] text-sm font-medium">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
                />
              </div>
              {errors.email && (
                <p className="text-[#DC2626] text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[#F9FAFB] text-sm font-medium">
                  Contraseña
                </Label>
                {/* Enlace a la futura vista de recuperación */}
                <Link 
                  href="/recuperar-password" 
                  className="text-xs text-[#9CA3AF] hover:text-[#FBBF24] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[#DC2626] text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-center">
              <RecaptchaWidget />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB] font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Validando credenciales..." : "Iniciar Sesión"}
            </Button>
          </form>

          <p className="text-center mt-6 text-[#9CA3AF]">
            ¿No tienes cuenta?{" "}
            <Link 
              href="/registro" 
              className="text-[#FBBF24] hover:text-[#FCD34D] font-medium transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}