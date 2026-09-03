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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { IdParamDto } from '@/common/dto/api-validator.dto';
import {
  ApiOkSchemaArrayResponse,
  ApiOkSchemaResponse,
} from '@/common/dto/response.dto';
import { ImageUploadInterceptor } from '@/common/uploads/image-upload.interceptor';
import {
  ActualizarVoluntarioDto,
  CrearVoluntarioDto,
  ListarVoluntariosQueryDto,
  VoluntarioResponseDto,
} from './dto/voluntario.dto';
import { CrearVoluntarioUseCase } from './usecases/crear-voluntario.usecase';
import { ListarVoluntariosUseCase } from './usecases/listar-voluntarios.usecase';
import { ObtenerVoluntarioUseCase } from './usecases/obtener-voluntario.usecase';
import { ActualizarVoluntarioUseCase } from './usecases/actualizar-voluntario.usecase';
import { EliminarVoluntarioUseCase } from './usecases/eliminar-voluntario.usecase';
import { SubirFotoVoluntarioUseCase } from './usecases/subir-foto-voluntario.usecase';

@ApiTags('Voluntarios')
@Controller('voluntarios')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
export class VoluntariosController {
  constructor(
    @Inject(CrearVoluntarioUseCase)
    private readonly crearVoluntario: CrearVoluntarioUseCase,
    @Inject(ListarVoluntariosUseCase)
    private readonly listarVoluntarios: ListarVoluntariosUseCase,
    @Inject(ObtenerVoluntarioUseCase)
    private readonly obtenerVoluntario: ObtenerVoluntarioUseCase,
    @Inject(ActualizarVoluntarioUseCase)
    private readonly actualizarVoluntario: ActualizarVoluntarioUseCase,
    @Inject(EliminarVoluntarioUseCase)
    private readonly eliminarVoluntario: EliminarVoluntarioUseCase,
    @Inject(SubirFotoVoluntarioUseCase)
    private readonly subirFotoVoluntario: SubirFotoVoluntarioUseCase,
  ) {}

  @Post()
  @ApiOkSchemaResponse(VoluntarioResponseDto)
  create(@Body() dto: CrearVoluntarioDto) {
    return this.crearVoluntario.execute(dto);
  }

  // Abierto también a USUARIO_SIMPLE: la pantalla de Turno de comida usa este
  // listado para asignar voluntarios al turno, y ese rol sí puede capturar ahí.
  @Get()
  @Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO, UserRoles.USUARIO_SIMPLE)
  @ApiOkSchemaArrayResponse(VoluntarioResponseDto)
  findAll(@Query() query: ListarVoluntariosQueryDto) {
    return this.listarVoluntarios.execute(query);
  }

  @Get(':id')
  @ApiOkSchemaResponse(VoluntarioResponseDto)
  findOne(@Param() { id }: IdParamDto) {
    return this.obtenerVoluntario.execute(Number(id));
  }

  @Patch(':id')
  @ApiOkSchemaResponse(VoluntarioResponseDto)
  update(@Param() { id }: IdParamDto, @Body() dto: ActualizarVoluntarioDto) {
    return this.actualizarVoluntario.execute({ id: Number(id), dto });
  }

  @Post(':id/foto')
  @ApiConsumes('multipart/form-data')
  @ApiOkSchemaResponse(VoluntarioResponseDto)
  @UseInterceptors(ImageUploadInterceptor('foto'))
  subirFoto(
    @Param() { id }: IdParamDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subirFotoVoluntario.execute({ id: Number(id), file });
  }

  @Delete(':id')
  @Auth(UserRoles.ADMINISTRADOR)
  remove(@Param() { id }: IdParamDto) {
    return this.eliminarVoluntario.execute(Number(id));
  }
}
