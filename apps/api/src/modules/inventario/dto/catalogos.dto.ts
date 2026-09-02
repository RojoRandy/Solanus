import { ApiProperty } from '@nestjs/swagger';

export class CategoriaInventarioResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class UnidadMedidaResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty()
  abrevia: string;
}

export class UbicacionResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class MotivoMovimientoResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}
