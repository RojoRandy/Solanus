import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { EstadoProducto } from '@prisma/client';

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

class AsistenciaPorDiaDto {
  @ApiProperty() fecha: string;
  @ApiProperty() desayuno: number;
  @ApiProperty() comida: number;
  @ApiProperty() cena: number;
  @ApiProperty() total: number;
}

export class ReporteAsistenciaResponseDto {
  @ApiProperty() totalAsistencias: number;
  @ApiProperty() desayuno: number;
  @ApiProperty() comida: number;
  @ApiProperty() cena: number;
  @ApiProperty({ type: [AsistenciaPorDiaDto] }) porDia: AsistenciaPorDiaDto[];
}

// ── Reporte de Inventario ──

class ExistenciaReporteDto {
  @ApiProperty() varianteId: number;
  @ApiProperty() nombre: string;
  @ApiProperty() categoria: string;
  @ApiProperty() unidad: string;
  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' }) estado: EstadoProducto;
  @ApiProperty() stockActual: number;
  @ApiProperty() stockMinimo: number;
  @ApiProperty() stockBajo: boolean;
}

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
  @ApiProperty({ type: [ExistenciaReporteDto] })
  existencias: ExistenciaReporteDto[];
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
