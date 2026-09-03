import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import {
  ActualizarCategoriaDto,
  ActualizarUnidadDto,
  CategoriaInventarioResponseDto,
  CrearCategoriaDto,
  CrearUnidadDto,
  UnidadMedidaResponseDto,
} from '../dto/catalogos.dto';

export interface ActualizarCatalogoArgs<D> {
  id: number;
  dto: D;
}

// ── Unidades de medida ──────────────────────────────────────────

@Injectable()
export class CrearUnidadUseCase implements UseCase<CrearUnidadDto, UnidadMedidaResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearUnidadDto): Promise<UnidadMedidaResponseDto> {
    const existente = await this.prisma.unidadMedida.findFirst({
      where: { OR: [{ nombre: dto.nombre }, { abrevia: dto.abrevia }] },
    });
    if (existente) throw InventarioErrors.Exceptions.UNIDAD_DUPLICADA(dto);

    return this.prisma.unidadMedida.create({
      data: dto,
      select: { id: true, nombre: true, abrevia: true, activo: true },
    });
  }
}

@Injectable()
export class ActualizarUnidadUseCase implements UseCase<
  ActualizarCatalogoArgs<ActualizarUnidadDto>,
  UnidadMedidaResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, dto }: ActualizarCatalogoArgs<ActualizarUnidadDto>): Promise<UnidadMedidaResponseDto> {
    const existente = await this.prisma.unidadMedida.findUnique({ where: { id } });
    if (!existente) throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({ id });

    return this.prisma.unidadMedida.update({
      where: { id },
      data: dto,
      select: { id: true, nombre: true, abrevia: true, activo: true },
    });
  }
}

@Injectable()
export class EliminarUnidadUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const unidad = await this.prisma.unidadMedida.findUnique({ where: { id } });
    if (!unidad) throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({ id });

    const enUso = await this.prisma.varianteInventario.findFirst({ where: { unidadId: id } });
    if (enUso) throw InventarioErrors.Exceptions.UNIDAD_EN_USO({ id });

    await this.prisma.unidadMedida.update({ where: { id }, data: { activo: false } });
  }
}

// ── Categorías de productos ─────────────────────────────────────

@Injectable()
export class CrearCategoriaUseCase implements UseCase<CrearCategoriaDto, CategoriaInventarioResponseDto> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearCategoriaDto): Promise<CategoriaInventarioResponseDto> {
    const existente = await this.prisma.categoriaInventario.findUnique({ where: { nombre: dto.nombre } });
    if (existente) throw InventarioErrors.Exceptions.CATEGORIA_DUPLICADA(dto);

    return this.prisma.categoriaInventario.create({
      data: dto,
      select: { id: true, nombre: true, activo: true },
    });
  }
}

@Injectable()
export class ActualizarCategoriaUseCase implements UseCase<
  ActualizarCatalogoArgs<ActualizarCategoriaDto>,
  CategoriaInventarioResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ id, dto }: ActualizarCatalogoArgs<ActualizarCategoriaDto>): Promise<CategoriaInventarioResponseDto> {
    const existente = await this.prisma.categoriaInventario.findUnique({ where: { id } });
    if (!existente) throw InventarioErrors.Exceptions.CATEGORIA_NOT_FOUND({ id });

    return this.prisma.categoriaInventario.update({
      where: { id },
      data: dto,
      select: { id: true, nombre: true, activo: true },
    });
  }
}

@Injectable()
export class EliminarCategoriaUseCase implements UseCase<number, void> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number): Promise<void> {
    const categoria = await this.prisma.categoriaInventario.findUnique({ where: { id } });
    if (!categoria) throw InventarioErrors.Exceptions.CATEGORIA_NOT_FOUND({ id });

    const enUso = await this.prisma.producto.findFirst({ where: { categoriaId: id } });
    if (enUso) throw InventarioErrors.Exceptions.CATEGORIA_EN_USO({ id });

    await this.prisma.categoriaInventario.update({ where: { id }, data: { activo: false } });
  }
}
