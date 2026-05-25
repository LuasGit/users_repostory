// frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Obtenemos las cookies que guardamos en el login
  const token = request.cookies.get('access_token')?.value
  const rawRole = request.cookies.get('user_role')?.value
  const role = rawRole ? rawRole.toLowerCase() : null

  const path = request.nextUrl.pathname

  // Definimos qué rutas requieren qué roles
  const isAdminRoute = path.startsWith('/admin')
  const isEmpleadoRoute = path.startsWith('/empleado')
  const isClienteRoute = path.startsWith('/cliente')
  const isAuthRoute = path === '/login' || path === '/registro' || path === '/recuperar-password' || path === '/reset-password'

  // 1. Si no hay token y quiere entrar a rutas privadas, lo mandamos al login
  if (!token && (isAdminRoute || isEmpleadoRoute || isClienteRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Si hay token, controlamos el acceso por roles
  if (token && role) {
    // Evitar que el cliente entre al panel de admin o empleado
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (isEmpleadoRoute && role !== 'empleado' && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    if (isClienteRoute && role !== 'cliente') {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
    
    // 3. Si ya está logueado y va al login, lo mandamos a su panel
    if (isAuthRoute) {
      return NextResponse.redirect(new URL(`/${role}`, request.url))
    }
  }

  return NextResponse.next()
}

// Configuramos en qué rutas se ejecutará este middleware
export const config = {
  matcher: [
    '/admin/:path*', 
    '/empleado/:path*', 
    '/cliente/:path*', 
    '/login', 
    '/registro',
    '/recuperar-password',
    '/reset-password'
  ]
}