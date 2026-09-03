import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ProximoAVencerResponseDto,
  StockBajoResponseDto,
} from '../../inventario/dto/reportes.dto';

export class ResumenDashboardQueryDto {
  @ApiProperty({
    required: false,
    default: 15,
    description: 'Umbral de días para "próximos a vencer"',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  diasVencimiento?: number;
}

class AsistenciaResumenDto {
  @ApiProperty() hoy: number;
  @ApiProperty() promedioUltimos7Dias: number;
  @ApiProperty() desayunoHoy: number;
  @ApiProperty() comidaHoy: number;
  @ApiProperty() cenaHoy: number;
}

class DonativosResumenDto {
  @ApiProperty() totalLotes: number;
  @ApiProperty() valorEstimado: number;
}

export class ResumenDashboardResponseDto {
  @ApiProperty() totalComensales: number;
  @ApiProperty({ type: [ProximoAVencerResponseDto] })
  proximosAVencer: ProximoAVencerResponseDto[];
  @ApiProperty({ type: [StockBajoResponseDto] })
  stockBajo: StockBajoResponseDto[];
  @ApiProperty({ type: AsistenciaResumenDto }) asistencia: AsistenciaResumenDto;
  @ApiProperty({ type: DonativosResumenDto })
  donativosDelMes: DonativosResumenDto;
}
