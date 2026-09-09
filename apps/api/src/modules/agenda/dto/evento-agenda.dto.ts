import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsBooleanString,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { colorEventoRegex } from '@/common/utils/agenda';

const COLOR_MENSAJE_ERROR = 'El color debe ser un hexadecimal válido, por ejemplo #22C55E';

export class CrearEventoAgendaDto {
  @ApiProperty({ example: '2026-08-13T11:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  fechaHora: string;

  @ApiProperty({ example: 'Entrega de despensas' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  descripcion: string;

  @ApiProperty({ example: '#22C55E', description: COLOR_MENSAJE_ERROR })
  @IsNotEmpty()
  @IsString()
  @Matches(colorEventoRegex, { message: COLOR_MENSAJE_ERROR })
  color: string;
}

export class ActualizarEventoAgendaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fechaHora?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion?: string;

  @ApiProperty({ required: false, description: COLOR_MENSAJE_ERROR })
  @IsOptional()
  @IsString()
  @Matches(colorEventoRegex, { message: COLOR_MENSAJE_ERROR })
  color?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ListarEventosAgendaQueryDto {
  @ApiProperty({
    required: false,
    enum: ['proximos', 'pasados'],
    default: 'proximos',
  })
  @IsOptional()
  @IsIn(['proximos', 'pasados'])
  filtro?: 'proximos' | 'pasados';

  @ApiProperty({
    required: false,
    description: "'true' o 'false'",
    default: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  activo?: string;
}

export class EventoAgendaResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  fechaHora: Date;
  @ApiProperty()
  descripcion: string;
  @ApiProperty()
  color: string;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
