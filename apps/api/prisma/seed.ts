import { PrismaClient, OrigenLote, HorarioComida, EstadoProducto } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, await bcrypt.genSalt(10));
}

async function main() {
  console.log('Sembrando datos de ejemplo del Comedor Solanus...');

  // ── Usuarios (uno por rol) ──────────────────────────────────
  await prisma.usuario.createMany({
    data: [
      { username: 'admin', nombre: 'Administrador General', rol: 'ADMINISTRADOR', password: await hash('Solanus2026!') },
      { username: 'operativo', nombre: 'Coordinador Operativo', rol: 'USUARIO', password: await hash('Solanus2026!') },
      { username: 'captura', nombre: 'Voluntario de Captura', rol: 'USUARIO_SIMPLE', password: await hash('Solanus2026!') },
    ],
    skipDuplicates: true,
  });
  const admin = await prisma.usuario.findUniqueOrThrow({ where: { username: 'admin' } });

  // ── Catálogos de inventario (valores reales del Excel de donativos) ──
  const categorias = await Promise.all(
    ['Productos de Despensa', 'Frutas y verduras', 'Limpieza', 'Utensilios', 'Lácteos y embutidos'].map((nombre) =>
      prisma.categoriaInventario.upsert({ where: { nombre }, update: {}, create: { nombre } }),
    ),
  );
  const unidades = await Promise.all(
    [
      { nombre: 'Pieza', abrevia: 'pz' },
      { nombre: 'Kilogramo', abrevia: 'kg' },
      { nombre: 'Litro', abrevia: 'lt' },
      { nombre: 'Bolsa', abrevia: 'bls' },
      { nombre: 'Caja', abrevia: 'cja' },
    ].map((u) => prisma.unidadMedida.upsert({ where: { nombre: u.nombre }, update: {}, create: u })),
  );

  await Promise.all(
    [
      { clave: 'COMPRA', nombre: 'Compra' },
      { clave: 'DONACION', nombre: 'Donación' },
      { clave: 'CONSUMO', nombre: 'Consumo en comida' },
      { clave: 'MERMA', nombre: 'Merma', esMerma: true },
      { clave: 'CADUCADO', nombre: 'Caducado', esMerma: true },
      { clave: 'AJUSTE', nombre: 'Ajuste' },
    ].map((m) =>
      prisma.motivoMovimiento.upsert({
        where: { clave: m.clave },
        update: {},
        create: { ...m, esSistema: true },
      }),
    ),
  );

  const bienhechor = await prisma.bienhechor.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Público en General', contacto: null },
  });

  // ── Arroz: una sola variante, comprado ───────────────────────
  const arroz = await prisma.producto.create({
    data: { nombre: 'Arroz', categoriaId: categorias[0].id },
  });
  const arrozKgCrudo = await prisma.varianteInventario.create({
    data: {
      productoId: arroz.id,
      unidadId: unidades[1].id, // Kilogramo
      estado: EstadoProducto.CRUDO,
      stockMinimo: 20,
    },
  });
  await prisma.loteInventario.create({
    data: {
      varianteId: arrozKgCrudo.id,
      marca: 'MC Paiza',
      presentacion: '900 grs',
      ubicacion: 'Almacén',
      cantidadInicial: 40,
      cantidadDisponible: 40,
      fechaIngreso: new Date(),
      fechaCaducidad: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      costoUnitario: 18,
      costoTotal: 720,
      origen: OrigenLote.DONADO,
      bienhechorId: bienhechor.id,
      cfdi: 'PF-376',
    },
  });

  // ── Frijol: dos variantes del mismo producto (kg crudo y pieza cocido) ──
  // — así la pantalla de existencias agrupadas tiene qué mostrar de entrada.
  const frijol = await prisma.producto.create({
    data: { nombre: 'Frijol', categoriaId: categorias[0].id },
  });
  const frijolKgCrudo = await prisma.varianteInventario.create({
    data: {
      productoId: frijol.id,
      unidadId: unidades[1].id, // Kilogramo
      estado: EstadoProducto.CRUDO,
      stockMinimo: 15,
    },
  });
  const frijolPzCocido = await prisma.varianteInventario.create({
    data: {
      productoId: frijol.id,
      unidadId: unidades[0].id, // Pieza (olla de porciones)
      estado: EstadoProducto.COCIDO,
      stockMinimo: 5,
    },
  });
  await prisma.loteInventario.create({
    data: {
      varianteId: frijolKgCrudo.id,
      marca: 'La Costeña',
      cantidadInicial: 30,
      cantidadDisponible: 30,
      fechaIngreso: new Date(),
      fechaCaducidad: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      costoUnitario: 32,
      costoTotal: 960,
      origen: OrigenLote.COMPRADO,
      cfdi: 'A-1029',
    },
  });
  await prisma.loteInventario.create({
    data: {
      varianteId: frijolPzCocido.id,
      cantidadInicial: 12,
      cantidadDisponible: 12,
      fechaIngreso: new Date(),
      origen: OrigenLote.COMPRADO,
    },
  });

  // ── Comensales de ejemplo ───────────────────────────────────
  const tutor = await prisma.comensal.create({
    data: {
      nombres: 'Cristina Yamileth',
      apellidos: 'Ruiz Ortiz',
      fechaNacimiento: new Date('1988-04-12'),
    },
  });

  await prisma.comensal.create({
    data: {
      nombres: 'Israel',
      apellidos: 'Rivera Leal',
      fechaNacimiento: new Date('2019-06-03'),
      tutorId: tutor.id,
    },
  });

  // ── Voluntario de ejemplo ───────────────────────────────────
  await prisma.voluntario.create({
    data: { nombres: 'Erika', apellidos: 'Hernández', telefono: '6181234567' },
  });

  // ── Turno de comida de ejemplo (hoy, comida) ────────────────
  await prisma.turnoComida.upsert({
    where: { fecha_horario: { fecha: new Date(new Date().toDateString()), horario: HorarioComida.COMIDA } },
    update: {},
    create: {
      fecha: new Date(new Date().toDateString()),
      horario: HorarioComida.COMIDA,
      menu: 'Arroz, frijoles, tortillas',
      registradoPorId: admin.id,
    },
  });

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
