import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppLogger } from './common/app-logger.service';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en el archivo .env');
  }

  const app = await NestFactory.create(AppModule);

  // El frontend (Next.js) llama a esta API; la base de datos solo la toca el backend.
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' });

  // Valida los datos que llegan y rechaza los campos que no esperamos.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const puerto = Number(process.env.PORT ?? 4000);
  await app.listen(puerto);

  app.get(AppLogger).info('Bootstrap', 'APP_STARTED', 'QuizStar API iniciada', { puerto });
}

bootstrap();
