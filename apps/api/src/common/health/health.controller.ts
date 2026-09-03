import { Controller, Get } from '@nestjs/common';

/**
 * Endpoint sin autenticación para el healthcheck de la plataforma de
 * despliegue (Railway). No hay guard global en la app (ver auth.decorator.ts:
 * las rutas requieren @Auth() explícito), así que basta con no decorarlo.
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
