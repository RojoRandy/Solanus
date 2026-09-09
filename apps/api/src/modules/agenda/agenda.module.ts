import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AgendaController } from './agenda.controller';
import { CrearEventoUseCase } from './usecases/crear-evento.usecase';
import { ListarEventosUseCase } from './usecases/listar-eventos.usecase';
import { ActualizarEventoUseCase } from './usecases/actualizar-evento.usecase';
import { EliminarEventoUseCase } from './usecases/eliminar-evento.usecase';

@Module({
  imports: [AuthModule],
  controllers: [AgendaController],
  providers: [
    CrearEventoUseCase,
    ListarEventosUseCase,
    ActualizarEventoUseCase,
    EliminarEventoUseCase,
  ],
})
export class AgendaModule {}
