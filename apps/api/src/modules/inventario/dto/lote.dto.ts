import { ApiProperty } from '@nestjs/swagger';
import { OrigenLote } from '@prisma/client';

class LoteBienhechorRefDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  nombre: string;
}

export class LoteVivoResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ nullable: true })
  marca: string | null;
  @ApiProperty()
  cantidadDisponible: number;
  @ApiProperty({ nullable: true })
  fechaCaducidad: Date | null;
  @ApiProperty()
  fechaIngreso: Date;
  @ApiProperty({ nullable: true })
  costoUnitario: number | null;
  @ApiProperty({ enum: OrigenLote, enumName: 'OrigenLote' })
  origen: OrigenLote;
  @ApiProperty({ type: LoteBienhechorRefDto, nullable: true })
  bienhechor: LoteBienhechorRefDto | null;
}
