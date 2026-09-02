import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CrearInventarioItemDto {
  @ApiProperty({ example: 'Frijol bayo' })
  @IsString()
  nombre: string;

  @ApiProperty({ required: false, example: 'La Costeña' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoriaId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  unidadId: number;

  @ApiProperty({ required: false, example: 'Bolsa de 1kg' })
  @IsOptional()
  @IsString()
  presentacion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ubicacionId?: number;

  @ApiProperty({ required: false, default: 0, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockMinimo?: number;
}

export class ActualizarInventarioItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  unidadId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  presentacion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  ubicacionId?: number;

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

export class ListarInventarioItemsQueryDto {
  @ApiProperty({ required: false, description: 'Filtra por nombre o marca' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  incluirInactivos?: boolean;
}

class CategoriaRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

class UnidadRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  abrevia: string;
}

class UbicacionRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class InventarioItemResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty({ required: false, nullable: true })
  marca: string | null;
  @ApiProperty({ required: false, nullable: true })
  codigoBarras: string | null;
  @ApiProperty({ type: CategoriaRefDto })
  categoria: CategoriaRefDto;
  @ApiProperty({ type: UnidadRefDto })
  unidad: UnidadRefDto;
  @ApiProperty({ required: false, nullable: true })
  presentacion: string | null;
  @ApiProperty({ type: UbicacionRefDto, required: false, nullable: true })
  ubicacion: UbicacionRefDto | null;
  @ApiProperty()
  stockMinimo: number;
  @ApiProperty()
  stockActual: number;
  @ApiProperty()
  stockBajo: boolean;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
}
