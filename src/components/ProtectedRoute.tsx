import { Navigate } from 'react-router-dom'
import type { Rol } from '../types'
import { useAuth } from '../hooks/useAuth'

interface Props {
  children: React.ReactNode
  rolRequerido?: Rol
}

export default function ProtectedRoute({ children, rolRequerido }: Props) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">
        Cargando…
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 font-semibold text-lg">
          No autorizado — esta sección es solo para {rolRequerido}s.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
