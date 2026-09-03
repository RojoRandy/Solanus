import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { CrearVarianteDto, VarianteResponseDto } from '../dto/variante.dto';
import { VARIANTE_SELECT_CON_LOTES, mapVariante } from './variante.mapper';

@Injectable()
export class CrearVarianteUseCase implements UseCase<CrearVarianteDto, VarianteResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearVarianteDto): Promise<VarianteResponseDto> {
    const producto = await this.prisma.producto.findUnique({ where: { id: dto.productoId } });
    if (!producto) throw InventarioErrors.Exceptions.PRODUCTO_NOT_FOUND({ id: dto.productoId });

    const unidad = await this.prisma.unidadMedida.findUnique({ where: { id: dto.unidadId } });
    if (!unidad) throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({ unidadId: dto.unidadId });

    const existente = await this.prisma.varianteInventario.findUnique({
      where: {
        productoId_unidadId_estado: {
          productoId: dto.productoId,
          unidadId: dto.unidadId,
          estado: dto.estado,
        },
      },
    });
    if (existente)
      throw InventarioErrors.Exceptions.VARIANTE_DUPLICADA({
        productoId: dto.productoId,
        unidadId: dto.unidadId,
        estado: dto.estado,
      });

    const variante = await this.prisma.varianteInventario.create({
      data: {
        productoId: dto.productoId,
        unidadId: dto.unidadId,
        estado: dto.estado,
        stockMinimo: dto.stockMinimo ?? 0,
      },
      select: VARIANTE_SELECT_CON_LOTES,
    });

    return mapVariante(variante);
  }
}
