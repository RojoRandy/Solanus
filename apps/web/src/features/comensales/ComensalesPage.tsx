import { Route, Routes } from 'react-router-dom';
import { ComensalesListView } from './ComensalesListView';
import { ComensalFormView } from './ComensalFormView';
import { ComensalDetalleView } from './ComensalDetalleView';

export function ComensalesPage() {
  return (
    <Routes>
      <Route index element={<ComensalesListView />} />
      <Route path="nuevo" element={<ComensalFormView />} />
      <Route path=":id" element={<ComensalDetalleView />} />
      <Route path=":id/editar" element={<ComensalFormView />} />
    </Routes>
  );
}
