import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { EstadoProducto } from '@prisma/client';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/** El producto identifica una presentación única del catálogo. */
export class CrearProductoDto {
  @ApiProperty({ required: false, nullable: true, example: '50221200' })
  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'La clave SAT debe tener 8 dígitos' })
  claveSat?: string | null;

  @ApiProperty({ example: 'Frijol bayo' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoriaId: number;

  @ApiProperty()
  @IsInt()
  unidadId: number;

  @ApiProperty({ enum: EstadoProducto })
  @IsEnum(EstadoProducto)
  estado: EstadoProducto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  granel?: boolean = false;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  contenidoCantidad?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  contenidoUnidadId?: number;
}

export class ActualizarProductoDto {
  @ApiProperty({ required: false, nullable: true, example: '50221200' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @Matches(/^\d{8}$/, { message: 'La clave SAT debe tener 8 dígitos' })
  claveSat?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  unidadId?: number;

  @ApiProperty({ required: false, enum: EstadoProducto })
  @IsOptional()
  @IsEnum(EstadoProducto)
  estado?: EstadoProducto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  granel?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  contenidoCantidad?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  contenidoUnidadId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ListarProductosQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false, description: 'Filtra por nombre' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  categoriaId?: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  incluirInactivos?: boolean;
}

export class CategoriaRefDto {
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

export class ContenidoProductoDto {
  @ApiProperty()
  cantidad: number;
  @ApiProperty({ type: UnidadRefDto })
  unidad: UnidadRefDto;
}

export class ProductoResponseDto {
  @ApiProperty({ type: String, nullable: true, example: '50221200' })
  claveSat: string | null;

  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty({ type: CategoriaRefDto })
  categoria: CategoriaRefDto;
  @ApiProperty({ type: UnidadRefDto })
  unidad: UnidadRefDto;
  @ApiProperty({ enum: EstadoProducto })
  estado: EstadoProducto;
  @ApiProperty({ type: String, nullable: true })
  marca: string | null;
  @ApiProperty()
  granel: boolean;
  @ApiProperty({ type: ContenidoProductoDto, nullable: true })
  contenido: ContenidoProductoDto | null;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
}

export class ListarClavesSatQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  buscar?: string;
}

export class ClaveSatResponseDto {
  @ApiProperty()
  clave: string;

  @ApiProperty()
  descripcion: string;
}
