"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

import { CinenovaLogo } from "@/components/cinenova-logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/authService"

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Ingresa un correo electrónico válido")
      return
    }

    setIsLoading(true)

    try {
      await authService.forgotPassword(email)
      // Si la petición es exitosa (200 OK), mostramos la pantalla de confirmación
      setIsSuccess(true)
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Hubo un problema al procesar tu solicitud. Intenta más tarde."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl p-8 shadow-2xl border border-[#374151]/30">
          <div className="flex justify-center mb-8">
            <CinenovaLogo size="lg" />
          </div>

          {isSuccess ? (
            // ESTADO DE ÉXITO
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="text-[#10B981] w-16 h-16" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F9FAFB] mb-2">Revisa tu correo</h2>
                <p className="text-[#9CA3AF] text-sm">
                  Si existe una cuenta asociada a <span className="text-[#F9FAFB] font-medium">{email}</span>, 
                  te hemos enviado un enlace para restablecer tu contraseña.
                </p>
              </div>
              <Link href="/login" className="block w-full">
                <Button className="w-full h-12 bg-[#1F2937] hover:bg-[#374151] text-[#F9FAFB] font-semibold text-base transition-colors">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            // ESTADO INICIAL (FORMULARIO)
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#F9FAFB] mb-2 text-center">Recuperar contraseña</h2>
                <p className="text-[#9CA3AF] text-sm text-center">
                  Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecerla.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-[#DC2626]/10 border border-[#DC2626]/50 rounded-md">
                  <p className="text-[#DC2626] text-sm text-center font-medium">{error}</p>
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
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB] font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
                </Button>
              </form>

              <div className="mt-6">
                <Link 
                  href="/login" 
                  className="flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}