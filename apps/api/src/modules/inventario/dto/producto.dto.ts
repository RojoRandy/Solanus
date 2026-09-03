import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/**
 * El producto es solo "qué cosa es": nombre y categoría. Marca, presentación,
 * ubicación, unidad de medida y si es crudo/cocido cambian en cada entrada,
 * así que se capturan en el lote (ver RegistrarEntradaDto), no aquí.
 */
export class CrearProductoDto {
  @ApiProperty({ example: 'Frijol bayo' })
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoriaId: number;
}

export class ActualizarProductoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

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

export class ProductoResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty({ required: false, nullable: true })
  codigoBarras: string | null;
  @ApiProperty({ type: CategoriaRefDto })
  categoria: CategoriaRefDto;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
}
