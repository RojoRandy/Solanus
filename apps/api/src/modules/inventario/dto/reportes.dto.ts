import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProximosAVencerQueryDto {
  @ApiProperty({
    required: false,
    default: 15,
    description: 'Ventana de días hacia adelante a considerar',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dias?: number;
}

export class ProximoAVencerResponseDto {
  @ApiProperty()
  loteId: number;
  @ApiProperty()
  itemId: number;
  @ApiProperty()
  itemNombre: string;
  @ApiProperty()
  cantidadDisponible: number;
  @ApiProperty()
  fechaCaducidad: Date;
}

export class StockBajoResponseDto {
  @ApiProperty()
  itemId: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  stockActual: number;
  @ApiProperty()
  stockMinimo: number;
}

export class StockItemResponseDto {
  @ApiProperty()
  itemId: number;
  @ApiProperty()
  stockActual: number;
}
