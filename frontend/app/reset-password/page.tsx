"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"

import { CinenovaLogo } from "@/components/cinenova-logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/authService"

// ── Funciones Helper para medir la fuerza de la contraseña ──
const checkPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return score;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;
  return score;
};

const getStrengthDetails = (score: number) => {
  switch (score) {
    case 0: return { label: "", color: "bg-transparent", width: "w-0" };
    case 1:
    case 2: return { label: "Débil", color: "bg-[#DC2626]", width: "w-1/4" }; // Rojo
    case 3: return { label: "Regular", color: "bg-[#FBBF24]", width: "w-2/4" }; // Amarillo
    case 4: return { label: "Buena", color: "bg-[#34D399]", width: "w-3/4" }; // Verde claro
    case 5: return { label: "Fuerte", color: "bg-[#10B981]", width: "w-full" }; // Verde oscuro
    default: return { label: "", color: "bg-transparent", width: "w-0" };
  }
};

// Subcomponente que maneja la lógica y captura el parámetro de la URL
function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [nuevaContrasena, setNuevaContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Si alguien entra a la ruta sin un token, bloqueamos el acceso al formulario
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[#DC2626] font-medium text-lg">Enlace no válido</p>
        <p className="text-[#9CA3AF] text-sm">
          Falta el token de seguridad en la URL. Asegúrate de haber copiado el enlace completo de tu correo.
        </p>
        <Link href="/recuperar-password" className="block text-[#FBBF24] hover:text-[#FCD34D] mt-4 text-sm font-medium transition-colors">
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validación de fuerza antes de enviar
    const strength = checkPasswordStrength(nuevaContrasena)
    if (strength < 5) {
      setError("La contraseña debe tener 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.")
      return
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setIsLoading(true)

    try {
      await authService.resetPassword(token, nuevaContrasena, confirmarContrasena)
      setIsSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "El enlace ha expirado o es inválido. Por favor, solicita uno nuevo."
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="text-[#10B981] w-16 h-16" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#F9FAFB] mb-2">¡Contraseña actualizada!</h2>
          <p className="text-[#9CA3AF] text-sm">
            Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
          </p>
        </div>
        <Link href="/login" className="block w-full">
          <Button className="w-full h-12 bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB] font-semibold text-base transition-colors">
            Ir al inicio de sesión
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#F9FAFB] mb-2 text-center">Crear nueva contraseña</h2>
        <p className="text-[#9CA3AF] text-sm text-center">
          Ingresa tu nueva contraseña para acceder a tu cuenta.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-[#DC2626]/10 border border-[#DC2626]/50 rounded-md">
          <p className="text-[#DC2626] text-sm text-center font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nuevaContrasena" className="text-[#F9FAFB] text-sm font-medium">
            Nueva Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <Input
              id="nuevaContrasena"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
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

          {/* MEDIDOR DE FUERZA DE CONTRASEÑA */}
          {nuevaContrasena.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-[#374151] rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${getStrengthDetails(checkPasswordStrength(nuevaContrasena)).color} ${getStrengthDetails(checkPasswordStrength(nuevaContrasena)).width}`}
                ></div>
              </div>
              <p className="text-xs text-[#9CA3AF] text-right">
                Seguridad: <span className="font-semibold" style={{ color: getStrengthDetails(checkPasswordStrength(nuevaContrasena)).color.replace('bg-[', '').replace(']', '').replace('bg-transparent', '#9CA3AF') }}>
                  {getStrengthDetails(checkPasswordStrength(nuevaContrasena)).label}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmarContrasena" className="text-[#F9FAFB] text-sm font-medium">
            Confirmar Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <Input
              id="confirmarContrasena"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite tu contraseña"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              disabled={isLoading}
              className="pl-10 pr-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB] font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>
    </>
  )
}

// Componente principal de la página
export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl p-8 shadow-2xl border border-[#374151]/30">
          <div className="flex justify-center mb-8">
            <CinenovaLogo size="lg" />
          </div>
          {/* Suspense es requerido por Next.js para usar useSearchParams de manera segura */}
          <Suspense fallback={<div className="text-center text-[#9CA3AF]">Cargando enlace seguro...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}