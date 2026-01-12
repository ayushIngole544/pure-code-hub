import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard
    const dashboardPaths: Record<UserRole, string> = {
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      professional: '/professional/dashboard',
    };
    return <Navigate to={dashboardPaths[user.role]} replace />;
  }

  return <>{children}</>;
}
