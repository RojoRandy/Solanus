import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'distintoDeCero', async: false })
class DistintoDeCeroConstraint implements ValidatorConstraintInterface {
  validate(valor: number): boolean {
    return typeof valor === 'number' && valor !== 0;
  }
  defaultMessage(): string {
    return 'cantidad no puede ser cero';
  }
}

/**
 * Único camino para corregir una existencia sin tocar el histórico: la cantidad
 * lleva signo (positiva = se agrega a un lote, negativa = se descuenta con FEFO).
 */
export class RegistrarAjusteDto {
  @ApiProperty()
  @IsInt()
  varianteId: number;

  @ApiProperty({ description: 'Delta con signo; no puede ser cero' })
  @IsNumber()
  @Validate(DistintoDeCeroConstraint)
  cantidad: number;

  @ApiProperty()
  @IsInt()
  motivoId: number;

  @ApiProperty({
    required: false,
    description: 'Requerido cuando la cantidad es positiva (a qué lote se agrega)',
  })
  @IsOptional()
  @IsInt()
  loteId?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notas: string;
}
