import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { IdParamDto } from '@/common/dto/api-validator.dto';
import { ApiOkSchemaResponse } from '@/common/dto/response.dto';
import {
  DonativoDineroResponseDto,
  ListaDonativosDineroResponseDto,
  ListarDonativosDineroQueryDto,
  RegistrarDonativoDineroDto,
} from './dto/donativo-dinero.dto';
import { RegistrarDonativoDineroUseCase } from './usecases/registrar-donativo-dinero.usecase';
import { ListarDonativosDineroUseCase } from './usecases/listar-donativos-dinero.usecase';
import { EliminarDonativoDineroUseCase } from './usecases/eliminar-donativo-dinero.usecase';

// El donativo en dinero se captura en el punto de servicio: los tres roles lo
// registran desde la pantalla de Turno. Consultar el histórico de montos y
// eliminar quedan reservados a admin/usuario.
const ROLES_CAPTURA = [
  UserRoles.ADMINISTRADOR,
  UserRoles.USUARIO,
  UserRoles.USUARIO_SIMPLE,
];
const ROLES_CONSULTA = [UserRoles.ADMINISTRADOR, UserRoles.USUARIO];

@ApiTags('Donativos')
@Controller('donativos')
@Auth(...ROLES_CONSULTA)
export class DonativosController {
  constructor(
    @Inject(RegistrarDonativoDineroUseCase)
    private readonly registrarDonativo: RegistrarDonativoDineroUseCase,
    @Inject(ListarDonativosDineroUseCase)
    private readonly listarDonativos: ListarDonativosDineroUseCase,
    @Inject(EliminarDonativoDineroUseCase)
    private readonly eliminarDonativo: EliminarDonativoDineroUseCase,
  ) {}

  @Post()
  @Auth(...ROLES_CAPTURA)
  @ApiOkSchemaResponse(DonativoDineroResponseDto)
  crear(
    @Body() dto: RegistrarDonativoDineroDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarDonativo.execute({ dto, registradoPorId });
  }

  @Get()
  @ApiOkSchemaResponse(ListaDonativosDineroResponseDto)
  listar(@Query() query: ListarDonativosDineroQueryDto) {
    return this.listarDonativos.execute(query);
  }

  @Delete(':id')
  @Auth(UserRoles.ADMINISTRADOR)
  eliminar(@Param() { id }: IdParamDto) {
    return this.eliminarDonativo.execute(Number(id));
  }
}
