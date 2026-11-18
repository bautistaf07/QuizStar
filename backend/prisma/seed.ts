import 'dotenv/config';
import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Usuarios SOLO para pruebas locales. No son datos reales.
const USUARIOS = [
  { nombre: 'Admin Demo', correo: 'admin@quizstar.test', password: 'Admin12345', rol: Rol.ADMIN },
  { nombre: 'Profesor Demo', correo: 'profe@quizstar.test', password: 'Profe12345', rol: Rol.PROFESOR },
  { nombre: 'Estudiante Uno', correo: 'est1@quizstar.test', password: 'Estu12345', rol: Rol.ESTUDIANTE },
  { nombre: 'Estudiante Dos', correo: 'est2@quizstar.test', password: 'Estu12345', rol: Rol.ESTUDIANTE },
  { nombre: 'Estudiante Tres', correo: 'est3@quizstar.test', password: 'Estu12345', rol: Rol.ESTUDIANTE },
];

async function main() {
  const institucion = await prisma.institucion.upsert({
    where: { nombre: 'Institución Demo CORHUILA' },
    update: {},
    create: { nombre: 'Institución Demo CORHUILA' },
  });

  for (const u of USUARIOS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.usuario.upsert({
      where: { correo: u.correo },
      update: {},
      create: {
        nombre: u.nombre,
        correo: u.correo,
        passwordHash,
        rol: u.rol,
        institucionId: institucion.id,
      },
    });
  }

  console.log('Seed listo. Usuarios de prueba:');
  for (const u of USUARIOS) console.log(` - ${u.rol.padEnd(10)} ${u.correo}  /  ${u.password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
