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
import { UserRoles } from '@/common/interfaces/enums';
import { IdParamDto } from '@/common/dto/api-validator.dto';
import {
  ApiOkSchemaArrayResponse,
  ApiOkSchemaResponse,
} from '@/common/dto/response.dto';
import {
  ActualizarBienhechorDto,
  BienhechorResponseDto,
  CrearBienhechorDto,
  ListarBienhechoresQueryDto,
} from './dto/bienhechor.dto';
import { CrearBienhechorUseCase } from './usecases/crear-bienhechor.usecase';
import { ListarBienhechoresUseCase } from './usecases/listar-bienhechores.usecase';
import { ObtenerBienhechorUseCase } from './usecases/obtener-bienhechor.usecase';
import { ActualizarBienhechorUseCase } from './usecases/actualizar-bienhechor.usecase';
import { EliminarBienhechorUseCase } from './usecases/eliminar-bienhechor.usecase';

// Listar y dar de alta un bienhechor lo necesitan también los capturistas
// (USUARIO_SIMPLE) para registrar un donativo en dinero desde la pantalla de
// Turno: elegir al donante o registrar a un donante nuevo en el momento.
// Editar y dar de baja quedan reservados a la gestión del módulo.
const ROLES_CAPTURA = [
  UserRoles.ADMINISTRADOR,
  UserRoles.USUARIO,
  UserRoles.USUARIO_SIMPLE,
];
const ROLES_GESTION = [UserRoles.ADMINISTRADOR, UserRoles.USUARIO];

@ApiTags('Bienhechores')
@Controller('bienhechores')
@Auth(...ROLES_GESTION)
export class BienhechoresController {
  constructor(
    @Inject(CrearBienhechorUseCase)
    private readonly crearBienhechor: CrearBienhechorUseCase,
    @Inject(ListarBienhechoresUseCase)
    private readonly listarBienhechores: ListarBienhechoresUseCase,
    @Inject(ObtenerBienhechorUseCase)
    private readonly obtenerBienhechor: ObtenerBienhechorUseCase,
    @Inject(ActualizarBienhechorUseCase)
    private readonly actualizarBienhechor: ActualizarBienhechorUseCase,
    @Inject(EliminarBienhechorUseCase)
    private readonly eliminarBienhechor: EliminarBienhechorUseCase,
  ) {}

  @Post()
  @Auth(...ROLES_CAPTURA)
  @ApiOkSchemaResponse(BienhechorResponseDto)
  create(@Body() dto: CrearBienhechorDto) {
    return this.crearBienhechor.execute(dto);
  }

  @Get()
  @Auth(...ROLES_CAPTURA)
  @ApiOkSchemaArrayResponse(BienhechorResponseDto)
  findAll(@Query() query: ListarBienhechoresQueryDto) {
    return this.listarBienhechores.execute(query);
  }

  @Get(':id')
  @ApiOkSchemaResponse(BienhechorResponseDto)
  findOne(@Param() { id }: IdParamDto) {
    return this.obtenerBienhechor.execute(Number(id));
  }

  @Patch(':id')
  @ApiOkSchemaResponse(BienhechorResponseDto)
  update(@Param() { id }: IdParamDto, @Body() dto: ActualizarBienhechorDto) {
    return this.actualizarBienhechor.execute({ id: Number(id), dto });
  }

  @Delete(':id')
  @Auth(UserRoles.ADMINISTRADOR)
  remove(@Param() { id }: IdParamDto) {
    return this.eliminarBienhechor.execute(Number(id));
  }
}
