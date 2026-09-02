/**
 * Contrato de almacenamiento de archivos (fotos, INE, PDFs de expediente).
 * Implementación actual: disco local (ver local-storage.service.ts).
 * Migrar a S3/MinIO más adelante implica escribir otra clase que cumpla
 * esta misma interfaz — la lógica de negocio nunca toca el disco directamente.
 */
export interface IStorageService {
  /**
   * Guarda un archivo bajo una carpeta lógica de entidad (p. ej. "comensales/123")
   * y regresa la ruta pública relativa para servirlo (p. ej. "/uploads/comensales/123/foto.jpg").
   */
  save(entityFolder: string, fileName: string, buffer: Buffer): Promise<string>;

  /** Elimina un archivo a partir de su ruta pública relativa. */
  delete(publicPath: string): Promise<void>;

  /** Resuelve la ruta absoluta en disco de una ruta pública relativa. */
  resolveAbsolutePath(publicPath: string): string;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
