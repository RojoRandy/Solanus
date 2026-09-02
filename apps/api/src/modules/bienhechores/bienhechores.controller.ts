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

@ApiTags('Bienhechores')
@Controller('bienhechores')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
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
  @ApiOkSchemaResponse(BienhechorResponseDto)
  create(@Body() dto: CrearBienhechorDto) {
    return this.crearBienhechor.execute(dto);
  }

  @Get()
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
