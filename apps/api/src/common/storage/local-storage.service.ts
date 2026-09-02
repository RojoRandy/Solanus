import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { CommonErrors } from '../errors/common.errors';
import { IStorageService } from './storage.service.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadsDir: string;
  private readonly publicPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadsDir = path.resolve(
      this.configService.get<string>('UPLOADS_DIR') ?? './uploads',
    );
    this.publicPath =
      this.configService.get<string>('UPLOADS_PUBLIC_PATH') ?? '/uploads';
  }

  async save(
    entityFolder: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<string> {
    try {
      const targetDir = path.join(this.uploadsDir, entityFolder);
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(path.join(targetDir, fileName), buffer);
      return path.posix.join(this.publicPath, entityFolder, fileName);
    } catch (error) {
      throw CommonErrors.Exceptions.ERROR_UPLOADING_FILE(error);
    }
  }

  async delete(publicPath: string): Promise<void> {
    try {
      const absolutePath = this.resolveAbsolutePath(publicPath);
      await fs.unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw CommonErrors.Exceptions.ERROR_DELETING_FILE(error);
    }
  }

  resolveAbsolutePath(publicPath: string): string {
    const relative = publicPath.startsWith(this.publicPath)
      ? publicPath.slice(this.publicPath.length)
      : publicPath;
    return path.join(this.uploadsDir, relative);
  }
}
