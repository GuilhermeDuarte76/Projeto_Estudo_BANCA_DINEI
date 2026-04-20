import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  requiredRole?: string
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />
  return <Outlet />
}
