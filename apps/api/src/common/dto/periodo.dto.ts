import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Query de periodo mensual reutilizable: `?anio=2026&mes=9`. Ver `resolverPeriodoMensual`. */
export class PeriodoMensualQueryDto {
  @ApiProperty({ required: false, description: 'Por defecto, el año en curso' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio?: number;

  @ApiProperty({ required: false, description: 'Por defecto, el mes en curso (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;
}
