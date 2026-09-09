import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';
import { now } from '@/common/utils/date';
import { RegistrarDonativoDineroDto, DonativoDineroResponseDto } from '../dto/donativo-dinero.dto';
import { DONATIVO_DINERO_SELECT, mapDonativoDinero } from './donativo-dinero.mapper';

export interface RegistrarDonativoDineroArgs {
  dto: RegistrarDonativoDineroDto;
  registradoPorId: number;
}

/**
 * Registra un donativo en dinero. No toca inventario (ni variante, ni unidad, ni
 * MovimientoInventario): el único vínculo con el resto del sistema es el bienhechor
 * y, opcionalmente, el turno en el que se recibió.
 */
@Injectable()
export class RegistrarDonativoDineroUseCase implements UseCase<
  RegistrarDonativoDineroArgs,
  DonativoDineroResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({
    dto,
    registradoPorId,
  }: RegistrarDonativoDineroArgs): Promise<DonativoDineroResponseDto> {
    const bienhechor = await this.prisma.bienhechor.findUnique({
      where: { id: dto.bienhechorId },
    });
    if (!bienhechor)
      throw InventarioErrors.Exceptions.BIENHECHOR_NOT_FOUND({
        bienhechorId: dto.bienhechorId,
      });

    if (dto.turnoId) {
      const turno = await this.prisma.turnoComida.findUnique({
        where: { id: dto.turnoId },
      });
      if (!turno)
        throw AsistenciaErrors.Exceptions.TURNO_NOT_FOUND({ turnoId: dto.turnoId });
    }

    const fecha = dto.fecha
      ? new Date(dto.fecha)
      : now().startOf('day').toDate();

    const donativo = await this.prisma.donativoDinero.create({
      data: {
        bienhechorId: dto.bienhechorId,
        monto: dto.monto,
        fecha,
        metodoPago: dto.metodoPago,
        folioRecibo: dto.folioRecibo,
        nota: dto.nota,
        turnoId: dto.turnoId,
        registradoPorId,
      },
      select: DONATIVO_DINERO_SELECT,
    });

    return mapDonativoDinero(donativo);
  }
}
