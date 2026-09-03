import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, await bcrypt.genSalt(10));
}

// Los comensales originales solo traen nombre completo, sin fecha de
// nacimiento — se usa un valor de referencia que el admin debe corregir
// desde el expediente de cada comensal.
const FECHA_NACIMIENTO_REFERENCIA = new Date('2000-01-01');

function normalizarNombreCompleto(crudo: string): string {
  return crudo
    .replace(/\([^)]*\)/g, ' ') // paréntesis con contenido
    .replace(/\(.*$/g, ' ') // paréntesis sin cerrar hasta el final
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ ]/g, ' ') // solo letras y espacios
    .replace(/\s+/g, ' ')
    .trim();
}

function capitalizarPalabra(palabra: string): string {
  return palabra[0].toUpperCase() + palabra.slice(1).toLowerCase();
}

// Preposiciones que forman parte de un apellido compuesto (p.ej. "De Los
// Reyes", "De la Cruz") y deben quedar pegadas al apellido, no sueltas.
const PREPOSICIONES_APELLIDO = new Set(['de', 'del', 'la', 'los', 'las']);

// Extrae, desde el final de `palabras`, el grupo de la última palabra "real"
// junto con cualquier racha de preposiciones que la preceda inmediatamente
// (p.ej. ["...", "De", "Los", "Reyes"] -> grupo ["De", "Los", "Reyes"]).
function extraerGrupoApellido(palabras: string[]): { grupo: string[]; resto: string[] } {
  if (palabras.length === 0) return { grupo: [], resto: [] };
  let inicio = palabras.length - 1;
  while (inicio - 1 >= 0 && PREPOSICIONES_APELLIDO.has(palabras[inicio - 1].toLowerCase())) {
    inicio -= 1;
  }
  return { grupo: palabras.slice(inicio), resto: palabras.slice(0, inicio) };
}

function dividirNombreApellidos(nombreCompleto: string): { nombres: string; apellidos: string } {
  const palabras = nombreCompleto.split(' ').filter(Boolean).map(capitalizarPalabra);

  if (palabras.length === 1) return { nombres: palabras[0], apellidos: '' };
  if (palabras.length === 2) return { nombres: palabras[0], apellidos: palabras[1] };

  const { grupo: apellidoMaterno, resto: sinMaterno } = extraerGrupoApellido(palabras);
  const { grupo: apellidoPaterno, resto: nombres } = extraerGrupoApellido(sinMaterno);

  if (nombres.length === 0) {
    // Los dos apellidos consumieron toda la cadena: no partir el nombre de pila.
    return { nombres: sinMaterno.join(' '), apellidos: apellidoMaterno.join(' ') };
  }
  return { nombres: nombres.join(' '), apellidos: [...apellidoPaterno, ...apellidoMaterno].join(' ') };
}

function leerComensalesDesdeCsv(): { nombres: string; apellidos: string; fechaNacimiento: Date }[] {
  const rutaCsv = path.resolve(__dirname, '../../../docs/Lista Comensales.csv');
  const contenido = fs.readFileSync(rutaCsv, 'utf-8').replace(/^﻿/, '');
  const [, ...filas] = contenido.split(/\r?\n/).filter((linea) => linea.trim().length > 0);

  const comensales: { nombres: string; apellidos: string; fechaNacimiento: Date }[] = [];
  for (const fila of filas) {
    const nombreCrudo = fila.split(',')[1] ?? '';
    const nombreNormalizado = normalizarNombreCompleto(nombreCrudo);
    if (!nombreNormalizado) continue;

    // La fila sin datos capturados ("faltan datos") se conserva como
    // comensal placeholder para no perder el folio de la lista original.
    if (nombreNormalizado.toLowerCase() === 'faltan datos') {
      comensales.push({ nombres: 'Faltan Datos', apellidos: '', fechaNacimiento: FECHA_NACIMIENTO_REFERENCIA });
      continue;
    }

    const { nombres, apellidos } = dividirNombreApellidos(nombreNormalizado);
    comensales.push({ nombres, apellidos, fechaNacimiento: FECHA_NACIMIENTO_REFERENCIA });
  }
  return comensales;
}

async function main() {
  console.log('Limpiando y sembrando base de datos del Comedor Solanus...');

  // ── Usuario admin ────────────────────────────────────────────
  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', nombre: 'Administrador General', rol: 'ADMINISTRADOR', password: await hash('Solanus2026!') },
  });

  // ── Categorías de productos ──────────────────────────────────
  await Promise.all(
    [
      'Frutas y verduras',
      'Lacteos, huevo y embutidos',
      'Carnes',
      'Panaderia y tortillas',
      'Granos y cereales',
      'Abarrotes',
      'Condimentos y especias',
      'Bebidas',
      'Botanas y dulces',
      'Congelados',
      'Limpieza',
      'Higiene',
    ].map((nombre) => prisma.categoriaInventario.upsert({ where: { nombre }, update: {}, create: { nombre } })),
  );

  // ── Unidades de medida ───────────────────────────────────────
  await Promise.all(
    [
      { nombre: 'Piezas', abrevia: 'pzs' },
      { nombre: 'Gramo', abrevia: 'gr' },
      { nombre: 'Kilogramo', abrevia: 'kg' },
      { nombre: 'Mililitro', abrevia: 'ml' },
      { nombre: 'Litro', abrevia: 'lt' },
      { nombre: 'Cartera', abrevia: 'cartera' },
      { nombre: 'Paquete', abrevia: 'paq' },
      { nombre: 'Caja', abrevia: 'cja' },
      { nombre: 'Docena', abrevia: 'doce' },
      { nombre: 'Bolsa', abrevia: 'bolsa' },
      { nombre: 'Lata', abrevia: 'lata' },
      { nombre: 'Botella', abrevia: 'bot' },
      { nombre: 'Frasco', abrevia: 'frasco' },
    ].map((u) => prisma.unidadMedida.upsert({ where: { nombre: u.nombre }, update: {}, create: u })),
  );

  // ── Comensales (docs/Lista Comensales.csv) ──────────────────
  const comensales = leerComensalesDesdeCsv();
  await prisma.comensal.createMany({ data: comensales });

  console.log(`Seed completado: ${comensales.length} comensales.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
