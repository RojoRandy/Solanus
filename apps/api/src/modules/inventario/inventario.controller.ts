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
  ActualizarInventarioItemDto,
  CrearInventarioItemDto,
  InventarioItemResponseDto,
  ListarInventarioItemsQueryDto,
} from './dto/item.dto';
import { RegistrarEntradaDto, LoteResponseDto } from './dto/entrada.dto';
import { RegistrarSalidaDto } from './dto/salida.dto';
import {
  ListarMovimientosQueryDto,
  MovimientoResponseDto,
} from './dto/movimiento.dto';
import {
  ProximoAVencerResponseDto,
  ProximosAVencerQueryDto,
  StockBajoResponseDto,
  StockItemResponseDto,
} from './dto/reportes.dto';
import {
  CategoriaInventarioResponseDto,
  MotivoMovimientoResponseDto,
  UbicacionResponseDto,
  UnidadMedidaResponseDto,
} from './dto/catalogos.dto';
import { CrearInventarioItemUseCase } from './usecases/crear-item.usecase';
import { ListarInventarioItemsUseCase } from './usecases/listar-items.usecase';
import { ObtenerInventarioItemUseCase } from './usecases/obtener-item.usecase';
import { ActualizarInventarioItemUseCase } from './usecases/actualizar-item.usecase';
import { EliminarInventarioItemUseCase } from './usecases/eliminar-item.usecase';
import { RegistrarEntradaUseCase } from './usecases/registrar-entrada.usecase';
import { RegistrarSalidaInventarioUseCase } from './usecases/registrar-salida.usecase';
import { ListarMovimientosUseCase } from './usecases/listar-movimientos.usecase';
import { ProximosAVencerUseCase } from './usecases/proximos-a-vencer.usecase';
import { StockBajoUseCase } from './usecases/stock-bajo.usecase';
import { StockItemUseCase } from './usecases/stock-item.usecase';
import {
  ListarCategoriasUseCase,
  ListarMotivosUseCase,
  ListarUbicacionesUseCase,
  ListarUnidadesUseCase,
} from './usecases/listar-catalogos.usecase';

@ApiTags('Inventario')
@Controller('inventario')
@Auth(UserRoles.ADMINISTRADOR, UserRoles.USUARIO)
export class InventarioController {
  constructor(
    @Inject(CrearInventarioItemUseCase)
    private readonly crearItem: CrearInventarioItemUseCase,
    @Inject(ListarInventarioItemsUseCase)
    private readonly listarItems: ListarInventarioItemsUseCase,
    @Inject(ObtenerInventarioItemUseCase)
    private readonly obtenerItem: ObtenerInventarioItemUseCase,
    @Inject(ActualizarInventarioItemUseCase)
    private readonly actualizarItem: ActualizarInventarioItemUseCase,
    @Inject(EliminarInventarioItemUseCase)
    private readonly eliminarItem: EliminarInventarioItemUseCase,
    @Inject(RegistrarEntradaUseCase)
    private readonly registrarEntrada: RegistrarEntradaUseCase,
    @Inject(RegistrarSalidaInventarioUseCase)
    private readonly registrarSalida: RegistrarSalidaInventarioUseCase,
    @Inject(ListarMovimientosUseCase)
    private readonly listarMovimientos: ListarMovimientosUseCase,
    @Inject(ProximosAVencerUseCase)
    private readonly proximosAVencer: ProximosAVencerUseCase,
    @Inject(StockBajoUseCase)
    private readonly stockBajo: StockBajoUseCase,
    @Inject(StockItemUseCase)
    private readonly stockItem: StockItemUseCase,
    @Inject(ListarCategoriasUseCase)
    private readonly listarCategorias: ListarCategoriasUseCase,
    @Inject(ListarUnidadesUseCase)
    private readonly listarUnidades: ListarUnidadesUseCase,
    @Inject(ListarUbicacionesUseCase)
    private readonly listarUbicaciones: ListarUbicacionesUseCase,
    @Inject(ListarMotivosUseCase)
    private readonly listarMotivos: ListarMotivosUseCase,
  ) {}

  // ── Catálogos de solo lectura (para poblar selects del frontend) ──

  @Get('categorias')
  @ApiOkSchemaArrayResponse(CategoriaInventarioResponseDto)
  findCategorias() {
    return this.listarCategorias.execute();
  }

  @Get('unidades')
  @ApiOkSchemaArrayResponse(UnidadMedidaResponseDto)
  findUnidades() {
    return this.listarUnidades.execute();
  }

  @Get('ubicaciones')
  @ApiOkSchemaArrayResponse(UbicacionResponseDto)
  findUbicaciones() {
    return this.listarUbicaciones.execute();
  }

  @Get('motivos')
  @ApiOkSchemaArrayResponse(MotivoMovimientoResponseDto)
  findMotivos() {
    return this.listarMotivos.execute();
  }

  // ── Reportes de solo lectura (los usará el Dashboard de la Fase 4) ──

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
  @ApiOkSchemaArrayResponse(MovimientoResponseDto)
  findMovimientos(@Query() query: ListarMovimientosQueryDto) {
    return this.listarMovimientos.execute(query);
  }

  @Post('salidas')
  @ApiOkSchemaResponse(InventarioItemResponseDto)
  crearSalida(
    @Body() dto: RegistrarSalidaDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarSalida.execute({ ...dto, registradoPorId });
  }

  // ── Lotes (entradas) ──

  @Post('entradas')
  @ApiOkSchemaResponse(LoteResponseDto)
  crearEntrada(
    @Body() dto: RegistrarEntradaDto,
    @AuthUser('id') registradoPorId: number,
  ) {
    return this.registrarEntrada.execute({ dto, registradoPorId });
  }

  // ── Catálogo de productos (InventarioItem) ──

  @Get('items/:id/stock')
  @ApiOkSchemaResponse(StockItemResponseDto)
  findStockItem(@Param() { id }: IdParamDto) {
    return this.stockItem.execute(Number(id));
  }

  @Post('items')
  @ApiOkSchemaResponse(InventarioItemResponseDto)
  crearItemInventario(@Body() dto: CrearInventarioItemDto) {
    return this.crearItem.execute(dto);
  }

  @Get('items')
  @ApiOkSchemaArrayResponse(InventarioItemResponseDto)
  findItems(@Query() query: ListarInventarioItemsQueryDto) {
    return this.listarItems.execute(query);
  }

  @Get('items/:id')
  @ApiOkSchemaResponse(InventarioItemResponseDto)
  findItem(@Param() { id }: IdParamDto) {
    return this.obtenerItem.execute(Number(id));
  }

  @Patch('items/:id')
  @ApiOkSchemaResponse(InventarioItemResponseDto)
  updateItem(
    @Param() { id }: IdParamDto,
    @Body() dto: ActualizarInventarioItemDto,
  ) {
    return this.actualizarItem.execute({ id: Number(id), dto });
  }

  @Delete('items/:id')
  @Auth(UserRoles.ADMINISTRADOR)
  removeItem(@Param() { id }: IdParamDto) {
    return this.eliminarItem.execute(Number(id));
  }
}
