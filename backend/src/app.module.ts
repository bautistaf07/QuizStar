import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './common/logger.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { RequestLoggingInterceptor } from './common/request-logging.interceptor';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { GruposModule } from './grupos/grupos.module';
import { QuicesModule } from './quices/quices.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 8 * 60 * 60 }, // 8 horas, en segundos
    }),
    AuthModule,
    UsuariosModule,
    GruposModule,
    QuicesModule,
    RankingModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
  ],
})
export class AppModule {}
