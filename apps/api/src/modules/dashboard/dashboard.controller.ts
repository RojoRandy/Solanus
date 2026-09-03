import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { ApiOkSchemaResponse } from '@/common/dto/response.dto';
import {
  ResumenDashboardQueryDto,
  ResumenDashboardResponseDto,
} from './dto/dashboard.dto';
import { ObtenerResumenDashboardUseCase } from './usecases/obtener-resumen-dashboard.usecase';

@ApiTags('Dashboard')
@Controller('dashboard')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
export class DashboardController {
  constructor(
    @Inject(ObtenerResumenDashboardUseCase)
    private readonly obtenerResumen: ObtenerResumenDashboardUseCase,
  ) {}

  @Get('resumen')
  @ApiOkSchemaResponse(ResumenDashboardResponseDto)
  resumen(@Query() query: ResumenDashboardQueryDto) {
    return this.obtenerResumen.execute(query.diasVencimiento);
  }
}
