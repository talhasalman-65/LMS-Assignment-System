import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export default function ProtectedRoute({ children, roles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isCheckingSession = useAuthStore((s) => s.isCheckingSession);
  const location = useLocation();

  if (isCheckingSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    const role = user?.role;
    const redirect = `/app/${role}/dashboard`;
    return <Navigate to={redirect} replace />;
  }

  return children;
}
