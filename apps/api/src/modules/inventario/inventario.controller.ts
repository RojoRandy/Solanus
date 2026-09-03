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
  ActualizarProductoDto,
  CrearProductoDto,
  ListarProductosQueryDto,
  ProductoResponseDto,
} from './dto/producto.dto';
import {
  ActualizarVarianteDto,
  CrearVarianteDto,
  ListarVariantesQueryDto,
  VarianteResponseDto,
} from './dto/variante.dto';
import { RegistrarEntradaDto, LoteResponseDto } from './dto/entrada.dto';
import { LoteVivoResponseDto } from './dto/lote.dto';
import { RegistrarSalidaDto } from './dto/salida.dto';
import { RegistrarAjusteDto } from './dto/ajuste.dto';
import { RegistrarDonativoDto, RegistrarDonativoResponseDto } from './dto/donativo.dto';
import {
  ActualizarMovimientoDto,
  ListarMovimientosQueryDto,
  MovimientoResponseDto,
} from './dto/movimiento.dto';
import {
  ProximoAVencerResponseDto,
  ProximosAVencerQueryDto,
  StockBajoResponseDto,
  StockVarianteResponseDto,
} from './dto/reportes.dto';
import {
  ActualizarCategoriaDto,
  ActualizarUnidadDto,
  CategoriaInventarioResponseDto,
  CrearCategoriaDto,
  CrearUnidadDto,
  MotivoMovimientoResponseDto,
  UnidadMedidaResponseDto,
} from './dto/catalogos.dto';
import { CrearProductoUseCase } from './usecases/crear-producto.usecase';
import { ListarProductosUseCase } from './usecases/listar-productos.usecase';
import { ObtenerProductoUseCase } from './usecases/obtener-producto.usecase';
import { ActualizarProductoUseCase } from './usecases/actualizar-producto.usecase';
import { EliminarProductoUseCase } from './usecases/eliminar-producto.usecase';
import { CrearVarianteUseCase } from './usecases/crear-variante.usecase';
import { ListarVariantesUseCase } from './usecases/listar-variantes.usecase';
import { ObtenerVarianteUseCase } from './usecases/obtener-variante.usecase';
import { ActualizarVarianteUseCase } from './usecases/actualizar-variante.usecase';
import { RegistrarEntradaUseCase } from './usecases/registrar-entrada.usecase';
import { RegistrarDonativoUseCase } from './usecases/registrar-donativo.usecase';
import { RegistrarSalidaInventarioUseCase } from './usecases/registrar-salida.usecase';
import { RegistrarAjusteUseCase } from './usecases/registrar-ajuste.usecase';
import { ListarMovimientosUseCase } from './usecases/listar-movimientos.usecase';
import { ActualizarMovimientoUseCase } from './usecases/actualizar-movimiento.usecase';
import { ProximosAVencerUseCase } from './usecases/proximos-a-vencer.usecase';
import { StockBajoUseCase } from './usecases/stock-bajo.usecase';
import { StockVarianteUseCase } from './usecases/stock-variante.usecase';
import { ListarLotesVarianteUseCase } from './usecases/listar-lotes-variante.usecase';
import {
  ListarCategoriasUseCase,
  ListarMotivosUseCase,
  ListarUnidadesUseCase,
} from './usecases/listar-catalogos.usecase';
import {
  ActualizarCategoriaUseCase,
  ActualizarUnidadUseCase,
  CrearCategoriaUseCase,
  CrearUnidadUseCase,
  EliminarCategoriaUseCase,
  EliminarUnidadUseCase,
} from './usecases/crud-catalogos.usecase';

@ApiTags('Inventario')
@Controller('inventario')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
export class InventarioController {
  constructor(
    @Inject(CrearProductoUseCase) private readonly crearProducto: CrearProductoUseCase,
    @Inject(ListarProductosUseCase) private readonly listarProductos: ListarProductosUseCase,
    @Inject(ObtenerProductoUseCase) private readonly obtenerProducto: ObtenerProductoUseCase,
    @Inject(ActualizarProductoUseCase) private readonly actualizarProducto: ActualizarProductoUseCase,
    @Inject(EliminarProductoUseCase) private readonly eliminarProducto: EliminarProductoUseCase,
    @Inject(CrearVarianteUseCase) private readonly crearVariante: CrearVarianteUseCase,
    @Inject(ListarVariantesUseCase) private readonly listarVariantes: ListarVariantesUseCase,
    @Inject(ObtenerVarianteUseCase) private readonly obtenerVariante: ObtenerVarianteUseCase,
    @Inject(ActualizarVarianteUseCase) private readonly actualizarVariante: ActualizarVarianteUseCase,
    @Inject(RegistrarEntradaUseCase) private readonly registrarEntrada: RegistrarEntradaUseCase,
    @Inject(RegistrarDonativoUseCase) private readonly registrarDonativo: RegistrarDonativoUseCase,
    @Inject(RegistrarSalidaInventarioUseCase) private readonly registrarSalida: RegistrarSalidaInventarioUseCase,
    @Inject(RegistrarAjusteUseCase) private readonly registrarAjuste: RegistrarAjusteUseCase,
    @Inject(ListarMovimientosUseCase) private readonly listarMovimientos: ListarMovimientosUseCase,
    @Inject(ActualizarMovimientoUseCase) private readonly actualizarMovimiento: ActualizarMovimientoUseCase,
    @Inject(ProximosAVencerUseCase) private readonly proximosAVencer: ProximosAVencerUseCase,
    @Inject(StockBajoUseCase) private readonly stockBajo: StockBajoUseCase,
    @Inject(StockVarianteUseCase) private readonly stockVariante: StockVarianteUseCase,
    @Inject(ListarLotesVarianteUseCase) private readonly listarLotesVariante: ListarLotesVarianteUseCase,
    @Inject(ListarCategoriasUseCase) private readonly listarCategorias: ListarCategoriasUseCase,
    @Inject(ListarUnidadesUseCase) private readonly listarUnidades: ListarUnidadesUseCase,
    @Inject(ListarMotivosUseCase) private readonly listarMotivos: ListarMotivosUseCase,
    @Inject(CrearUnidadUseCase) private readonly crearUnidad: CrearUnidadUseCase,
    @Inject(ActualizarUnidadUseCase) private readonly actualizarUnidad: ActualizarUnidadUseCase,
    @Inject(EliminarUnidadUseCase) private readonly eliminarUnidad: EliminarUnidadUseCase,
    @Inject(CrearCategoriaUseCase) private readonly crearCategoria: CrearCategoriaUseCase,
    @Inject(ActualizarCategoriaUseCase) private readonly actualizarCategoria: ActualizarCategoriaUseCase,
    @Inject(EliminarCategoriaUseCase) private readonly eliminarCategoria: EliminarCategoriaUseCase,
  ) {}

  // ── Catálogos (Configuración) ──

  @Get('categorias')
  @ApiOkSchemaArrayResponse(CategoriaInventarioResponseDto)
  findCategorias() {
    return this.listarCategorias.execute();
  }

  @Post('categorias')
  @ApiOkSchemaResponse(CategoriaInventarioResponseDto)
  crearCategoriaInventario(@Body() dto: CrearCategoriaDto) {
    return this.crearCategoria.execute(dto);
  }

  @Patch('categorias/:id')
  @Auth(UserRoles.ADMINISTRADOR)
  @ApiOkSchemaResponse(CategoriaInventarioResponseDto)
  actualizarCategoriaInventario(@Param() { id }: IdParamDto, @Body() dto: ActualizarCategoriaDto) {
    return this.actualizarCategoria.execute({ id: Number(id), dto });
  }

  @Delete('categorias/:id')
  @Auth(UserRoles.ADMINISTRADOR)
  eliminarCategoriaInventario(@Param() { id }: IdParamDto) {
    return this.eliminarCategoria.execute(Number(id));
  }

  @Get('unidades')
  @ApiOkSchemaArrayResponse(UnidadMedidaResponseDto)
  findUnidades() {
    return this.listarUnidades.execute();
  }

  @Post('unidades')
  @ApiOkSchemaResponse(UnidadMedidaResponseDto)
  crearUnidadMedida(@Body() dto: CrearUnidadDto) {
    return this.crearUnidad.execute(dto);
  }

  @Patch('unidades/:id')
  @Auth(UserRoles.ADMINISTRADOR)
  @ApiOkSchemaResponse(UnidadMedidaResponseDto)
  actualizarUnidadMedida(@Param() { id }: IdParamDto, @Body() dto: ActualizarUnidadDto) {
    return this.actualizarUnidad.execute({ id: Number(id), dto });
  }

  @Delete('unidades/:id')
  @Auth(UserRoles.ADMINISTRADOR)
  eliminarUnidadMedida(@Param() { id }: IdParamDto) {
    return this.eliminarUnidad.execute(Number(id));
  }

  @Get('motivos')
  @ApiOkSchemaArrayResponse(MotivoMovimientoResponseDto)
  findMotivos() {
    return this.listarMotivos.execute();
  }

  // ── Reportes de solo lectura (Dashboard) ──

  @Get('proximos-a-vencer')
  @ApiOkSchemaArrayResponse(ProximoAVencerResponseDto)
  findProximosAVencer(@Query() query: ProximosAVencerQueryDto) {
    return this.proximosAVencer.execute(query.dias);
  }

  @Get('stock-bajo')
  @ApiOkSchemaArrayResponse(StockBajoResponseDto)
  findStockBajo() {
    return this.stockBajo.execute();
  }

  // ── Movimientos (histórico/auditoría) ──

  @Get('movimientos')
  @ApiOkSchemaResponse(MovimientoResponseDto)
  findMovimientos(@Query() query: ListarMovimientosQueryDto) {
    return this.listarMovimientos.execute(query);
  }

  @Patch('movimientos/:id')
  @ApiOkSchemaResponse(MovimientoResponseDto)
  actualizarMovimientoInventario(
    @Param() { id }: IdParamDto,
    @Body() dto: ActualizarMovimientoDto,
    @AuthUser('id') editadoPorId: number,
  ) {
    return this.actualizarMovimiento.execute({ id: Number(id), dto, editadoPorId });
  }

  @Post('salidas')
  crearSalida(
    @Body() dto: RegistrarSalidaDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarSalida.execute({ ...dto, registradoPorId });
  }

  @Post('ajustes')
  registrarAjusteInventario(
    @Body() dto: RegistrarAjusteDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarAjuste.execute({ dto, registradoPorId });
  }

  // ── Lotes (entradas y donativos) ──

  @Post('entradas')
  @ApiOkSchemaResponse(LoteResponseDto)
  crearEntrada(
    @Body() dto: RegistrarEntradaDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarEntrada.execute({ dto, registradoPorId });
  }

  @Post('donativos')
  @ApiOkSchemaResponse(RegistrarDonativoResponseDto)
  crearDonativo(
    @Body() dto: RegistrarDonativoDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarDonativo.execute({ dto, registradoPorId });
  }

  // ── Variantes (existencias por producto × unidad × estado) ──

  @Get('variantes')
  @ApiOkSchemaResponse(VarianteResponseDto)
  findVariantes(@Query() query: ListarVariantesQueryDto) {
    return this.listarVariantes.execute(query);
  }

  @Post('variantes')
  @ApiOkSchemaResponse(VarianteResponseDto)
  crearVarianteInventario(@Body() dto: CrearVarianteDto) {
    return this.crearVariante.execute(dto);
  }

  @Get('variantes/:id')
  @ApiOkSchemaResponse(VarianteResponseDto)
  findVariante(@Param() { id }: IdParamDto) {
    return this.obtenerVariante.execute(Number(id));
  }

  @Get('variantes/:id/stock')
  @ApiOkSchemaResponse(StockVarianteResponseDto)
  findStockVariante(@Param() { id }: IdParamDto) {
    return this.stockVariante.execute(Number(id));
  }

  @Get('variantes/:id/lotes')
  @ApiOkSchemaArrayResponse(LoteVivoResponseDto)
  findLotesVariante(@Param() { id }: IdParamDto) {
    return this.listarLotesVariante.execute(Number(id));
  }

  @Patch('variantes/:id')
  @ApiOkSchemaResponse(VarianteResponseDto)
  actualizarVarianteInventario(@Param() { id }: IdParamDto, @Body() dto: ActualizarVarianteDto) {
    return this.actualizarVariante.execute({ id: Number(id), dto });
  }

  // ── Catálogo de productos ──

  @Post('productos')
  @ApiOkSchemaResponse(ProductoResponseDto)
  crearProductoInventario(@Body() dto: CrearProductoDto) {
    return this.crearProducto.execute(dto);
  }

  @Get('productos')
  @ApiOkSchemaResponse(ProductoResponseDto)
  findProductos(@Query() query: ListarProductosQueryDto) {
    return this.listarProductos.execute(query);
  }

  @Get('productos/:id')
  @ApiOkSchemaResponse(ProductoResponseDto)
  findProducto(@Param() { id }: IdParamDto) {
    return this.obtenerProducto.execute(Number(id));
  }

  @Patch('productos/:id')
  @ApiOkSchemaResponse(ProductoResponseDto)
  updateProducto(
    @Param() { id }: IdParamDto,
    @Body() dto: ActualizarProductoDto,
  ) {
    return this.actualizarProducto.execute({ id: Number(id), dto });
  }

  @Delete('productos/:id')
  @Auth(UserRoles.ADMINISTRADOR)
  removeProducto(@Param() { id }: IdParamDto) {
    return this.eliminarProducto.execute(Number(id));
  }
}
