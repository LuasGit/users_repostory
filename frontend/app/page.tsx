import Link from "next/link"
import { Film, Shield, UserCircle, Briefcase } from "lucide-react"
import { CinenovaLogo } from "@/components/cinenova-logo"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#020617] flex flex-col">
      {/* Header */}
      <header className="bg-[#111827] border-b border-[#374151]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <CinenovaLogo size="md" />
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937]">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button className="bg-[#DC2626] hover:bg-[#EF4444] text-[#F9FAFB]">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <CinenovaLogo size="lg" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#F9FAFB] mb-6 text-balance">
            Tu experiencia de cine{" "}
            <span className="text-[#DC2626]">premium</span>
          </h1>
          <p className="text-xl text-[#9CA3AF] mb-12 max-w-2xl mx-auto text-pretty">
            Descubre las mejores películas, reserva tus boletos y disfruta de una experiencia cinematográfica inolvidable
          </p>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Link 
              href="/cliente"
              className="bg-[#111827] rounded-xl p-8 border border-[#374151]/30 hover:border-[#DC2626]/50 transition-all group"
            >
              <div className="p-4 bg-[#DC2626]/10 rounded-full w-fit mx-auto mb-4 group-hover:bg-[#DC2626]/20 transition-colors">
                <UserCircle className="text-[#DC2626]" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#F9FAFB] mb-2">Portal Cliente</h3>
              <p className="text-[#9CA3AF] text-sm">Explora la cartelera y reserva tus boletos</p>
            </Link>

            <Link 
              href="/empleado"
              className="bg-[#111827] rounded-xl p-8 border border-[#374151]/30 hover:border-[#FBBF24]/50 transition-all group"
            >
              <div className="p-4 bg-[#FBBF24]/10 rounded-full w-fit mx-auto mb-4 group-hover:bg-[#FBBF24]/20 transition-colors">
                <Briefcase className="text-[#FBBF24]" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#F9FAFB] mb-2">Portal Empleado</h3>
              <p className="text-[#9CA3AF] text-sm">Gestiona la cartelera y ventas del día</p>
            </Link>

            <Link 
              href="/admin"
              className="bg-[#111827] rounded-xl p-8 border border-[#374151]/30 hover:border-[#9CA3AF]/50 transition-all group"
            >
              <div className="p-4 bg-[#9CA3AF]/10 rounded-full w-fit mx-auto mb-4 group-hover:bg-[#9CA3AF]/20 transition-colors">
                <Shield className="text-[#9CA3AF]" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-[#F9FAFB] mb-2">Panel Admin</h3>
              <p className="text-[#9CA3AF] text-sm">Administra usuarios y configuraciones</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] border-t border-[#374151]/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film className="text-[#DC2626]" size={20} />
              <span className="text-[#9CA3AF] text-sm">© 2024 CINENOVA. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-[#9CA3AF] text-sm hover:text-[#F9FAFB] transition-colors">
                Términos
              </Link>
              <Link href="#" className="text-[#9CA3AF] text-sm hover:text-[#F9FAFB] transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-[#9CA3AF] text-sm hover:text-[#F9FAFB] transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
