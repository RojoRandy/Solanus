import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CategoriaInventarioResponseDto,
  MotivoMovimientoResponseDto,
  UbicacionResponseDto,
  UnidadMedidaResponseDto,
} from '../dto/catalogos.dto';

/** Catálogos simples de solo lectura (§ ya sembrados por prisma/seed.ts) — sin CRUD en esta fase. */

@Injectable()
export class ListarCategoriasUseCase implements UseCase<
  void,
  CategoriaInventarioResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<CategoriaInventarioResponseDto[]> {
    return this.prisma.categoriaInventario.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    });
  }
}

@Injectable()
export class ListarUnidadesUseCase implements UseCase<
  void,
  UnidadMedidaResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<UnidadMedidaResponseDto[]> {
    return this.prisma.unidadMedida.findMany({
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true, abrevia: true },
    });
  }
}

@Injectable()
export class ListarUbicacionesUseCase implements UseCase<
  void,
  UbicacionResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<UbicacionResponseDto[]> {
    return this.prisma.ubicacion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    });
  }
}

@Injectable()
export class ListarMotivosUseCase implements UseCase<
  void,
  MotivoMovimientoResponseDto[]
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<MotivoMovimientoResponseDto[]> {
    return this.prisma.motivoMovimiento.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: { id: true, nombre: true },
    });
  }
}
