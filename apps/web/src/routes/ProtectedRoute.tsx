import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Modulo } from '@comedor-solanus/shared';
import { puedeAcceder } from '@comedor-solanus/shared';
import { useAuth } from '@/lib/auth-context';

/** Protege rutas por sesión y, opcionalmente, por módulo permitido al rol (§6 del brief: navegación clara por roles). */
export function ProtectedRoute({ modulo }: { modulo?: Modulo }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (modulo && !puedeAcceder(user.rol, modulo)) return <Navigate to="/" replace />;

  return <Outlet />;
}
