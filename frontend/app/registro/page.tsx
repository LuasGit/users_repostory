"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { CinenovaLogo } from "@/components/cinenova-logo";
import { RecaptchaWidget } from "@/components/recaptcha-widget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // <-- NUEVO IMPORT
import { authService } from "@/services/authService"; // <-- NUEVO IMPORT

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

// Mapeo de colores y textos según el score
const getStrengthDetails = (score: number) => {
  switch (score) {
    case 0: return { label: "", color: "bg-transparent", width: "w-0" };
    case 1:
    case 2: return { label: "Débil", color: "bg-[#DC2626]", width: "w-1/4" }; // Rojo
    case 3: return { label: "Regular", color: "bg-[#FBBF24]", width: "w-2/4" }; // Amarillo/Dorado
    case 4: return { label: "Buena", color: "bg-[#34D399]", width: "w-3/4" }; // Verde claro
    case 5: return { label: "Fuerte", color: "bg-[#10B981]", width: "w-full" }; // Verde oscuro
    default: return { label: "", color: "bg-transparent", width: "w-0" };
  }
};

export default function RegistroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    const newErrors: Record<string, string> = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = "El nombre es requerido";
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "El apellido es requerido";
    }

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else {
      const strength = checkPasswordStrength(formData.password)
      if (strength < 5) {
        newErrors.password = "La contraseña debe tener 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial."
      }
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Llamada real a la API
        await authService.register({
          nombre: formData.nombres,
          apellido: formData.apellidos,
          correo: formData.email,
          contrasena: formData.password,
          confirmar_contrasena: formData.confirmPassword,
        });

        // Si el registro es exitoso, lo enviamos al login
        router.push("/login");
      } catch (err: any) {
        setGlobalError(
          err.response?.data?.detail || "Error al registrar la cuenta.",
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-[#111827] rounded-xl p-8 shadow-2xl border border-[#374151]/30">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <CinenovaLogo size="lg" />
          </div>

          <h2 className="text-center text-[#F9FAFB] text-xl font-semibold mb-6">
            Crear una cuenta
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombres Input */}
            <div className="space-y-2">
              <Label
                htmlFor="nombres"
                className="text-[#F9FAFB] text-sm font-medium"
              >
                Nombres
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  size={18}
                />
                <Input
                  id="nombres"
                  type="text"
                  placeholder="Ingresa tus nombres"
                  value={formData.nombres}
                  onChange={(e) => handleChange("nombres", e.target.value)}
                  className="pl-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
                />
              </div>
              {errors.nombres && (
                <p className="text-[#DC2626] text-sm">{errors.nombres}</p>
              )}
            </div>

            {/* Apellidos Input */}
            <div className="space-y-2">
              <Label
                htmlFor="apellidos"
                className="text-[#F9FAFB] text-sm font-medium"
              >
                Apellidos
              </Label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  size={18}
                />
                <Input
                  id="apellidos"
                  type="text"
                  placeholder="Ingresa tus apellidos"
                  value={formData.apellidos}
                  onChange={(e) => handleChange("apellidos", e.target.value)}
                  className="pl-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
                />
              </div>
              {errors.apellidos && (
                <p className="text-[#DC2626] text-sm">{errors.apellidos}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[#F9FAFB] text-sm font-medium"
              >
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  size={18}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
                />
              </div>
              {errors.email && (
                <p className="text-[#DC2626] text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F9FAFB] text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10 pr-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* MEDIDOR DE FUERZA DE CONTRASEÑA */}
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-[#374151] rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthDetails(checkPasswordStrength(formData.password)).color} ${getStrengthDetails(checkPasswordStrength(formData.password)).width}`}
                    ></div>
                  </div>
                  <p className="text-xs text-[#9CA3AF] text-right">
                    Seguridad: <span className="font-semibold" style={{ color: getStrengthDetails(checkPasswordStrength(formData.password)).color.replace('bg-[', '').replace(']', '').replace('bg-transparent', '#9CA3AF') }}>
                      {getStrengthDetails(checkPasswordStrength(formData.password)).label}
                    </span>
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-[#DC2626] text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[#F9FAFB] text-sm font-medium"
              >
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  size={18}
                />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="pl-10 pr-10 bg-[#1F2937] border-[#374151] text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:border-[#DC2626] focus:ring-[#DC2626]/20 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[#DC2626] text-sm">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* reCAPTCHA Widget */}
            <div className="flex justify-center pt-2">
              <RecaptchaWidget />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB] font-semibold text-base transition-colors"
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-[#9CA3AF]">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-[#FBBF24] hover:text-[#FCD34D] font-medium transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
