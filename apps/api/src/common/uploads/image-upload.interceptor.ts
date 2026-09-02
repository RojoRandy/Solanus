import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CommonErrors } from '../errors/common.errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Interceptor de subida de una sola imagen (foto, INE) en memoria — el buffer
 * resultante se pasa tal cual a StorageService.save(), que decide dónde vive
 * físicamente. No usar diskStorage aquí: mezclaría la política de almacenamiento
 * de multer con la de StorageService.
 */
export function ImageUploadInterceptor(fieldName: string, maxSizeMb: number = DEFAULT_MAX_SIZE_MB) {
  return FileInterceptor(fieldName, {
    storage: memoryStorage(),
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        callback(CommonErrors.Exceptions.TIPO_ARCHIVO_NO_PERMITIDO({ mimetype: file.mimetype }), false);
        return;
      }
      callback(null, true);
    },
  });
}

export function extensionFromMimeType(mimetype: string): string {
  switch (mimetype) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}
