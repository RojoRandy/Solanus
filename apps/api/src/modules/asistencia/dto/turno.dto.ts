import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { HorarioComida, MetodoCaptura } from '@prisma/client';

export class ObtenerTurnoQueryDto {
  @ApiProperty({
    example: '2026-09-02',
    description: 'Fecha (ISO), por defecto hoy',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ enum: HorarioComida, enumName: 'HorarioComida' })
  @IsEnum(HorarioComida)
  horario: HorarioComida;
}

export class ListarTurnosQueryDto {
  @ApiProperty({
    example: '2026-09-02',
    description: 'Fecha (ISO), por defecto hoy',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;
}

export class ActualizarTurnoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  menu?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}

class ComensalRefDto {
  @ApiProperty() id: number;
  @ApiProperty() folio: number;
  @ApiProperty() nombres: string;
  @ApiProperty() apellidos: string;
  @ApiProperty({ nullable: true }) fotoPath: string | null;
}

class VoluntarioRefDto {
  @ApiProperty() id: number;
  @ApiProperty() nombres: string;
  @ApiProperty() apellidos: string;
  @ApiProperty({ nullable: true }) fotoPath: string | null;
}

export class AsistenciaResponseDto {
  @ApiProperty() id: number;
  @ApiProperty({ type: ComensalRefDto }) comensal: ComensalRefDto;
  @ApiProperty({ enum: MetodoCaptura, enumName: 'MetodoCaptura' })
  metodoCaptura: MetodoCaptura;
  @ApiProperty() createdAt: Date;
}

export class TurnoVoluntarioResponseDto {
  @ApiProperty() id: number;
  @ApiProperty({ type: VoluntarioRefDto }) voluntario: VoluntarioRefDto;
}

export class TurnoResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() fecha: Date;
  @ApiProperty({ enum: HorarioComida, enumName: 'HorarioComida' })
  horario: HorarioComida;
  @ApiProperty({ nullable: true }) menu: string | null;
  @ApiProperty({ nullable: true }) notas: string | null;
  @ApiProperty() totalAsistencias: number;
  @ApiProperty({ type: [AsistenciaResponseDto] })
  asistencias: AsistenciaResponseDto[];
  @ApiProperty({ type: [TurnoVoluntarioResponseDto] })
  voluntarios: TurnoVoluntarioResponseDto[];
}

export class TurnoResumenResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() fecha: Date;
  @ApiProperty({ enum: HorarioComida, enumName: 'HorarioComida' })
  horario: HorarioComida;
  @ApiProperty() totalAsistencias: number;
}
