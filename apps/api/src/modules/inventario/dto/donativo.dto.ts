import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EstadoProducto } from '@prisma/client';
import { CrearProductoDto } from './producto.dto';
import { LoteResponseDto } from './entrada.dto';

export class LineaDonativoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  productoId?: number;

  @ApiProperty({ required: false, type: CrearProductoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CrearProductoDto)
  productoNuevo?: CrearProductoDto;

  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  @IsEnum(EstadoProducto)
  estado: EstadoProducto;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  cantidad: number;

  @ApiProperty()
  @IsInt()
  unidadId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  costoUnitario?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaCaducidad?: string;
}

/**
 * Registra en una sola transacción varios lotes DONADO para el mismo
 * bienhechor — el flujo de "Registrar donativo" permite capturar más de
 * un producto sin reabrir el diálogo.
 */
export class RegistrarDonativoDto {
  @ApiProperty()
  @IsInt()
  bienhechorId: number;

  @ApiProperty({ required: false, description: 'Por defecto hoy' })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @ApiProperty({ type: [LineaDonativoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineaDonativoDto)
  lineas: LineaDonativoDto[];
}

export class RegistrarDonativoResponseDto {
  @ApiProperty({ type: [LoteResponseDto] })
  lotes: LoteResponseDto[];
}
