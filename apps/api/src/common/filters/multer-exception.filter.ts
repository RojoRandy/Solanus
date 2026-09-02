import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';
import { CommonErrors } from '../errors/common.errors';
import { HttpExceptionFilter } from './http-exception.filter';

/** Multer no lanza HttpException para "archivo demasiado grande" — lo traducimos a nuestro catálogo de errores. */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  private readonly httpFilter = new HttpExceptionFilter();

  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'LIMIT_FILE_SIZE') {
      this.httpFilter.catch(CommonErrors.Exceptions.ARCHIVO_DEMASIADO_GRANDE({ field: exception.field }), host);
      return;
    }

    response.status(400).json({
      code: 'UPLOAD_ERROR',
      description: exception.message,
      path: ctx.getRequest().url,
    });
  }
}
