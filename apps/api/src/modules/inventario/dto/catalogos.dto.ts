import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CategoriaInventarioResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  activo: boolean;
}

export class CrearCategoriaDto {
  @ApiProperty({ example: 'Enlatados' })
  @IsString()
  nombre: string;
}

export class ActualizarCategoriaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UnidadMedidaResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  abrevia: string;
  @ApiProperty()
  activo: boolean;
}

export class CrearUnidadDto {
  @ApiProperty({ example: 'Kilogramo' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  abrevia: string;
}

export class ActualizarUnidadDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  abrevia?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class MotivoMovimientoResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  clave: string;
  @ApiProperty()
  esMerma: boolean;
}
