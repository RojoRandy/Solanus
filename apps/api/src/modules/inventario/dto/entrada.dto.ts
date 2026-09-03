import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EstadoProducto, OrigenLote } from '@prisma/client';
import { CrearProductoDto } from './producto.dto';

/**
 * El orden de los campos aquí refleja el orden de captura en la pantalla
 * "Registrar entrada": estado → cantidad → costo unitario → costo total →
 * unidad → marca → cfdi → caducidad → ingreso → origen → bienhechor.
 */
export class RegistrarEntradaDto {
  @ApiProperty({
    required: false,
    description: 'Id de un producto ya existente en el catálogo',
  })
  @IsOptional()
  @IsInt()
  productoId?: number;

  @ApiProperty({
    required: false,
    type: CrearProductoDto,
    description:
      'Datos para dar de alta el producto al vuelo cuando no existe todavía',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CrearProductoDto)
  productoNuevo?: CrearProductoDto;

  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  @IsEnum(EstadoProducto)
  estado: EstadoProducto;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  cantidadInicial: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  costoUnitario: number;

  @ApiProperty({
    required: false,
    description: 'Cantidad × costo unitario; si no se envía, se calcula',
  })
  @IsOptional()
  @IsNumber()
  costoTotal?: number;

  @ApiProperty()
  @IsInt()
  unidadId: number;

  @ApiProperty({ required: false, description: 'No aplica si el lote es cocido' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({ required: false, description: 'CFDI / número de factura' })
  @IsOptional()
  @IsString()
  cfdi?: string;

  @ApiProperty({ required: false, description: 'Fecha de caducidad (ISO)' })
  @IsOptional()
  @IsDateString()
  fechaCaducidad?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  noCaduca?: boolean;

  @ApiProperty({
    required: false,
    description: 'Fecha de ingreso (ISO), por defecto hoy',
  })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

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
  presentacion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ubicacion?: string;
}

class LoteVarianteRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  productoNombre: string;
  @ApiProperty()
  unidadAbrevia: string;
  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  estado: EstadoProducto;
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
  @ApiProperty({ type: LoteVarianteRefDto })
  variante: LoteVarianteRefDto;
  @ApiProperty({ required: false, nullable: true })
  marca: string | null;
  @ApiProperty({ required: false, nullable: true })
  presentacion: string | null;
  @ApiProperty({ required: false, nullable: true })
  ubicacion: string | null;
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
  cfdi: string | null;
}
