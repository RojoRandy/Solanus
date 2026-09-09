import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReportesController } from './reportes.controller';
import { ReporteAsistenciaUseCase } from './usecases/reporte-asistencia.usecase';
import { ReporteInventarioUseCase } from './usecases/reporte-inventario.usecase';
import { ReporteDonativosUseCase } from './usecases/reporte-donativos.usecase';
import { ReporteMensualPdfUseCase } from './usecases/reporte-mensual-pdf.usecase';

@Module({
  imports: [AuthModule],
  controllers: [ReportesController],
  providers: [
    ReporteAsistenciaUseCase,
    ReporteInventarioUseCase,
    ReporteDonativosUseCase,
    ReporteMensualPdfUseCase,
  ],
})
export class ReportesModule {}
