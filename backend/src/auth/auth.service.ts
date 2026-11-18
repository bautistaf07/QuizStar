import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/app-logger.service';
import { enmascararCorreo } from '../common/privacy';
import { UsuarioToken } from '../common/roles';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly logger: AppLogger,
  ) {}

  /** SWR-AUTH-001 y SWR-AUTH-002: correo + contraseña; el error nunca dice cuál dato falló. */
  async login(correo: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: correo.trim().toLowerCase() },
    });

    const passwordOk = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;

    if (!usuario || !usuario.activo || !passwordOk) {
      this.logger.warn('AuthService', 'LOGIN_FAILED', 'Inicio de sesión fallido', {
        correo: enmascararCorreo(correo),
      });
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const payload: UsuarioToken = {
      sub: usuario.id,
      rol: usuario.rol,
      institucionId: usuario.institucionId,
    };
    const accessToken = this.jwt.sign(payload);

    this.logger.info('AuthService', 'LOGIN_OK', 'Inicio de sesión correcto', {
      usuarioId: usuario.id,
      rol: usuario.rol,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }

  async perfil(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, nombre: true, correo: true, rol: true, institucionId: true },
    });
    if (!usuario) throw new UnauthorizedException('Sesión inválida o vencida');
    return usuario;
  }
}
