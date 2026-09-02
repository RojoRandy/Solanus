import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CrearBienhechorDto {
  @ApiProperty({ example: 'Central de Abasto A.C.' })
  @IsString()
  nombre: string;

  @ApiProperty({ required: false, example: '55 1234 5678' })
  @IsOptional()
  @IsString()
  contacto?: string;

  @ApiProperty({ required: false, example: 'XAXX010101000' })
  @IsOptional()
  @IsString()
  rfc?: string;
}

export class ActualizarBienhechorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contacto?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rfc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ListarBienhechoresQueryDto {
  @ApiProperty({ required: false, description: 'Filtra por nombre' })
  @IsOptional()
  @IsString()
  buscar?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  incluirInactivos?: boolean;
}

export class BienhechorResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
  @ApiProperty({ required: false, nullable: true })
  contacto: string | null;
  @ApiProperty({ required: false, nullable: true })
  rfc: string | null;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
}
