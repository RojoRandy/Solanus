import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { HomePage } from '@/features/dashboard/HomePage';
import { AsistenciaPage } from '@/features/asistencia/AsistenciaPage';
import { ComensalesPage } from '@/features/comensales/ComensalesPage';
import { InventarioPage } from '@/features/inventario/InventarioPage';
import { BienhechoresPage } from '@/features/bienhechores/BienhechoresPage';
import { VoluntariosPage } from '@/features/voluntarios/VoluntariosPage';
import { ReportesPage } from '@/features/reportes/ReportesPage';
import { UsuariosPage } from '@/features/usuarios/UsuariosPage';
import { ConfiguracionPage } from '@/features/configuracion/ConfiguracionPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route element={<ProtectedRoute modulo="asistencia" />}>
            <Route path="/asistencia" element={<AsistenciaPage />} />
          </Route>
          <Route element={<ProtectedRoute modulo="comensales" />}>
            <Route path="/comensales/*" element={<ComensalesPage />} />
          </Route>
          <Route element={<ProtectedRoute modulo="inventario" />}>
            <Route path="/inventario/*" element={<InventarioPage />} />
          </Route>
          <Route element={<ProtectedRoute modulo="bienhechores" />}>
            <Route path="/bienhechores/*" element={<BienhechoresPage />} />
          </Route>
          <Route element={<ProtectedRoute modulo="voluntarios" />}>
            <Route path="/voluntarios/*" element={<VoluntariosPage />} />
          </Route>
          <Route element={<ProtectedRoute modulo="reportes" />}>
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>
          <Route element={<ProtectedRoute modulo="usuarios" />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
          <Route element={<ProtectedRoute modulo="configuracion" />}>
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
