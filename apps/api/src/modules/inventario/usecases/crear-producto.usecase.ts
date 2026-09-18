import { Injectable } from '@nestjs/common';
import { EstadoProducto, Prisma } from '@prisma/client';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { PrismaService } from '@/prisma/prisma.service';
import { InventarioErrors } from '@/common/errors/inventario.errors';
import { CrearProductoDto, ProductoResponseDto } from '../dto/producto.dto';
import { PRODUCTO_SELECT, mapProducto } from './producto.mapper';

/** Valida que la categoría exista antes de crear/actualizar un producto. */
export async function validarCategoria(
  prisma: Prisma.TransactionClient,
  categoriaId: number | undefined,
): Promise<void> {
  if (categoriaId === undefined) return;
  const categoria = await prisma.categoriaInventario.findUnique({
    where: { id: categoriaId },
  });
  if (!categoria)
    throw InventarioErrors.Exceptions.CATEGORIA_NOT_FOUND({ categoriaId });
}

@Injectable()
export class CrearProductoUseCase implements UseCase<
  CrearProductoDto,
  ProductoResponseDto
> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CrearProductoDto): Promise<ProductoResponseDto> {
    await validarCategoria(this.prisma, dto.categoriaId);

    const unidad = await this.prisma.unidadMedida.findUnique({
      where: { id: dto.unidadId },
    });
    if (!unidad)
      throw InventarioErrors.Exceptions.UNIDAD_NOT_FOUND({
        unidadId: dto.unidadId,
      });

    if (unidad.indicarContenido) {
      if (dto.contenidoCantidad == null || dto.contenidoUnidadId == null)
        throw InventarioErrors.Exceptions.CONTENIDO_REQUERIDO();
    } else if (dto.contenidoCantidad != null || dto.contenidoUnidadId != null) {
      throw InventarioErrors.Exceptions.CONTENIDO_NO_APLICA();
    }

    // TODO(4.4): eliminar estas validaciones de registrar-entrada.usecase.ts en el siguiente paso.
    if (dto.estado === EstadoProducto.COCIDO && dto.marca)
      throw InventarioErrors.Exceptions.MARCA_NO_PERMITIDA_EN_COCIDO();
    if (dto.granel && dto.marca)
      throw InventarioErrors.Exceptions.MARCA_NO_PERMITIDA_EN_GRANEL();

    // ponytail: validación de aplicación, sin @@unique de BD: las columnas nulables
    // (marca y contenido) permiten duplicados en PostgreSQL (NULL ≠ NULL).
    // Hay una carrera entre capturas simultáneas, aceptable con 3 capturistas.
    const existente = await this.prisma.producto.findFirst({
      where: {
        nombre: dto.nombre,
        categoriaId: dto.categoriaId,
        unidadId: dto.unidadId,
        estado: dto.estado,
        marca: dto.marca ?? null,
        contenidoCantidad: dto.contenidoCantidad ?? null,
        contenidoUnidadId: dto.contenidoUnidadId ?? null,
      },
    });
    if (existente)
      throw InventarioErrors.Exceptions.PRODUCTO_DUPLICADO({
        nombre: dto.nombre,
        categoriaId: dto.categoriaId,
      });

    const producto = await this.prisma.producto.create({
      data: {
        unidadId: dto.unidadId,
        estado: dto.estado,
        marca: dto.marca ?? null,
        granel: dto.granel ?? false,
        contenidoCantidad: dto.contenidoCantidad ?? null,
        contenidoUnidadId: dto.contenidoUnidadId ?? null,
        nombre: dto.nombre,
        categoriaId: dto.categoriaId,
      },
      select: PRODUCTO_SELECT,
    });

    return mapProducto(producto);
  }
}
