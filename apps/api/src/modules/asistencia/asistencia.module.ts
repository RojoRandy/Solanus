import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventarioModule } from '../inventario/inventario.module';
import { AsistenciaController } from './asistencia.controller';
import { ObtenerOCrearTurnoUseCase } from './usecases/obtener-o-crear-turno.usecase';
import { ListarTurnosUseCase } from './usecases/listar-turnos.usecase';
import { ActualizarTurnoUseCase } from './usecases/actualizar-turno.usecase';
import { RegistrarAsistenciaUseCase } from './usecases/registrar-asistencia.usecase';
import { EliminarAsistenciaUseCase } from './usecases/eliminar-asistencia.usecase';
import { AsignarVoluntarioTurnoUseCase } from './usecases/asignar-voluntario-turno.usecase';
import { QuitarVoluntarioTurnoUseCase } from './usecases/quitar-voluntario-turno.usecase';
import { RegistrarInsumoTurnoUseCase } from './usecases/registrar-insumo-turno.usecase';

@Module({
  // AuthModule: @Auth() requiere PassportModule disponible aquí.
  // InventarioModule: exporta RegistrarSalidaInventarioUseCase, que
  // RegistrarInsumoTurnoUseCase reutiliza para el descuento automático.
  imports: [AuthModule, InventarioModule],
  controllers: [AsistenciaController],
  providers: [
    ObtenerOCrearTurnoUseCase,
    ListarTurnosUseCase,
    ActualizarTurnoUseCase,
    RegistrarAsistenciaUseCase,
    EliminarAsistenciaUseCase,
    AsignarVoluntarioTurnoUseCase,
    QuitarVoluntarioTurnoUseCase,
    RegistrarInsumoTurnoUseCase,
  ],
})
export class AsistenciaModule {}
