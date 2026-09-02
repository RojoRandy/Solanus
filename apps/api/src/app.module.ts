import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

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
    AuthModule,
    UsuariosModule,
  ],
})
export class AppModule {}
