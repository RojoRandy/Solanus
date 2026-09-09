import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class RangoFechaQueryDto {
  @ApiProperty({
    required: false,
    description: 'Fecha inicial (ISO), por defecto el 1° del mes actual',
  })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiProperty({
    required: false,
    description: 'Fecha final (ISO), por defecto hoy',
  })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}

// ── Reporte de Asistencia ──

class FilaAsistenciaDto {
  @ApiProperty() folio: number;
  @ApiProperty({ description: 'Apellidos y nombres, ya concatenados' }) nombre: string;
  @ApiProperty({ type: [Number], description: 'Número de turnos por día del mes (0 si no asistió); longitud = diasDelMes' })
  dias: number[];
  @ApiProperty({ description: 'Suma de dias[]' }) total: number;
}

export class ReporteAsistenciaResponseDto {
  @ApiProperty() anio: number;
  @ApiProperty() mes: number;
  @ApiProperty({ description: '28-31 según el mes' }) diasDelMes: number;
  @ApiProperty({ type: [FilaAsistenciaDto], description: 'Solo comensales que asistieron al menos una vez ese mes' })
  comensales: FilaAsistenciaDto[];
  @ApiProperty({ type: [Number], description: 'Suma de asistencias de todos los comensales por día; longitud = diasDelMes' })
  totalesPorDia: number[];
  @ApiProperty() totalAsistencias: number;
  @ApiProperty() desayuno: number;
  @ApiProperty() comida: number;
  @ApiProperty() cena: number;
}

// ── Reporte de Inventario ──
// El listado de movimientos del periodo se consulta directo en GET /inventario/movimientos
// (la web ya lo hace, paginado); este reporte agrega totales y mermas/caducados, que no
// tienen otro endpoint.

class MovimientoResumenDto {
  @ApiProperty() productoNombre: string;
  @ApiProperty() unidad: string;
  @ApiProperty() cantidad: number;
  @ApiProperty() motivo: string;
  @ApiProperty() fecha: Date;
}

/**
 * Entradas/salidas = suma de cantidades del periodo (compras+donaciones vs.
 * consumo+mermas+caducados). Ajustes se desglosa porque un ajuste puede subir
 * o bajar la existencia: `ajustesPositivos`/`ajustesNegativos` son sumas en
 * valor absoluto y `ajusteNeto` es la diferencia.
 */
class MovimientosPorTipoDto {
  @ApiProperty() entradas: number;
  @ApiProperty() salidas: number;
  @ApiProperty() ajustesPositivos: number;
  @ApiProperty() ajustesNegativos: number;
  @ApiProperty() ajusteNeto: number;
}

export class ReporteInventarioResponseDto {
  @ApiProperty({ type: MovimientosPorTipoDto }) movimientosPorTipo: MovimientosPorTipoDto;
  @ApiProperty({ type: [MovimientoResumenDto] }) mermas: MovimientoResumenDto[];
  @ApiProperty({ type: [MovimientoResumenDto] })
  caducados: MovimientoResumenDto[];
}

// ── Reporte de Donativos ──

class DonativosPorBienhechorDto {
  @ApiProperty() bienhechorId: number;
  @ApiProperty() bienhechor: string;
  @ApiProperty() cantidadLotes: number;
  @ApiProperty() valorEstimado: number;
}

export class ReporteDonativosResponseDto {
  @ApiProperty() totalLotes: number;
  @ApiProperty() valorEstimado: number;
  @ApiProperty({ type: [DonativosPorBienhechorDto] })
  porBienhechor: DonativosPorBienhechorDto[];
}
