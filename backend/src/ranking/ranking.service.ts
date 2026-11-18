import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoIntento, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioToken } from '../common/roles';
import { FilaRanking, ordenarRanking } from './ranking.rules';

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  /** SWR-RANK-001: ranking del grupo según el promedio de sus quices finalizados. */
  async porGrupo(grupoId: string, actor: UsuarioToken) {
    const grupo = await this.prisma.grupo.findFirst({
      where: { id: grupoId, institucionId: actor.institucionId },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');

    if (actor.rol === Rol.PROFESOR && grupo.profesorId !== actor.sub) {
      throw new ForbiddenException('Este grupo no es tuyo');
    }
    if (actor.rol === Rol.ESTUDIANTE) {
      const matricula = await this.prisma.matricula.findUnique({
        where: { grupoId_estudianteId: { grupoId, estudianteId: actor.sub } },
      });
      if (!matricula) throw new ForbiddenException('No perteneces a este grupo');
    }

    const intentos = await this.prisma.intento.findMany({
      where: {
        estado: { not: EstadoIntento.EN_CURSO },
        calificacion: { not: null },
        quiz: { asignaciones: { some: { grupoId } } },
        estudiante: { matriculas: { some: { grupoId } } },
      },
      include: { estudiante: { select: { id: true, nombre: true } } },
    });

    const acumulado = new Map<string, { nombre: string; suma: number; tiempo: number; n: number }>();
    for (const i of intentos) {
      const previo = acumulado.get(i.estudiante.id) ?? { nombre: i.estudiante.nombre, suma: 0, tiempo: 0, n: 0 };
      previo.suma += i.calificacion ?? 0;
      previo.tiempo += i.tiempoTotalSeg ?? 0;
      previo.n += 1;
      acumulado.set(i.estudiante.id, previo);
    }

    const filas: FilaRanking[] = [...acumulado.entries()].map(([estudianteId, v]) => ({
      estudianteId,
      nombre: v.nombre,
      promedio: Math.round((v.suma / v.n) * 10) / 10,
      tiempoTotalSeg: v.tiempo,
      quices: v.n,
    }));

    return { grupo: { id: grupo.id, nombre: grupo.nombre }, ranking: ordenarRanking(filas) };
  }
}
