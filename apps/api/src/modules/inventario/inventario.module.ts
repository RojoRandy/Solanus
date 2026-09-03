import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventarioController } from './inventario.controller';
import { CrearProductoUseCase } from './usecases/crear-producto.usecase';
import { ListarProductosUseCase } from './usecases/listar-productos.usecase';
import { ObtenerProductoUseCase } from './usecases/obtener-producto.usecase';
import { ActualizarProductoUseCase } from './usecases/actualizar-producto.usecase';
import { EliminarProductoUseCase } from './usecases/eliminar-producto.usecase';
import { CrearVarianteUseCase } from './usecases/crear-variante.usecase';
import { ListarVariantesUseCase } from './usecases/listar-variantes.usecase';
import { ObtenerVarianteUseCase } from './usecases/obtener-variante.usecase';
import { ActualizarVarianteUseCase } from './usecases/actualizar-variante.usecase';
import { RegistrarEntradaUseCase } from './usecases/registrar-entrada.usecase';
import { RegistrarDonativoUseCase } from './usecases/registrar-donativo.usecase';
import { RegistrarSalidaInventarioUseCase } from './usecases/registrar-salida.usecase';
import { RegistrarAjusteUseCase } from './usecases/registrar-ajuste.usecase';
import { ListarMovimientosUseCase } from './usecases/listar-movimientos.usecase';
import { ActualizarMovimientoUseCase } from './usecases/actualizar-movimiento.usecase';
import { ProximosAVencerUseCase } from './usecases/proximos-a-vencer.usecase';
import { StockBajoUseCase } from './usecases/stock-bajo.usecase';
import { StockVarianteUseCase } from './usecases/stock-variante.usecase';
import { ListarLotesVarianteUseCase } from './usecases/listar-lotes-variante.usecase';
import {
  ListarCategoriasUseCase,
  ListarMotivosUseCase,
  ListarUnidadesUseCase,
} from './usecases/listar-catalogos.usecase';
import {
  ActualizarCategoriaUseCase,
  ActualizarUnidadUseCase,
  CrearCategoriaUseCase,
  CrearUnidadUseCase,
  EliminarCategoriaUseCase,
  EliminarUnidadUseCase,
} from './usecases/crud-catalogos.usecase';

@Module({
  imports: [AuthModule],
  controllers: [InventarioController],
  providers: [
    CrearProductoUseCase,
    ListarProductosUseCase,
    ObtenerProductoUseCase,
    ActualizarProductoUseCase,
    EliminarProductoUseCase,
    CrearVarianteUseCase,
    ListarVariantesUseCase,
    ObtenerVarianteUseCase,
    ActualizarVarianteUseCase,
    RegistrarEntradaUseCase,
    RegistrarDonativoUseCase,
    RegistrarSalidaInventarioUseCase,
    RegistrarAjusteUseCase,
    ListarMovimientosUseCase,
    ActualizarMovimientoUseCase,
    ProximosAVencerUseCase,
    StockBajoUseCase,
    StockVarianteUseCase,
    ListarLotesVarianteUseCase,
    ListarCategoriasUseCase,
    ListarUnidadesUseCase,
    ListarMotivosUseCase,
    CrearUnidadUseCase,
    ActualizarUnidadUseCase,
    EliminarUnidadUseCase,
    CrearCategoriaUseCase,
    ActualizarCategoriaUseCase,
    EliminarCategoriaUseCase,
  ],
  // RegistrarSalidaInventarioUseCase: lo reutiliza Asistencia para descontar al servir comidas.
  // ListarVariantesUseCase: lo reutiliza Asistencia para poblar el selector de insumos.
  // ProximosAVencerUseCase / StockBajoUseCase: los reutiliza Dashboard para sus indicadores.
  exports: [
    RegistrarSalidaInventarioUseCase,
    ListarVariantesUseCase,
    ProximosAVencerUseCase,
    StockBajoUseCase,
  ],
})
export class InventarioModule {}
