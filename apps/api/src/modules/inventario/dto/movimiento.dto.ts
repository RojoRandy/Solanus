import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoMovimiento } from '@prisma/client';

export class ListarMovimientosQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  itemId?: number;

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

class MovimientoItemRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
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
  @ApiProperty({ type: MovimientoItemRefDto })
  item: MovimientoItemRefDto;
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
}
