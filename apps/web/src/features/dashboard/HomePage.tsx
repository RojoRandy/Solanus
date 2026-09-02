import { Navigate } from 'react-router-dom';
import { puedeAcceder } from '@comedor-solanus/shared';
import { useAuth } from '@/lib/auth-context';
import { DashboardPage } from './DashboardPage';

/**
 * Landing page tras el login. El Panel general está reservado a administrador/usuario
 * (ver matriz de permisos) — un usuario_simple aterriza directo en Turno de comida,
 * que es lo único que necesita para trabajar.
 */
export function HomePage() {
  const { user } = useAuth();
  if (!user) return null;

  if (!puedeAcceder(user.rol, 'dashboard')) {
    return <Navigate to="/asistencia" replace />;
  }

  return <DashboardPage />;
}
