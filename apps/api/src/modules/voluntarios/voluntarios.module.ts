import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VoluntariosController } from './voluntarios.controller';
import { CrearVoluntarioUseCase } from './usecases/crear-voluntario.usecase';
import { ListarVoluntariosUseCase } from './usecases/listar-voluntarios.usecase';
import { ObtenerVoluntarioUseCase } from './usecases/obtener-voluntario.usecase';
import { ActualizarVoluntarioUseCase } from './usecases/actualizar-voluntario.usecase';
import { EliminarVoluntarioUseCase } from './usecases/eliminar-voluntario.usecase';
import { SubirFotoVoluntarioUseCase } from './usecases/subir-foto-voluntario.usecase';

@Module({
  imports: [AuthModule],
  controllers: [VoluntariosController],
  providers: [
    CrearVoluntarioUseCase,
    ListarVoluntariosUseCase,
    ObtenerVoluntarioUseCase,
    ActualizarVoluntarioUseCase,
    EliminarVoluntarioUseCase,
    SubirFotoVoluntarioUseCase,
  ],
})
export class VoluntariosModule {}
