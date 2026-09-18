import { EstadoProducto } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CrearProductoDto } from '../dto/producto.dto';
import { CrearProductoUseCase } from './crear-producto.usecase';

// Mock manual: las validaciones se prueban sin conexión a la base de datos.
function crearPrismaMock(indicarContenido = false, duplicado = false) {
  const producto = {
    findFirst: jest.fn().mockResolvedValue(duplicado ? { id: 1 } : null),
    create: jest.fn(),
  };
  const prisma = {
    categoriaInventario: {
      findUnique: jest.fn().mockResolvedValue({ id: 1 }),
    },
    unidadMedida: {
      findUnique: jest.fn().mockResolvedValue({ id: 2, indicarContenido }),
    },
    producto,
  } as unknown as PrismaService;
  return { prisma, producto };
}

describe('CrearProductoUseCase', () => {
  const dto: CrearProductoDto = {
    nombre: 'Frijol bayo',
    categoriaId: 1,
    unidadId: 2,
    estado: EstadoProducto.NO_APLICA,
  };

  it('lanza CONTENIDO_REQUERIDO si la unidad requiere contenido y no se indica', async () => {
    const { prisma, producto } = crearPrismaMock(true);
    await expect(
      new CrearProductoUseCase(prisma).execute(dto),
    ).rejects.toMatchObject({
      response: { code: 'CONTENIDO_REQUERIDO' },
    });
    expect(producto.create).not.toHaveBeenCalled();
  });

  it('lanza CONTENIDO_NO_APLICA si la unidad no admite contenido y se indica cantidad', async () => {
    const { prisma, producto } = crearPrismaMock();
    await expect(
      new CrearProductoUseCase(prisma).execute({
        ...dto,
        contenidoCantidad: 1,
      }),
    ).rejects.toMatchObject({
      response: { code: 'CONTENIDO_NO_APLICA' },
    });
    expect(producto.create).not.toHaveBeenCalled();
  });

  it('lanza MARCA_NO_PERMITIDA_EN_COCIDO para un producto cocido con marca', async () => {
    const { prisma, producto } = crearPrismaMock();
    await expect(
      new CrearProductoUseCase(prisma).execute({
        ...dto,
        estado: EstadoProducto.COCIDO,
        marca: 'Marca',
      }),
    ).rejects.toMatchObject({
      response: { code: 'MARCA_NO_PERMITIDA_EN_COCIDO' },
    });
    expect(producto.create).not.toHaveBeenCalled();
  });

  it('lanza PRODUCTO_DUPLICADO cuando existe la tupla completa de la presentación', async () => {
    const { prisma, producto } = crearPrismaMock(true, true);
    const presentacion = {
      ...dto,
      marca: 'Marca',
      contenidoCantidad: 1,
      contenidoUnidadId: 3,
    };
    await expect(
      new CrearProductoUseCase(prisma).execute(presentacion),
    ).rejects.toMatchObject({
      response: { code: 'PRODUCTO_DUPLICADO' },
    });
    expect(producto.findFirst).toHaveBeenCalledWith({ where: presentacion });
    expect(producto.create).not.toHaveBeenCalled();
  });
});
