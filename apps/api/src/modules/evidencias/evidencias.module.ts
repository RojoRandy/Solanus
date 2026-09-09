import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EvidenciasController } from './evidencias.controller';
import { ListarEvidenciasUseCase } from './usecases/listar-evidencias.usecase';
import { SubirEvidenciaUseCase } from './usecases/subir-evidencia.usecase';
import { EliminarEvidenciaUseCase } from './usecases/eliminar-evidencia.usecase';

@Module({
  imports: [AuthModule],
  controllers: [EvidenciasController],
  providers: [ListarEvidenciasUseCase, SubirEvidenciaUseCase, EliminarEvidenciaUseCase],
})
export class EvidenciasModule {}
