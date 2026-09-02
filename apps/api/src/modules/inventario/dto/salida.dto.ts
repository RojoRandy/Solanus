import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class RegistrarSalidaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  itemId: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsPositive()
  cantidad: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  motivoId: number;

  @ApiProperty({
    required: false,
    description:
      'Turno de comida asociado (lo usa el módulo de Asistencia al descontar por servicio)',
  })
  @IsOptional()
  @IsInt()
  turnoId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
