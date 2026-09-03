import { Navigate, Route, Routes } from 'react-router-dom';
import { ExistenciasPage } from './ExistenciasPage';
import { ProductosPage } from './ProductosPage';
import { ProductoFormPage } from './ProductoFormPage';
import { ProductoDetallePage } from './ProductoDetallePage';
import { VarianteDetallePage } from './VarianteDetallePage';
import { RegistrarEntradaPage } from './RegistrarEntradaPage';
import { MovimientosPage } from './MovimientosPage';

export function InventarioPage() {
  return (
    <Routes>
      <Route index element={<ExistenciasPage />} />
      <Route path="productos" element={<ProductosPage />} />
      <Route path="productos/nuevo" element={<ProductoFormPage />} />
      <Route path="productos/:id" element={<ProductoDetallePage />} />
      <Route path="productos/:id/editar" element={<ProductoFormPage />} />
      <Route path="variantes/:id" element={<VarianteDetallePage />} />
      <Route path="movimientos" element={<MovimientosPage />} />
      <Route path="registrar-entrada" element={<RegistrarEntradaPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
