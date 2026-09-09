import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { HorarioComida, MetodoPagoDonativo } from '@prisma/client';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class RegistrarDonativoDineroDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  bienhechorId: number;

  @ApiProperty({ example: 1500.5, description: 'Monto en pesos, hasta 2 decimales' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto: number;

  @ApiProperty({ required: false, description: 'YYYY-MM-DD; por defecto hoy' })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ enum: MetodoPagoDonativo, enumName: 'MetodoPagoDonativo' })
  @IsEnum(MetodoPagoDonativo)
  metodoPago: MetodoPagoDonativo;

  @ApiProperty({ required: false, description: 'Folio del recibo entregado al bienhechor' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  folioRecibo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;

  @ApiProperty({
    required: false,
    description: 'Turno en el que se recibió, cuando se captura desde Asistencia',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  turnoId?: number;
}

export class ListarDonativosDineroQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bienhechorId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  turnoId?: number;

  @ApiProperty({ required: false, enum: MetodoPagoDonativo, enumName: 'MetodoPagoDonativo' })
  @IsOptional()
  @IsEnum(MetodoPagoDonativo)
  metodoPago?: MetodoPagoDonativo;

  @ApiProperty({ required: false, description: 'Desde (YYYY-MM-DD), inclusive' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiProperty({ required: false, description: 'Hasta (YYYY-MM-DD), inclusive' })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}

class DonativoBienhechorRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

class DonativoTurnoRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  fecha: Date;
  @ApiProperty({ enum: HorarioComida, enumName: 'HorarioComida' })
  horario: HorarioComida;
}

class DonativoRegistradoPorRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class DonativoDineroResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  monto: number;
  @ApiProperty({ description: 'Fecha del donativo en formato YYYY-MM-DD' })
  fecha: string;
  @ApiProperty({ enum: MetodoPagoDonativo, enumName: 'MetodoPagoDonativo' })
  metodoPago: MetodoPagoDonativo;
  @ApiProperty({ required: false, nullable: true })
  folioRecibo: string | null;
  @ApiProperty({ required: false, nullable: true })
  nota: string | null;
  @ApiProperty({ type: DonativoBienhechorRefDto })
  bienhechor: DonativoBienhechorRefDto;
  @ApiProperty({ type: DonativoTurnoRefDto, nullable: true })
  turno: DonativoTurnoRefDto | null;
  @ApiProperty({ type: DonativoRegistradoPorRefDto })
  registradoPor: DonativoRegistradoPorRefDto;
  @ApiProperty()
  createdAt: Date;
}

export class ListaDonativosDineroResponseDto {
  @ApiProperty({ type: [DonativoDineroResponseDto] })
  items: DonativoDineroResponseDto[];
  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
  };
  @ApiProperty({ description: 'Suma de todos los donativos que cumplen el filtro, no solo la página' })
  totalMonto: number;
}
