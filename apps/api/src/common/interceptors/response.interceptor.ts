import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { SchemaResponse } from '../dto/response.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  SchemaResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SchemaResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        return new SchemaResponse<T>(data);
      }),
    );
  }
}
