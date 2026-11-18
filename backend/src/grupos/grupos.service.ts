import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/app-logger.service';
import { UsuarioToken } from '../common/roles';
import { separarDuplicados } from './matricula.rules';
import { CrearGrupoDto } from './grupos.controller';

@Injectable()
export class GruposService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  /** SWR-CUR-001: crear un grupo con nombre y grado/semestre dentro de la institución. */
  async crear(dto: CrearGrupoDto, actor: UsuarioToken) {
    const nombre = dto.nombre.trim();
    const existe = await this.prisma.grupo.findUnique({
      where: { institucionId_nombre: { institucionId: actor.institucionId, nombre } },
    });
    if (existe) throw new ConflictException('Ya existe un grupo con ese nombre');

    const grupo = await this.prisma.grupo.create({
      data: {
        nombre,
        grado: dto.grado.trim(),
        institucionId: actor.institucionId,
        profesorId: actor.rol === Rol.PROFESOR ? actor.sub : null,
      },
    });

    this.logger.info('GruposService', 'GROUP_CREATED', 'Grupo creado', {
      grupoId: grupo.id,
      actorId: actor.sub,
    });
    return grupo;
  }

  /** Cada rol ve lo suyo: admin todos, profesor sus grupos, estudiante donde está matriculado. */
  listar(actor: UsuarioToken) {
    const filtro =
      actor.rol === Rol.ADMIN
        ? {}
        : actor.rol === Rol.PROFESOR
          ? { profesorId: actor.sub }
          : { matriculas: { some: { estudianteId: actor.sub } } };

    return this.prisma.grupo.findMany({
      where: { institucionId: actor.institucionId, ...filtro },
      include: { _count: { select: { matriculas: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  /** SWR-CUR-003: matricular uno o varios estudiantes en un grupo. */
  async matricular(grupoId: string, estudianteIds: string[], actor: UsuarioToken) {
    const grupo = await this.obtenerGrupoPermitido(grupoId, actor);

    const ids = [...new Set(estudianteIds)];
    const estudiantes = await this.prisma.usuario.findMany({
      where: { id: { in: ids }, institucionId: actor.institucionId, rol: Rol.ESTUDIANTE, activo: true },
      select: { id: true },
    });
    if (estudiantes.length !== ids.length) {
      throw new BadRequestException('Alguno de los estudiantes no existe o no está activo');
    }

    const existentes = await this.prisma.matricula.findMany({
      where: { grupoId: grupo.id, estudianteId: { in: ids } },
      select: { estudianteId: true },
    });
    const { nuevos, duplicados } = separarDuplicados(
      existentes.map((m) => m.estudianteId),
      ids,
    );
    if (duplicados.length > 0) {
      throw new ConflictException('Algún estudiante ya está matriculado en este grupo');
    }

    await this.prisma.matricula.createMany({
      data: nuevos.map((estudianteId) => ({ grupoId: grupo.id, estudianteId })),
    });

    this.logger.info('GruposService', 'STUDENTS_ENROLLED', 'Estudiantes matriculados', {
      grupoId: grupo.id,
      cantidad: nuevos.length,
      actorId: actor.sub,
    });
    return { grupoId: grupo.id, matriculados: nuevos.length };
  }

  async estudiantes(grupoId: string, actor: UsuarioToken) {
    const grupo = await this.obtenerGrupoPermitido(grupoId, actor);
    const matriculas = await this.prisma.matricula.findMany({
      where: { grupoId: grupo.id },
      include: { estudiante: { select: { id: true, nombre: true, correo: true } } },
      orderBy: { estudiante: { nombre: 'asc' } },
    });
    return matriculas.map((m) => m.estudiante);
  }

  /** El grupo debe ser de la misma institución; un profesor solo opera sus propios grupos. */
  private async obtenerGrupoPermitido(grupoId: string, actor: UsuarioToken) {
    const grupo = await this.prisma.grupo.findFirst({
      where: { id: grupoId, institucionId: actor.institucionId },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    if (actor.rol === Rol.PROFESOR && grupo.profesorId !== actor.sub) {
      throw new ForbiddenException('Este grupo no es tuyo');
    }
    return grupo;
  }
}
