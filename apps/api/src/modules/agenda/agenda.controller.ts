import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { IdParamDto } from '@/common/dto/api-validator.dto';
import { ApiOkSchemaArrayResponse, ApiOkSchemaResponse } from '@/common/dto/response.dto';
import {
  ActualizarEventoAgendaDto,
  CrearEventoAgendaDto,
  EventoAgendaResponseDto,
  ListarEventosAgendaQueryDto,
} from './dto/evento-agenda.dto';
import { CrearEventoUseCase } from './usecases/crear-evento.usecase';
import { ListarEventosUseCase } from './usecases/listar-eventos.usecase';
import { ActualizarEventoUseCase } from './usecases/actualizar-evento.usecase';
import { EliminarEventoUseCase } from './usecases/eliminar-evento.usecase';

@ApiTags('Agenda')
@Controller('agenda')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
export class AgendaController {
  constructor(
    @Inject(CrearEventoUseCase)
    private readonly crearEvento: CrearEventoUseCase,
    @Inject(ListarEventosUseCase)
    private readonly listarEventos: ListarEventosUseCase,
    @Inject(ActualizarEventoUseCase)
    private readonly actualizarEvento: ActualizarEventoUseCase,
    @Inject(EliminarEventoUseCase)
    private readonly eliminarEvento: EliminarEventoUseCase,
  ) {}

  @Post()
  @ApiOkSchemaResponse(EventoAgendaResponseDto)
  create(@Body() dto: CrearEventoAgendaDto) {
    return this.crearEvento.execute(dto);
  }

  @Get()
  @ApiOkSchemaArrayResponse(EventoAgendaResponseDto)
  findAll(@Query() query: ListarEventosAgendaQueryDto) {
    return this.listarEventos.execute(query);
  }

  @Patch(':id')
  @ApiOkSchemaResponse(EventoAgendaResponseDto)
  update(@Param() { id }: IdParamDto, @Body() dto: ActualizarEventoAgendaDto) {
    return this.actualizarEvento.execute({ id: Number(id), dto });
  }

  @Delete(':id')
  remove(@Param() { id }: IdParamDto) {
    return this.eliminarEvento.execute(Number(id));
  }
}
