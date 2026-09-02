import { Navigate, Route, Routes } from 'react-router-dom';
import { BienhechoresListPage } from './BienhechoresListPage';
import { BienhechorFormPage } from './BienhechorFormPage';
import { BienhechorDetallePage } from './BienhechorDetallePage';

export function BienhechoresPage() {
  return (
    <Routes>
      <Route index element={<BienhechoresListPage />} />
      <Route path="nuevo" element={<BienhechorFormPage />} />
      <Route path=":id" element={<BienhechorDetallePage />} />
      <Route path=":id/editar" element={<BienhechorFormPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
