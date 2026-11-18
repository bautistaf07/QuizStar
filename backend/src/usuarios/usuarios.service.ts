import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/app-logger.service';
import { UsuarioToken } from '../common/roles';
import { validarPassword } from '../auth/password.rules';
import { CrearUsuarioDto } from './usuarios.controller';

// Nunca devolvemos el hash de la contraseña.
const CAMPOS_PUBLICOS = {
  id: true,
  nombre: true,
  correo: true,
  rol: true,
  activo: true,
  creadoEn: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  /** SWR-USR-001: el administrador registra profesores y estudiantes de SU institución. */
  async crear(dto: CrearUsuarioDto, actor: UsuarioToken) {
    const errorPassword = validarPassword(dto.password);
    if (errorPassword) throw new BadRequestException(errorPassword);

    const correo = dto.correo.trim().toLowerCase();
    const existe = await this.prisma.usuario.findUnique({ where: { correo } });
    if (existe) throw new ConflictException('Ya existe una cuenta con ese correo');

    // SWR-SEC-002: la contraseña se guarda con hash bcrypt (incluye sal), nunca en texto plano.
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre.trim(),
        correo,
        passwordHash,
        rol: dto.rol as Rol,
        institucionId: actor.institucionId,
      },
      select: CAMPOS_PUBLICOS,
    });

    this.logger.info('UsuariosService', 'USER_CREATED', 'Usuario creado', {
      usuarioId: usuario.id,
      rol: usuario.rol,
      actorId: actor.sub,
    });
    return usuario;
  }

  /** El administrador ve todos; el profesor solo ve estudiantes (para matricularlos). */
  listar(actor: UsuarioToken) {
    return this.prisma.usuario.findMany({
      where: {
        institucionId: actor.institucionId,
        ...(actor.rol === Rol.PROFESOR ? { rol: Rol.ESTUDIANTE } : {}),
      },
      select: CAMPOS_PUBLICOS,
      orderBy: { nombre: 'asc' },
    });
  }

  async desactivar(id: string, actor: UsuarioToken) {
    if (id === actor.sub) {
      throw new BadRequestException('No puedes desactivar tu propia cuenta');
    }
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, institucionId: actor.institucionId },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: CAMPOS_PUBLICOS,
    });
    this.logger.info('UsuariosService', 'USER_DEACTIVATED', 'Usuario desactivado', {
      usuarioId: id,
      actorId: actor.sub,
    });
    return actualizado;
  }
}
