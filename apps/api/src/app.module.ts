import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(
            process.cwd(),
            configService.get<string>('UPLOADS_DIR') ?? './uploads',
          ),
          serveRoot:
            configService.get<string>('UPLOADS_PUBLIC_PATH') ?? '/uploads',
        },
      ],
    }),
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
  ],
})
export class AppModule {}
