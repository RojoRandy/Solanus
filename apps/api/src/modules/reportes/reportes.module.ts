import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReportesController } from './reportes.controller';
import { ReporteAsistenciaUseCase } from './usecases/reporte-asistencia.usecase';
import { ReporteInventarioUseCase } from './usecases/reporte-inventario.usecase';
import { ReporteDonativosUseCase } from './usecases/reporte-donativos.usecase';

@Module({
  imports: [AuthModule],
  controllers: [ReportesController],
  providers: [
    ReporteAsistenciaUseCase,
    ReporteInventarioUseCase,
    ReporteDonativosUseCase,
  ],
})
export class ReportesModule {}
