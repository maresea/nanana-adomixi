import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, Role } from '../../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if not authorized
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

