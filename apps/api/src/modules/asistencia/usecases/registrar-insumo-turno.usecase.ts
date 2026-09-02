import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { AsistenciaErrors } from '@/common/errors/asistencia.errors';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  RegistrarSalidaInventarioUseCase,
  RegistrarSalidaResultado,
} from '../../inventario/usecases/registrar-salida.usecase';

export interface RegistrarInsumoTurnoArgs {
  turnoId: number;
  itemId: number;
  cantidad: number;
  motivoId?: number;
  notas?: string;
  registradoPorId: number;
}

const MOTIVO_CONSUMO_DEFAULT = 'Consumo en comida';

/**
 * "Registro de insumos utilizados del almacén" de la hoja de papel — descuenta
 * inventario automáticamente al servir la comida. Reutiliza tal cual el caso de
 * uso transaccional de Inventario (Fase 2): no duplica la lógica FEFO de
 * descuento, solo resuelve el motivo por defecto y ata el turnoId.
 */
@Injectable()
export class RegistrarInsumoTurnoUseCase implements UseCase<
  RegistrarInsumoTurnoArgs,
  RegistrarSalidaResultado
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registrarSalida: RegistrarSalidaInventarioUseCase,
  ) {}

  async execute({
    turnoId,
    itemId,
    cantidad,
    motivoId,
    notas,
    registradoPorId,
  }: RegistrarInsumoTurnoArgs): Promise<RegistrarSalidaResultado> {
    const turno = await this.prisma.turnoComida.findUnique({
      where: { id: turnoId },
    });
    if (!turno) throw AsistenciaErrors.Exceptions.TURNO_NOT_FOUND({ turnoId });

    let motivoResuelto = motivoId;
    if (!motivoResuelto) {
      const motivo = await this.prisma.motivoMovimiento.findUnique({
        where: { nombre: MOTIVO_CONSUMO_DEFAULT },
      });
      if (!motivo)
        throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({
          nombre: MOTIVO_CONSUMO_DEFAULT,
        });
      motivoResuelto = motivo.id;
    }

    return this.registrarSalida.execute({
      itemId,
      cantidad,
      motivoId: motivoResuelto,
      turnoId,
      registradoPorId,
      notas,
    });
  }
}
