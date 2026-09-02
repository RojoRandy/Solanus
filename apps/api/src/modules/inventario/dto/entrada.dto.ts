import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrigenLote } from '@prisma/client';
import { CrearInventarioItemDto } from './item.dto';

export class RegistrarEntradaDto {
  @ApiProperty({
    required: false,
    description: 'Id de un producto ya existente en el catálogo',
  })
  @IsOptional()
  @IsInt()
  itemId?: number;

  @ApiProperty({
    required: false,
    type: CrearInventarioItemDto,
    description:
      'Datos para dar de alta el producto al vuelo cuando no existe todavía en el catálogo',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CrearInventarioItemDto)
  itemNuevo?: CrearInventarioItemDto;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  cantidadInicial: number;

  @ApiProperty({ required: false, description: 'Fecha de caducidad (ISO)' })
  @IsOptional()
  @IsDateString()
  fechaCaducidad?: string;

  @ApiProperty({
    required: false,
    description: 'Fecha de ingreso (ISO), por defecto hoy',
  })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  costoUnitario?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  costoTotal?: number;

  @ApiProperty({ enum: OrigenLote, enumName: 'OrigenLote' })
  @IsEnum(OrigenLote)
  origen: OrigenLote;

  @ApiProperty({
    required: false,
    description: 'Requerido cuando origen es DONADO',
  })
  @IsOptional()
  @IsInt()
  bienhechorId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  numeroFactura?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cfdi?: string;
}

class LoteItemRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

class LoteBienhechorRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class LoteResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: LoteItemRefDto })
  item: LoteItemRefDto;
  @ApiProperty()
  cantidadInicial: number;
  @ApiProperty()
  cantidadDisponible: number;
  @ApiProperty({ nullable: true })
  fechaCaducidad: Date | null;
  @ApiProperty()
  fechaIngreso: Date;
  @ApiProperty({ nullable: true })
  costoUnitario: number | null;
  @ApiProperty({ nullable: true })
  costoTotal: number | null;
  @ApiProperty({ enum: OrigenLote, enumName: 'OrigenLote' })
  origen: OrigenLote;
  @ApiProperty({ type: LoteBienhechorRefDto, nullable: true })
  bienhechor: LoteBienhechorRefDto | null;
  @ApiProperty({ nullable: true })
  numeroFactura: string | null;
  @ApiProperty({ nullable: true })
  cfdi: string | null;
}
