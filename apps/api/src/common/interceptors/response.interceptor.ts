import { CallHandler, ExecutionContext, NestInterceptor, StreamableFile } from '@nestjs/common';
import { SchemaResponse } from '../dto/response.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Envuelve toda respuesta en { data, success, message } — excepto archivos
 * binarios (PDF del expediente, reportes descargables), que deben llegar al
 * cliente tal cual. Un endpoint de descarga responde con un `StreamableFile`
 * o `Buffer` para quedar exento.
 */
export class ApiResponseInterceptor<T> implements NestInterceptor<T, SchemaResponse<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<SchemaResponse<T> | T> {
    return next.handle().pipe(
      map((data: T) => {
        if (data instanceof StreamableFile || Buffer.isBuffer(data)) {
          return data;
        }
        return new SchemaResponse<T>(data);
      }),
    );
  }
}
