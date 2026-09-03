import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CommonErrors } from '../errors/common.errors';
import { IStorageService } from './storage.service.interface';

const MIME_POR_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

/**
 * Implementación de IStorageService sobre un bucket S3 privado. La ruta
 * pública que la app conoce (p. ej. "/uploads/comensales/12/foto.jpg") es
 * siempre la misma; aquí solo se traduce a/desde la clave del objeto
 * ("comensales/12/foto.jpg") y a URLs firmadas de corta duración — el bucket
 * nunca expone lectura pública.
 */
@Injectable()
export class S3StorageService implements IStorageService {
  private clientInstance: S3Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Todo se resuelve perezosamente (aquí y en los getters de abajo) para que
   * este provider pueda instanciarse sin lanzar cuando STORAGE_DRIVER=local
   * y las variables de S3 no existen — StorageModule registra ambos drivers
   * y elige uno en runtime, así que el constructor no puede fallar.
   */
  private get client(): S3Client {
    if (!this.clientInstance) {
      this.clientInstance = new S3Client({ region: this.region });
    }
    return this.clientInstance;
  }

  private get bucket(): string {
    return this.configService.getOrThrow<string>('S3_BUCKET');
  }

  private get region(): string {
    return this.configService.getOrThrow<string>('S3_REGION');
  }

  private get publicPath(): string {
    return this.configService.get<string>('UPLOADS_PUBLIC_PATH') ?? '/uploads';
  }

  private get urlTtlSeconds(): number {
    return Number(this.configService.get<string>('S3_URL_TTL') ?? 900);
  }

  async save(
    entityFolder: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<string> {
    const key = this.keyFromFolder(entityFolder, fileName);
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: this.mimeFromKey(key),
        }),
      );
      return this.publicPathFromKey(key);
    } catch (error) {
      throw CommonErrors.Exceptions.ERROR_UPLOADING_FILE(error);
    }
  }

  async delete(publicPath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: this.keyFromPublicPath(publicPath),
        }),
      );
    } catch (error) {
      throw CommonErrors.Exceptions.ERROR_DELETING_FILE(error);
    }
  }

  async read(publicPath: string): Promise<Buffer> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: this.keyFromPublicPath(publicPath),
        }),
      );
      const body = await response.Body?.transformToByteArray();
      if (!body) {
        throw CommonErrors.Exceptions.ARCHIVO_NO_ENCONTRADO({ publicPath });
      }
      return Buffer.from(body);
    } catch (error) {
      if ((error as { name?: string }).name === 'NoSuchKey') {
        throw CommonErrors.Exceptions.ARCHIVO_NO_ENCONTRADO({ publicPath });
      }
      throw CommonErrors.Exceptions.ERROR_READING_FILE(error);
    }
  }

  async getSignedUrl(publicPath: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: this.keyFromPublicPath(publicPath),
    });
    return getSignedUrl(this.client, command, {
      expiresIn: this.urlTtlSeconds,
    });
  }

  private keyFromFolder(entityFolder: string, fileName: string): string {
    return [entityFolder, fileName].join('/');
  }

  private keyFromPublicPath(publicPath: string): string {
    const relative = publicPath.startsWith(this.publicPath)
      ? publicPath.slice(this.publicPath.length)
      : publicPath;
    return relative.replace(/^\/+/, '');
  }

  private publicPathFromKey(key: string): string {
    return `${this.publicPath}/${key}`;
  }

  private mimeFromKey(key: string): string {
    const extension = key.slice(key.lastIndexOf('.')).toLowerCase();
    return MIME_POR_EXTENSION[extension] ?? 'application/octet-stream';
  }
}
