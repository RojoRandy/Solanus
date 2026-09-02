import { PrismaClient, OrigenLote, HorarioComida } from '@prisma/client';
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
  const [almacen, cocina] = await Promise.all(
    ['Almacén', 'Cocina'].map((nombre) => prisma.ubicacion.upsert({ where: { nombre }, update: {}, create: { nombre } })),
  );

  await Promise.all(
    ['Compra', 'Donación', 'Consumo en comida', 'Merma', 'Caducado', 'Ajuste'].map((nombre) =>
      prisma.motivoMovimiento.upsert({ where: { nombre }, update: {}, create: { nombre } }),
    ),
  );

  const bienhechor = await prisma.bienhechor.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Público en General', contacto: null },
  });

  const arroz = await prisma.inventarioItem.create({
    data: {
      nombre: 'Arroz',
      marca: 'MC Paiza',
      categoriaId: categorias[0].id,
      unidadId: unidades[1].id,
      presentacion: '900 grs',
      ubicacionId: almacen.id,
      stockMinimo: 20,
    },
  });

  await prisma.loteInventario.create({
    data: {
      itemId: arroz.id,
      cantidadInicial: 40,
      cantidadDisponible: 40,
      fechaIngreso: new Date(),
      fechaCaducidad: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      costoUnitario: 18,
      costoTotal: 720,
      origen: OrigenLote.DONADO,
      bienhechorId: bienhechor.id,
      numeroFactura: 'PF-376',
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
