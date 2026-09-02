import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
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
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  UsuarioResponseDto,
} from './dto/usuario.dto';
import { CrearUsuarioUseCase } from './usecases/crear-usuario.usecase';
import { ListarUsuariosUseCase } from './usecases/listar-usuarios.usecase';
import { ActualizarUsuarioUseCase } from './usecases/actualizar-usuario.usecase';
import { EliminarUsuarioUseCase } from './usecases/eliminar-usuario.usecase';

@ApiTags('Usuarios')
@Controller('usuarios')
@Auth(UserRoles.ADMINISTRADOR)
export class UsuariosController {
  constructor(
    @Inject(CrearUsuarioUseCase)
    private readonly crearUsuario: CrearUsuarioUseCase,
    @Inject(ListarUsuariosUseCase)
    private readonly listarUsuarios: ListarUsuariosUseCase,
    @Inject(ActualizarUsuarioUseCase)
    private readonly actualizarUsuario: ActualizarUsuarioUseCase,
    @Inject(EliminarUsuarioUseCase)
    private readonly eliminarUsuario: EliminarUsuarioUseCase,
  ) {}

  @Post()
  @ApiOkSchemaResponse(UsuarioResponseDto)
  create(@Body() dto: CrearUsuarioDto) {
    return this.crearUsuario.execute(dto);
  }

  @Get()
  @ApiOkSchemaArrayResponse(UsuarioResponseDto)
  findAll() {
    return this.listarUsuarios.execute();
  }

  @Patch(':id')
  @ApiOkSchemaResponse(UsuarioResponseDto)
  update(@Param() { id }: IdParamDto, @Body() dto: ActualizarUsuarioDto) {
    return this.actualizarUsuario.execute({ id: Number(id), dto });
  }

  @Delete(':id')
  remove(@Param() { id }: IdParamDto) {
    return this.eliminarUsuario.execute(Number(id));
  }
}
