import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { telefonoMxRegex } from '@/common/utils/regex';

const TELEFONO_MENSAJE_ERROR =
  'El teléfono debe tener 10 dígitos numéricos, sin espacios ni guiones';

export class CrearVoluntarioDto {
  @ApiProperty({ example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  nombres: string;

  @ApiProperty({ example: 'Pérez López' })
  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @ApiProperty({ example: '5512345678', description: TELEFONO_MENSAJE_ERROR })
  @IsNotEmpty()
  @IsString()
  @Matches(telefonoMxRegex, { message: TELEFONO_MENSAJE_ERROR })
  telefono: string;
}

export class ActualizarVoluntarioDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellidos?: string;

  @ApiProperty({ required: false, description: TELEFONO_MENSAJE_ERROR })
  @IsOptional()
  @IsString()
  @Matches(telefonoMxRegex, { message: TELEFONO_MENSAJE_ERROR })
  telefono?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ListarVoluntariosQueryDto {
  @ApiProperty({
    required: false,
    description: 'Busca por nombres o apellidos',
  })
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiProperty({
    required: false,
    description: "'true' o 'false'",
    default: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  activo?: string;
}

export class VoluntarioResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombres: string;
  @ApiProperty()
  apellidos: string;
  @ApiProperty()
  telefono: string;
  @ApiProperty({ nullable: true })
  fotoPath: string | null;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
