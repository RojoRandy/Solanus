/**
 * Contrato de almacenamiento de archivos (fotos, INE, PDFs de expediente).
 * Implementaciones: disco local (local-storage.service.ts, dev) y S3
 * (s3-storage.service.ts, producción) — la lógica de negocio nunca toca el
 * disco ni el SDK de AWS directamente, solo esta interfaz.
 */
export interface IStorageService {
  /**
   * Guarda un archivo bajo una carpeta lógica de entidad (p. ej. "comensales/123")
   * y regresa la ruta pública relativa para servirlo (p. ej. "/uploads/comensales/123/foto.jpg").
   */
  save(entityFolder: string, fileName: string, buffer: Buffer): Promise<string>;

  /** Elimina un archivo a partir de su ruta pública relativa. */
  delete(publicPath: string): Promise<void>;

  /** Lee el contenido de un archivo a partir de su ruta pública relativa. */
  read(publicPath: string): Promise<Buffer>;

  /**
   * URL firmada de corta duración para servir el archivo directamente desde
   * el proveedor de almacenamiento (redirect 302). Devuelve `null` cuando el
   * driver no soporta URLs firmadas (almacenamiento local) — en ese caso el
   * llamador debe transmitir el archivo él mismo con `read()`.
   */
  getSignedUrl(publicPath: string): Promise<string | null>;
}

export const STORAGE_SERVICE = 'STORAGE_SERVICE';
