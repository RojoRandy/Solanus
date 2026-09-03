import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { ApiOkSchemaResponse } from '@/common/dto/response.dto';
import {
  RangoFechaQueryDto,
  ReporteAsistenciaResponseDto,
  ReporteDonativosResponseDto,
  ReporteInventarioResponseDto,
} from './dto/reportes.dto';
import { ReporteAsistenciaUseCase } from './usecases/reporte-asistencia.usecase';
import { ReporteInventarioUseCase } from './usecases/reporte-inventario.usecase';
import { ReporteDonativosUseCase } from './usecases/reporte-donativos.usecase';

@ApiTags('Reportes')
@Controller('reportes')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
export class ReportesController {
  constructor(
    @Inject(ReporteAsistenciaUseCase)
    private readonly reporteAsistencia: ReporteAsistenciaUseCase,
    @Inject(ReporteInventarioUseCase)
    private readonly reporteInventario: ReporteInventarioUseCase,
    @Inject(ReporteDonativosUseCase)
    private readonly reporteDonativos: ReporteDonativosUseCase,
  ) {}

  @Get('asistencia')
  @ApiOkSchemaResponse(ReporteAsistenciaResponseDto)
  asistencia(@Query() query: RangoFechaQueryDto) {
    return this.reporteAsistencia.execute(query);
  }

  @Get('inventario')
  @ApiOkSchemaResponse(ReporteInventarioResponseDto)
  inventario(@Query() query: RangoFechaQueryDto) {
    return this.reporteInventario.execute(query);
  }

  @Get('donativos')
  @ApiOkSchemaResponse(ReporteDonativosResponseDto)
  donativos(@Query() query: RangoFechaQueryDto) {
    return this.reporteDonativos.execute(query);
  }
}
