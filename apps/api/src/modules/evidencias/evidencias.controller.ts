import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { UserRoles } from '@/common/interfaces/enums';
import { IdParamDto } from '@/common/dto/api-validator.dto';
import { ApiOkSchemaResponse } from '@/common/dto/response.dto';
import { PeriodoMensualQueryDto } from '@/common/dto/periodo.dto';
import { ImageUploadInterceptor } from '@/common/uploads/image-upload.interceptor';
import { EvidenciaResponseDto } from './dto/evidencia.dto';
import { ListarEvidenciasUseCase } from './usecases/listar-evidencias.usecase';
import { SubirEvidenciaUseCase } from './usecases/subir-evidencia.usecase';
import { EliminarEvidenciaUseCase } from './usecases/eliminar-evidencia.usecase';

@ApiTags('Evidencias')
@Controller('evidencias')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
export class EvidenciasController {
  constructor(
    @Inject(ListarEvidenciasUseCase)
    private readonly listarEvidencias: ListarEvidenciasUseCase,
    @Inject(SubirEvidenciaUseCase)
    private readonly subirEvidencia: SubirEvidenciaUseCase,
    @Inject(EliminarEvidenciaUseCase)
    private readonly eliminarEvidencia: EliminarEvidenciaUseCase,
  ) {}

  @Get()
  @ApiOkSchemaResponse(EvidenciaResponseDto)
  listar(@Query() query: PeriodoMensualQueryDto) {
    return this.listarEvidencias.execute(query);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(ImageUploadInterceptor('foto'))
  @ApiOkSchemaResponse(EvidenciaResponseDto)
  subir(
    @Query() query: PeriodoMensualQueryDto,
    @UploadedFile() file: Express.Multer.File,
    @AuthUser('id') subidoPorId: number,
  ) {
    return this.subirEvidencia.execute({ ...query, file, subidoPorId });
  }

  @Delete(':id')
  @Auth(UserRoles.ADMINISTRADOR)
  eliminar(@Param() { id }: IdParamDto) {
    return this.eliminarEvidencia.execute(Number(id));
  }
}
