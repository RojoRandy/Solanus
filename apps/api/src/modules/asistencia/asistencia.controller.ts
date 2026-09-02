import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { IdParamDto } from '@/common/dto/api-validator.dto';
import {
  ApiOkSchemaArrayResponse,
  ApiOkSchemaResponse,
} from '@/common/dto/response.dto';
import {
  ActualizarTurnoDto,
  ListarTurnosQueryDto,
  ObtenerTurnoQueryDto,
  TurnoResponseDto,
  TurnoResumenResponseDto,
} from './dto/turno.dto';
import {
  AsignarVoluntarioDto,
  RegistrarAsistenciaDto,
  RegistrarInsumoTurnoDto,
} from './dto/asistencia.dto';
import { ObtenerOCrearTurnoUseCase } from './usecases/obtener-o-crear-turno.usecase';
import { ListarTurnosUseCase } from './usecases/listar-turnos.usecase';
import { ActualizarTurnoUseCase } from './usecases/actualizar-turno.usecase';
import { RegistrarAsistenciaUseCase } from './usecases/registrar-asistencia.usecase';
import { EliminarAsistenciaUseCase } from './usecases/eliminar-asistencia.usecase';
import { AsignarVoluntarioTurnoUseCase } from './usecases/asignar-voluntario-turno.usecase';
import { QuitarVoluntarioTurnoUseCase } from './usecases/quitar-voluntario-turno.usecase';
import { RegistrarInsumoTurnoUseCase } from './usecases/registrar-insumo-turno.usecase';

// La pantalla de Turno de comida es el punto de servicio: los tres roles la usan
// para capturar. Deshacer una asistencia queda reservado a admin/usuario como
// salvaguarda contra errores de captura irreversibles por accidente.
const ROLES_CAPTURA = [
  UserRoles.ADMINISTRADOR,
  UserRoles.USUARIO,
  UserRoles.USUARIO_SIMPLE,
];
const ROLES_DESHACER = [UserRoles.ADMINISTRADOR, UserRoles.USUARIO];

@ApiTags('Asistencia')
@Controller('asistencia')
@Auth(...ROLES_CAPTURA)
export class AsistenciaController {
  constructor(
    @Inject(ObtenerOCrearTurnoUseCase)
    private readonly obtenerOCrearTurno: ObtenerOCrearTurnoUseCase,
    @Inject(ListarTurnosUseCase)
    private readonly listarTurnos: ListarTurnosUseCase,
    @Inject(ActualizarTurnoUseCase)
    private readonly actualizarTurno: ActualizarTurnoUseCase,
    @Inject(RegistrarAsistenciaUseCase)
    private readonly registrarAsistencia: RegistrarAsistenciaUseCase,
    @Inject(EliminarAsistenciaUseCase)
    private readonly eliminarAsistencia: EliminarAsistenciaUseCase,
    @Inject(AsignarVoluntarioTurnoUseCase)
    private readonly asignarVoluntario: AsignarVoluntarioTurnoUseCase,
    @Inject(QuitarVoluntarioTurnoUseCase)
    private readonly quitarVoluntario: QuitarVoluntarioTurnoUseCase,
    @Inject(RegistrarInsumoTurnoUseCase)
    private readonly registrarInsumo: RegistrarInsumoTurnoUseCase,
  ) {}

  @Get('turno')
  @ApiOkSchemaResponse(TurnoResponseDto)
  obtenerTurno(
    @Query() query: ObtenerTurnoQueryDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.obtenerOCrearTurno.execute({ ...query, registradoPorId });
  }

  @Get('turnos')
  @ApiOkSchemaArrayResponse(TurnoResumenResponseDto)
  findTurnos(@Query() query: ListarTurnosQueryDto) {
    return this.listarTurnos.execute(query.fecha);
  }

  @Patch('turnos/:id')
  @ApiOkSchemaResponse(TurnoResponseDto)
  updateTurno(@Param() { id }: IdParamDto, @Body() dto: ActualizarTurnoDto) {
    return this.actualizarTurno.execute({ id: Number(id), dto });
  }

  @Post('turnos/:id/asistencias')
  @ApiOkSchemaResponse(TurnoResponseDto)
  crearAsistencia(
    @Param() { id }: IdParamDto,
    @Body() dto: RegistrarAsistenciaDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarAsistencia.execute({
      turnoId: Number(id),
      ...dto,
      registradoPorId,
    });
  }

  @Delete('asistencias/:id')
  @Auth(...ROLES_DESHACER)
  removeAsistencia(@Param() { id }: IdParamDto) {
    return this.eliminarAsistencia.execute(Number(id));
  }

  @Post('turnos/:id/voluntarios')
  @ApiOkSchemaResponse(TurnoResponseDto)
  crearVoluntarioTurno(
    @Param() { id }: IdParamDto,
    @Body() dto: AsignarVoluntarioDto,
  ) {
    return this.asignarVoluntario.execute({
      turnoId: Number(id),
      voluntarioId: dto.voluntarioId,
    });
  }

  @Delete('turnos/:id/voluntarios/:voluntarioId')
  removeVoluntarioTurno(
    @Param() { id }: IdParamDto,
    @Param('voluntarioId') voluntarioId: string,
  ) {
    return this.quitarVoluntario.execute({
      turnoId: Number(id),
      voluntarioId: Number(voluntarioId),
    });
  }

  @Post('turnos/:id/insumos')
  crearInsumoTurno(
    @Param() { id }: IdParamDto,
    @Body() dto: RegistrarInsumoTurnoDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarInsumo.execute({
      turnoId: Number(id),
      ...dto,
      registradoPorId,
    });
  }
}
