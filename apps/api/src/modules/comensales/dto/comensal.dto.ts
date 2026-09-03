import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { HorarioComida, MetodoCaptura } from '@prisma/client';
import {
  IsBoolean,
  IsBooleanString,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class CrearComensalDto {
  @ApiProperty({ example: 'María' })
  @IsNotEmpty()
  @IsString()
  nombres: string;

  @ApiProperty({ example: 'García López' })
  @IsNotEmpty()
  @IsString()
  apellidos: string;

  @ApiProperty({ example: '2015-03-20' })
  @Type(() => Date)
  @IsDate()
  fechaNacimiento: Date;

  @ApiProperty({ required: false, example: 'GALM150320MDFRPR01' })
  @IsOptional()
  @IsString()
  curp?: string;

  @ApiProperty({
    required: false,
    description:
      'Id del comensal tutor. Obligatorio si el comensal es menor de edad.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  tutorId?: number;
}

export class ActualizarComensalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apellidos?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fechaNacimiento?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  curp?: string;

  @ApiProperty({
    required: false,
    description:
      'Id del comensal tutor. Enviar null para quitar el tutor actual.',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  tutorId?: number | null;
}

export class ListarComensalesQueryDto extends PaginationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Busca por folio, nombres o apellidos',
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

export class FirmarCartaUsoImagenDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  autoriza: boolean;
}

export class ComensalTutorResumenDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  folio: number;
  @ApiProperty()
  nombres: string;
  @ApiProperty()
  apellidos: string;
}

export class CartaUsoImagenResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  autoriza: boolean;
  @ApiProperty({ nullable: true })
  fechaFirma: Date | null;
  @ApiProperty({ nullable: true })
  firmanteId: number | null;
}

export class ComensalResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  folio: number;
  @ApiProperty()
  nombres: string;
  @ApiProperty()
  apellidos: string;
  @ApiProperty()
  fechaNacimiento: Date;
  @ApiProperty({ description: 'Edad calculada en años cumplidos' })
  edad: number;
  @ApiProperty({ nullable: true })
  curp: string | null;
  @ApiProperty({ nullable: true })
  fotoPath: string | null;
  @ApiProperty({ type: ComensalTutorResumenDto, nullable: true })
  tutor: ComensalTutorResumenDto | null;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
}

export class ComensalDetalleResponseDto extends ComensalResponseDto {
  @ApiProperty({ nullable: true })
  ineFrontPath: string | null;
  @ApiProperty({ nullable: true })
  ineBackPath: string | null;
  @ApiProperty({ type: [ComensalTutorResumenDto] })
  menores: ComensalTutorResumenDto[];
  @ApiProperty({ type: CartaUsoImagenResponseDto, nullable: true })
  cartaUsoImagen: CartaUsoImagenResponseDto | null;
  @ApiProperty()
  updatedAt: Date;
}

class AsistenciaComensalUsuarioRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class AsistenciaComensalResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  fecha: Date;
  @ApiProperty({ enum: HorarioComida, enumName: 'HorarioComida' })
  horario: HorarioComida;
  @ApiProperty({ enum: MetodoCaptura, enumName: 'MetodoCaptura' })
  metodoCaptura: MetodoCaptura;
  @ApiProperty({ type: AsistenciaComensalUsuarioRefDto })
  registradoPor: AsistenciaComensalUsuarioRefDto;
}
