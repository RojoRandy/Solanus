import { ApiProperty } from '@nestjs/swagger';

class EvidenciaUsuarioRefDto {
  @ApiProperty() id: number;
  @ApiProperty() nombre: string;
}

export class EvidenciaResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() anio: number;
  @ApiProperty() mes: number;
  @ApiProperty() rutaArchivo: string;
  @ApiProperty({ type: EvidenciaUsuarioRefDto }) subidoPor: EvidenciaUsuarioRefDto;
  @ApiProperty() createdAt: Date;
}
