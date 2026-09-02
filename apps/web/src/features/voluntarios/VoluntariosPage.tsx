import { Route, Routes } from 'react-router-dom';
import { VoluntariosListView } from './VoluntariosListView';
import { VoluntarioFormView } from './VoluntarioFormView';
import { VoluntarioDetalleView } from './VoluntarioDetalleView';

export function VoluntariosPage() {
  return (
    <Routes>
      <Route index element={<VoluntariosListView />} />
      <Route path="nuevo" element={<VoluntarioFormView />} />
      <Route path=":id" element={<VoluntarioDetalleView />} />
      <Route path=":id/editar" element={<VoluntarioFormView />} />
    </Routes>
  );
}
