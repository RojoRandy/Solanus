import { ApiProperty } from '@nestjs/swagger';
import { EstadoProducto } from '@prisma/client';
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
  varianteId: number;
  @ApiProperty()
  productoNombre: string;
  @ApiProperty()
  unidad: string;
  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  estado: EstadoProducto;
  @ApiProperty()
  cantidadDisponible: number;
  @ApiProperty()
  fechaCaducidad: Date;
}

export class StockBajoResponseDto {
  @ApiProperty()
  varianteId: number;
  @ApiProperty()
  productoNombre: string;
  @ApiProperty()
  unidad: string;
  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  estado: EstadoProducto;
  @ApiProperty()
  stockActual: number;
  @ApiProperty()
  stockMinimo: number;
}

export class StockVarianteResponseDto {
  @ApiProperty()
  varianteId: number;
  @ApiProperty()
  stockActual: number;
}
