import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Rol } from '@prisma/client';

/** Lo que guardamos dentro del token. */
export interface UsuarioToken {
  sub: string;
  rol: Rol;
  institucionId: string;
}

/** Autenticación: exige un token válido ("Authorization: Bearer ..."). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const cabecera: string | undefined = req.headers['authorization'];

    if (!cabecera || !cabecera.startsWith('Bearer ')) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    try {
      req.user = this.jwt.verify<UsuarioToken>(cabecera.slice(7));
    } catch {
      throw new UnauthorizedException('Sesión inválida o vencida');
    }
    return true;
  }
}

export const ROLES_KEY = 'roles';
/** Marca qué roles pueden usar un endpoint: @Roles(Rol.ADMIN). */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

/** Autorización: comprueba en el servidor que el rol del usuario esté permitido. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permitidos = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permitidos || permitidos.length === 0) return true;

    const usuario: UsuarioToken | undefined = context.switchToHttp().getRequest().user;
    if (!usuario || !permitidos.includes(usuario.rol)) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }
    return true;
  }
}

/** Entrega el usuario del token en el controlador: crear(@UsuarioActual() u). */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioToken =>
    context.switchToHttp().getRequest().user,
);
