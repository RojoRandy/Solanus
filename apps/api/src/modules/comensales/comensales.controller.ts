import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
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
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { ImageUploadInterceptor } from '@/common/uploads/image-upload.interceptor';
import {
  ActualizarComensalDto,
  AsistenciaComensalResponseDto,
  ComensalDetalleResponseDto,
  ComensalResponseDto,
  CrearComensalDto,
  FirmarCartaUsoImagenDto,
  ListarComensalesQueryDto,
  TutorResponseDto,
} from './dto/comensal.dto';
import { CrearComensalUseCase } from './usecases/crear-comensal.usecase';
import { ListarComensalesUseCase } from './usecases/listar-comensales.usecase';
import { ListarTutoresUseCase } from './usecases/listar-tutores.usecase';
import { ObtenerComensalUseCase } from './usecases/obtener-comensal.usecase';
import { ActualizarComensalUseCase } from './usecases/actualizar-comensal.usecase';
import { EliminarComensalUseCase } from './usecases/eliminar-comensal.usecase';
import { SubirFotoComensalUseCase } from './usecases/subir-foto-comensal.usecase';
import { SubirIneFrenteComensalUseCase } from './usecases/subir-ine-frente-comensal.usecase';
import { SubirIneReversoComensalUseCase } from './usecases/subir-ine-reverso-comensal.usecase';
import { FirmarCartaUsoImagenUseCase } from './usecases/firmar-carta-uso-imagen.usecase';
import { GenerarPdfExpedienteUseCase } from './usecases/generar-pdf-expediente.usecase';
import { ListarAsistenciasComensalUseCase } from './usecases/listar-asistencias-comensal.usecase';
import { ExportarComensalesXlsxUseCase } from './usecases/exportar-comensales-xlsx.usecase';
import { ExportarComensalesPdfUseCase } from './usecases/exportar-comensales-pdf.usecase';

const ROLES_LECTURA = [
  UserRoles.ADMINISTRADOR,
  UserRoles.USUARIO,
  UserRoles.USUARIO_SIMPLE,
];
const ROLES_ESCRITURA = [UserRoles.ADMINISTRADOR, UserRoles.USUARIO];

@ApiTags('Comensales')
@Controller('comensales')
export class ComensalesController {
  constructor(
    @Inject(CrearComensalUseCase)
    private readonly crearComensal: CrearComensalUseCase,
    @Inject(ListarComensalesUseCase)
    private readonly listarComensales: ListarComensalesUseCase,
    @Inject(ListarTutoresUseCase)
    private readonly listarTutores: ListarTutoresUseCase,
    @Inject(ObtenerComensalUseCase)
    private readonly obtenerComensal: ObtenerComensalUseCase,
    @Inject(ActualizarComensalUseCase)
    private readonly actualizarComensal: ActualizarComensalUseCase,
    @Inject(EliminarComensalUseCase)
    private readonly eliminarComensal: EliminarComensalUseCase,
    @Inject(SubirFotoComensalUseCase)
    private readonly subirFotoComensal: SubirFotoComensalUseCase,
    @Inject(SubirIneFrenteComensalUseCase)
    private readonly subirIneFrenteComensal: SubirIneFrenteComensalUseCase,
    @Inject(SubirIneReversoComensalUseCase)
    private readonly subirIneReversoComensal: SubirIneReversoComensalUseCase,
    @Inject(FirmarCartaUsoImagenUseCase)
    private readonly firmarCartaUsoImagen: FirmarCartaUsoImagenUseCase,
    @Inject(GenerarPdfExpedienteUseCase)
    private readonly generarPdfExpediente: GenerarPdfExpedienteUseCase,
    @Inject(ListarAsistenciasComensalUseCase)
    private readonly listarAsistenciasComensal: ListarAsistenciasComensalUseCase,
    @Inject(ExportarComensalesXlsxUseCase)
    private readonly exportarComensalesXlsx: ExportarComensalesXlsxUseCase,
    @Inject(ExportarComensalesPdfUseCase)
    private readonly exportarComensalesPdf: ExportarComensalesPdfUseCase,
  ) {}

  @Post()
  @Auth(...ROLES_ESCRITURA)
  @ApiOkSchemaResponse(ComensalResponseDto)
  create(@Body() dto: CrearComensalDto) {
    return this.crearComensal.execute(dto);
  }

  @Get()
  @Auth(...ROLES_LECTURA)
  @ApiOkSchemaResponse(ComensalResponseDto)
  findAll(@Query() query: ListarComensalesQueryDto) {
    return this.listarComensales.execute(query);
  }

  // Las dos rutas de exportación van ANTES de `:id`: si no, Nest hace match con
  // `:id` y `IdParamDto` recibe "exportar.xlsx" y responde 400.
  @Get('exportar.xlsx')
  @Auth(...ROLES_ESCRITURA)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportarXlsx(@Query() query: ListarComensalesQueryDto) {
    const { buffer, filename } = await this.exportarComensalesXlsx.execute(query);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Get('exportar.pdf')
  @Auth(...ROLES_ESCRITURA)
  @Header('Content-Type', 'application/pdf')
  async exportarPdf(@Query() query: ListarComensalesQueryDto) {
    const { buffer, filename } = await this.exportarComensalesPdf.execute(query);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${filename}"`,
    });
  }

  // Esta ruta va ANTES de `:id`: si no, Nest hace match con `:id` y
  // `IdParamDto` recibe "tutores" y responde 400.
  @Get('tutores')
  @Auth(...ROLES_LECTURA)
  @ApiOkSchemaArrayResponse(TutorResponseDto)
  obtenerTutores() {
    return this.listarTutores.execute();
  }

  @Get(':id')
  @Auth(...ROLES_LECTURA)
  @ApiOkSchemaResponse(ComensalDetalleResponseDto)
  findOne(@Param() { id }: IdParamDto) {
    return this.obtenerComensal.execute(Number(id));
  }

  @Patch(':id')
  @Auth(...ROLES_ESCRITURA)
  @ApiOkSchemaResponse(ComensalResponseDto)
  update(@Param() { id }: IdParamDto, @Body() dto: ActualizarComensalDto) {
    return this.actualizarComensal.execute({ id: Number(id), dto });
  }

  @Delete(':id')
  @Auth(UserRoles.ADMINISTRADOR)
  remove(@Param() { id }: IdParamDto) {
    return this.eliminarComensal.execute(Number(id));
  }

  @Post(':id/foto')
  @Auth(...ROLES_ESCRITURA)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(ImageUploadInterceptor('foto'))
  @ApiOkSchemaResponse(ComensalDetalleResponseDto)
  subirFoto(
    @Param() { id }: IdParamDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subirFotoComensal.execute({ id: Number(id), file });
  }

  @Post(':id/ine-frente')
  @Auth(...ROLES_ESCRITURA)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(ImageUploadInterceptor('ine'))
  @ApiOkSchemaResponse(ComensalDetalleResponseDto)
  subirIneFrente(
    @Param() { id }: IdParamDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subirIneFrenteComensal.execute({ id: Number(id), file });
  }

  @Post(':id/ine-reverso')
  @Auth(...ROLES_ESCRITURA)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(ImageUploadInterceptor('ine'))
  @ApiOkSchemaResponse(ComensalDetalleResponseDto)
  subirIneReverso(
    @Param() { id }: IdParamDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.subirIneReversoComensal.execute({ id: Number(id), file });
  }

  @Post(':id/carta-uso-imagen')
  @Auth(...ROLES_ESCRITURA)
  @ApiOkSchemaResponse(ComensalDetalleResponseDto)
  firmarCarta(
    @Param() { id }: IdParamDto,
    @Body() dto: FirmarCartaUsoImagenDto,
  ) {
    return this.firmarCartaUsoImagen.execute({ id: Number(id), dto });
  }

  @Get(':id/asistencias')
  @Auth(...ROLES_LECTURA)
  @ApiOkSchemaResponse(AsistenciaComensalResponseDto)
  findAsistencias(@Param() { id }: IdParamDto, @Query() query: PaginationQueryDto) {
    return this.listarAsistenciasComensal.execute({ comensalId: Number(id), query });
  }

  @Get(':id/expediente.pdf')
  @Auth(...ROLES_LECTURA)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="expediente.pdf"')
  async descargarExpediente(@Param() { id }: IdParamDto) {
    const { buffer, filename } = await this.generarPdfExpediente.execute(
      Number(id),
    );
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
