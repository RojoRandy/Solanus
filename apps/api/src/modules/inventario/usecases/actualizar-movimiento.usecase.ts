import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { ActualizarMovimientoDto, MovimientoResponseDto } from '../dto/movimiento.dto';

export interface ActualizarMovimientoArgs {
  id: number;
  dto: ActualizarMovimientoDto;
  editadoPorId: number;
}

/**
 * Solo toca fecha, motivo y notas — la cantidad y la variante del movimiento
 * son inmutables (para corregir una cantidad se registra un AJUSTE, ver
 * registrar-ajuste.usecase.ts). Deja constancia de quién editó.
 */
@Injectable()
export class ActualizarMovimientoUseCase implements UseCase<
  ActualizarMovimientoArgs,
  MovimientoResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, dto, editadoPorId }: ActualizarMovimientoArgs): Promise<MovimientoResponseDto> {
    const existente = await this.prisma.movimientoInventario.findUnique({ where: { id } });
    if (!existente) throw InventarioErrors.Exceptions.MOVIMIENTO_NOT_FOUND({ id });

    if (dto.motivoId !== undefined) {
      const motivo = await this.prisma.motivoMovimiento.findUnique({ where: { id: dto.motivoId } });
      if (!motivo) throw InventarioErrors.Exceptions.MOTIVO_NOT_FOUND({ motivoId: dto.motivoId });
    }

    const movimiento = await this.prisma.movimientoInventario.update({
      where: { id },
      data: {
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        motivoId: dto.motivoId,
        notas: dto.notas,
        editadoPorId,
      },
      select: {
        id: true,
        loteId: true,
        tipo: true,
        cantidad: true,
        turnoId: true,
        fecha: true,
        notas: true,
        editadoPorId: true,
        variante: {
          select: {
            id: true,
            estado: true,
            producto: { select: { id: true, nombre: true } },
            unidad: { select: { id: true, abrevia: true } },
          },
        },
        motivo: { select: { id: true, nombre: true } },
        registradoPor: { select: { id: true, nombre: true } },
      },
    });

    return {
      id: movimiento.id,
      producto: movimiento.variante.producto,
      variante: {
        id: movimiento.variante.id,
        estado: movimiento.variante.estado,
        unidad: movimiento.variante.unidad,
      },
      loteId: movimiento.loteId,
      tipo: movimiento.tipo,
      motivo: movimiento.motivo,
      cantidad: Number(movimiento.cantidad),
      turnoId: movimiento.turnoId,
      registradoPor: movimiento.registradoPor,
      fecha: movimiento.fecha,
      notas: movimiento.notas,
      editado: movimiento.editadoPorId !== null,
    };
  }
}
