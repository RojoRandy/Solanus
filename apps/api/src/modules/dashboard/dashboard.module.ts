import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventarioModule } from '../inventario/inventario.module';
import { DashboardController } from './dashboard.controller';
import { ObtenerResumenDashboardUseCase } from './usecases/obtener-resumen-dashboard.usecase';

@Module({
  imports: [AuthModule, InventarioModule],
  controllers: [DashboardController],
  providers: [ObtenerResumenDashboardUseCase],
})
export class DashboardModule {}
