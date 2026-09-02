import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BienhechoresController } from './bienhechores.controller';
import { CrearBienhechorUseCase } from './usecases/crear-bienhechor.usecase';
import { ListarBienhechoresUseCase } from './usecases/listar-bienhechores.usecase';
import { ObtenerBienhechorUseCase } from './usecases/obtener-bienhechor.usecase';
import { ActualizarBienhechorUseCase } from './usecases/actualizar-bienhechor.usecase';
import { EliminarBienhechorUseCase } from './usecases/eliminar-bienhechor.usecase';

@Module({
  imports: [AuthModule],
  controllers: [BienhechoresController],
  providers: [
    CrearBienhechorUseCase,
    ListarBienhechoresUseCase,
    ObtenerBienhechorUseCase,
    ActualizarBienhechorUseCase,
    EliminarBienhechorUseCase,
  ],
})
export class BienhechoresModule {}
