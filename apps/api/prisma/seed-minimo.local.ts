import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Solanus2026!', await bcrypt.genSalt(10));
  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password, nombre: 'Admin de prueba', rol: 'ADMINISTRADOR' },
  });
  console.log('Usuario admin listo');
}

main().finally(() => prisma.$disconnect());
