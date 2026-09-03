import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoProducto, TipoMovimiento } from '@prisma/client';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class ListarMovimientosQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  varianteId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productoId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @ApiProperty({
    required: false,
    description: 'Filtra los insumos registrados en un turno de comida',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  turnoId?: number;

  @ApiProperty({
    required: false,
    enum: TipoMovimiento,
    enumName: 'TipoMovimiento',
  })
  @IsOptional()
  @IsEnum(TipoMovimiento)
  tipo?: TipoMovimiento;

  @ApiProperty({
    required: false,
    description: 'Fecha inicial (ISO), inclusive',
  })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiProperty({ required: false, description: 'Fecha final (ISO), inclusive' })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}

export class ActualizarMovimientoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  motivoId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}

class MovimientoProductoRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

class MovimientoUnidadRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  abrevia: string;
}

class MovimientoVarianteRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  estado: EstadoProducto;
  @ApiProperty({ type: MovimientoUnidadRefDto })
  unidad: MovimientoUnidadRefDto;
}

class MovimientoMotivoRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

class MovimientoUsuarioRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class MovimientoResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: MovimientoProductoRefDto })
  producto: MovimientoProductoRefDto;
  @ApiProperty({ type: MovimientoVarianteRefDto })
  variante: MovimientoVarianteRefDto;
  @ApiProperty({ required: false, nullable: true })
  loteId: number | null;
  @ApiProperty({ enum: TipoMovimiento, enumName: 'TipoMovimiento' })
  tipo: TipoMovimiento;
  @ApiProperty({ type: MovimientoMotivoRefDto })
  motivo: MovimientoMotivoRefDto;
  @ApiProperty()
  cantidad: number;
  @ApiProperty({ required: false, nullable: true })
  turnoId: number | null;
  @ApiProperty({ type: MovimientoUsuarioRefDto })
  registradoPor: MovimientoUsuarioRefDto;
  @ApiProperty()
  fecha: Date;
  @ApiProperty({ required: false, nullable: true })
  notas: string | null;
  @ApiProperty()
  editado: boolean;
}
