import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import { STORAGE_SERVICE } from './storage.service.interface';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageService,
    S3StorageService,
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService, LocalStorageService, S3StorageService],
      useFactory: (
        configService: ConfigService,
        local: LocalStorageService,
        s3: S3StorageService,
      ) =>
        configService.get<string>('STORAGE_DRIVER') === 's3' ? s3 : local,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
