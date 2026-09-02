import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventarioController } from './inventario.controller';
import { CrearInventarioItemUseCase } from './usecases/crear-item.usecase';
import { ListarInventarioItemsUseCase } from './usecases/listar-items.usecase';
import { ObtenerInventarioItemUseCase } from './usecases/obtener-item.usecase';
import { ActualizarInventarioItemUseCase } from './usecases/actualizar-item.usecase';
import { EliminarInventarioItemUseCase } from './usecases/eliminar-item.usecase';
import { RegistrarEntradaUseCase } from './usecases/registrar-entrada.usecase';
import { RegistrarSalidaInventarioUseCase } from './usecases/registrar-salida.usecase';
import { ListarMovimientosUseCase } from './usecases/listar-movimientos.usecase';
import { ProximosAVencerUseCase } from './usecases/proximos-a-vencer.usecase';
import { StockBajoUseCase } from './usecases/stock-bajo.usecase';
import { StockItemUseCase } from './usecases/stock-item.usecase';
import {
  ListarCategoriasUseCase,
  ListarMotivosUseCase,
  ListarUbicacionesUseCase,
  ListarUnidadesUseCase,
} from './usecases/listar-catalogos.usecase';

@Module({
  imports: [AuthModule],
  controllers: [InventarioController],
  providers: [
    CrearInventarioItemUseCase,
    ListarInventarioItemsUseCase,
    ObtenerInventarioItemUseCase,
    ActualizarInventarioItemUseCase,
    EliminarInventarioItemUseCase,
    RegistrarEntradaUseCase,
    RegistrarSalidaInventarioUseCase,
    ListarMovimientosUseCase,
    ProximosAVencerUseCase,
    StockBajoUseCase,
    StockItemUseCase,
    ListarCategoriasUseCase,
    ListarUnidadesUseCase,
    ListarUbicacionesUseCase,
    ListarMotivosUseCase,
  ],
  // RegistrarSalidaInventarioUseCase se exporta para que el módulo de Asistencia (Fase 3)
  // pueda inyectarlo y descontar inventario automáticamente al servir comidas.
  exports: [RegistrarSalidaInventarioUseCase],
})
export class InventarioModule {}
