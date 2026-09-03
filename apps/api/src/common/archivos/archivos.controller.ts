import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  IStorageService,
  STORAGE_SERVICE,
} from '../storage/storage.service.interface';

const MIME_POR_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * Sirve los archivos subidos (fotos, INE) bajo /uploads/*, fuera del
 * prefijo /api (ver main.ts) porque el frontend construye estas URLs
 * colgando de la raíz del backend, no de /api.
 *
 * Con el driver S3, redirige a una URL firmada de corta duración — el
 * bucket no expone lectura pública. Con el driver local, transmite el
 * archivo directamente. En ambos casos la ruta pública ("/uploads/...")
 * es la misma para el cliente; storage.service decide de dónde viene.
 */
@Controller('uploads')
export class ArchivosController {
  constructor(
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
  ) {}

  @Get('*ruta')
  async servirArchivo(@Req() req: Request, @Res() res: Response) {
    const rutaPublica = req.path;

    const signedUrl = await this.storage.getSignedUrl(rutaPublica);
    if (signedUrl) {
      res.redirect(302, signedUrl);
      return;
    }

    const buffer = await this.storage.read(rutaPublica);
    const extension = rutaPublica.slice(rutaPublica.lastIndexOf('.')).toLowerCase();
    res.setHeader('Content-Type', MIME_POR_EXTENSION[extension] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(buffer);
  }
}
