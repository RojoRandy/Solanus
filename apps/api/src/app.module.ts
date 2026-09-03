import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArchivosController } from './common/archivos/archivos.controller';
import { HealthController } from './common/health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { PdfModule } from './common/pdf/pdf.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ComensalesModule } from './modules/comensales/comensales.module';
import { InventarioModule } from './modules/inventario/inventario.module';
import { BienhechoresModule } from './modules/bienhechores/bienhechores.module';
import { VoluntariosModule } from './modules/voluntarios/voluntarios.module';
import { AsistenciaModule } from './modules/asistencia/asistencia.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    PdfModule,
    AuthModule,
    UsuariosModule,
    ComensalesModule,
    InventarioModule,
    BienhechoresModule,
    VoluntariosModule,
    AsistenciaModule,
    DashboardModule,
    ReportesModule,
  ],
  controllers: [HealthController, ArchivosController],
})
export class AppModule {}
