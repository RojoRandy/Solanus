import { Navigate, Route, Routes } from 'react-router-dom';
import { ProductosPage } from './ProductosPage';
import { ProductoFormPage } from './ProductoFormPage';
import { ProductoDetallePage } from './ProductoDetallePage';
import { RegistrarEntradaPage } from './RegistrarEntradaPage';
import { MovimientosPage } from './MovimientosPage';

export function InventarioPage() {
  return (
    <Routes>
      <Route index element={<ProductosPage />} />
      <Route path="nuevo" element={<ProductoFormPage />} />
      <Route path="movimientos" element={<MovimientosPage />} />
      <Route path="registrar-entrada" element={<RegistrarEntradaPage />} />
      <Route path=":id" element={<ProductoDetallePage />} />
      <Route path=":id/editar" element={<ProductoFormPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
