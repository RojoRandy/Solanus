import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { EstadoProducto, OrigenLote } from '@prisma/client';
import { CrearProductoDto } from './producto.dto';

export class LineaEntradaDto {
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

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  cantidad: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  costoUnitario?: number;

  @ApiProperty({ required: false, description: 'Fecha de caducidad (ISO)' })
  @IsOptional()
  @IsDateString()
  fechaCaducidad?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  noCaduca?: boolean;
}

export class RegistrarEntradaDto {
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
  cfdi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiProperty({ type: [LineaEntradaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineaEntradaDto)
  lineas: LineaEntradaDto[];
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
  entradaId: number;
  @ApiProperty()
  id: number;
  @ApiProperty({ type: LoteVarianteRefDto })
  variante: LoteVarianteRefDto;
  @ApiProperty({ required: false, nullable: true })
  marca: string | null;
  @ApiProperty()
  granel: boolean;
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

export class RegistrarEntradaResponseDto {
  @ApiProperty()
  entradaId: number;

  @ApiProperty({ type: [LoteResponseDto] })
  lotes: LoteResponseDto[];
}

export class ActualizarCfdiEntradaDto {
  @ApiProperty({ type: String, required: false, nullable: true, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cfdi: string | null;
}

export class EntradaCfdiResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: String, nullable: true })
  cfdi: string | null;
}
