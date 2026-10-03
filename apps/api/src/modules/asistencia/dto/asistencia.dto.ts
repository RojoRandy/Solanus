import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { MetodoCaptura } from '@prisma/client';

export class RegistrarAsistenciaDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  comensalId: number;

  @ApiProperty({
    enum: MetodoCaptura,
    enumName: 'MetodoCaptura',
    default: MetodoCaptura.FOLIO,
  })
  @IsOptional()
  @IsEnum(MetodoCaptura)
  metodoCaptura?: MetodoCaptura;
}

export class RegistrarPrimeraVezDto {
  @ApiProperty({ example: 'Juan Pérez', maxLength: 120 })
  @IsString()
  @Matches(/\S/, { message: 'El nombre es obligatorio' })
  @MaxLength(120)
  nombre: string;
}

export class AsignarVoluntarioDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  voluntarioId: number;
}

export class RegistrarInsumoTurnoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  varianteId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  cantidad: number;

  @ApiProperty({
    required: false,
    description: 'Motivo del movimiento; por defecto "Consumo en comida"',
  })
  @IsOptional()
  @IsInt()
  motivoId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  notas?: string;
}
