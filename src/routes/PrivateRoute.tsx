import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../hooks/reduxHooks'

type PrivateRouteProps = {
  children: ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const authToken = useAppSelector((s) => s.auth.authToken)
  const location = useLocation()

  if (!authToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
