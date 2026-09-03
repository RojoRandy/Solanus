import { ApiProperty } from '@nestjs/swagger';
import { EstadoProducto } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { CategoriaRefDto } from './producto.dto';

export class CrearVarianteDto {
  @ApiProperty()
  @IsInt()
  productoId: number;

  @ApiProperty()
  @IsInt()
  unidadId: number;

  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  @IsEnum(EstadoProducto)
  estado: EstadoProducto;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMinimo?: number;
}

export class ActualizarVarianteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMinimo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ListarVariantesQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Filtra por nombre de producto' })
  @IsOptional()
  buscar?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  unidadId?: number;

  @ApiProperty({ required: false, enum: EstadoProducto, enumName: 'EstadoProducto' })
  @IsOptional()
  @IsEnum(EstadoProducto)
  estado?: EstadoProducto;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  soloStockBajo?: boolean;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  incluirInactivas?: boolean;
}

export class ProductoRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class UnidadRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  abrevia: string;
}

export class VarianteResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ type: ProductoRefDto })
  producto: ProductoRefDto;
  @ApiProperty({ type: CategoriaRefDto })
  categoria: CategoriaRefDto;
  @ApiProperty({ type: UnidadRefDto })
  unidad: UnidadRefDto;
  @ApiProperty({ enum: EstadoProducto, enumName: 'EstadoProducto' })
  estado: EstadoProducto;
  @ApiProperty()
  stockActual: number;
  @ApiProperty()
  stockMinimo: number;
  @ApiProperty()
  stockBajo: boolean;
  @ApiProperty()
  activo: boolean;
}
