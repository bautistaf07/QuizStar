import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoIntento, Intento, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/app-logger.service';
import { UsuarioToken } from '../common/roles';
import { calcularCalificacion, contarCorrectas, estaVencido, validarPreguntas } from './quiz.rules';
import { CrearQuizDto, ResponderDto } from './quices.controller';

// Margen por la demora de la red al enviar la última respuesta.
const GRACIA_SEG = 2;

type PreguntaConClave = { id: string; opcionCorrecta: number };

@Injectable()
export class QuicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  /** SWR-QUIZ-001: el profesor crea un quiz manual de opción múltiple. */
  async crear(dto: CrearQuizDto, actor: UsuarioToken) {
    const error = validarPreguntas(dto.preguntas);
    if (error) throw new BadRequestException(error);

    const quiz = await this.prisma.quiz.create({
      data: {
        titulo: dto.titulo.trim(),
        tema: dto.tema.trim(),
        tiempoLimiteMin: dto.tiempoLimiteMin,
        profesorId: actor.sub,
        institucionId: actor.institucionId,
        preguntas: {
          create: dto.preguntas.map((p, i) => ({
            enunciado: p.enunciado.trim(),
            orden: i + 1,
            opciones: p.opciones,
            opcionCorrecta: p.opcionCorrecta,
          })),
        },
      },
      include: { _count: { select: { preguntas: true } } },
    });

    this.logger.info('QuicesService', 'QUIZ_CREATED', 'Quiz creado', {
      quizId: quiz.id,
      preguntas: quiz._count.preguntas,
      actorId: actor.sub,
    });
    return quiz;
  }

  /** Profesor: sus quices. Estudiante: los asignados a sus grupos, con su estado. */
  async listar(actor: UsuarioToken) {
    if (actor.rol === Rol.PROFESOR) {
      return this.prisma.quiz.findMany({
        where: { profesorId: actor.sub },
        include: { _count: { select: { preguntas: true, asignaciones: true } } },
        orderBy: { creadoEn: 'desc' },
      });
    }

    const quices = await this.prisma.quiz.findMany({
      where: { asignaciones: { some: { grupo: { matriculas: { some: { estudianteId: actor.sub } } } } } },
      select: {
        id: true,
        titulo: true,
        tema: true,
        tiempoLimiteMin: true,
        _count: { select: { preguntas: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
    const intentos = await this.prisma.intento.findMany({
      where: { estudianteId: actor.sub, quizId: { in: quices.map((q) => q.id) } },
      select: { quizId: true, estado: true, calificacion: true },
    });
    const porQuiz = new Map(intentos.map((i) => [i.quizId, i]));
    return quices.map((q) => ({
      ...q,
      estadoIntento: porQuiz.get(q.id)?.estado ?? 'SIN_INICIAR',
      calificacion: porQuiz.get(q.id)?.calificacion ?? null,
    }));
  }

  /** El profesor ve el quiz completo; el estudiante lo ve sin las respuestas correctas. */
  async obtener(id: string, actor: UsuarioToken) {
    if (actor.rol === Rol.PROFESOR) {
      const quiz = await this.prisma.quiz.findFirst({
        where: { id, profesorId: actor.sub },
        include: { preguntas: { orderBy: { orden: 'asc' } } },
      });
      if (!quiz) throw new NotFoundException('Quiz no encontrado');
      return quiz;
    }

    await this.quizAsignadoA(id, actor);
    return this.prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        tema: true,
        tiempoLimiteMin: true,
        preguntas: {
          orderBy: { orden: 'asc' },
          select: { id: true, enunciado: true, orden: true, opciones: true },
        },
      },
    });
  }

  /** SWR-ASG-002 (alcance MVP): asignar el quiz a uno o varios grupos del profesor. */
  async asignar(id: string, grupoIds: string[], actor: UsuarioToken) {
    const quiz = await this.prisma.quiz.findFirst({ where: { id, profesorId: actor.sub } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');

    const ids = [...new Set(grupoIds)];
    const grupos = await this.prisma.grupo.findMany({
      where: { id: { in: ids }, institucionId: actor.institucionId, profesorId: actor.sub },
      select: { id: true },
    });
    if (grupos.length !== ids.length) {
      throw new BadRequestException('Alguno de los grupos no existe o no es tuyo');
    }

    await this.prisma.asignacion.createMany({
      data: ids.map((grupoId) => ({ quizId: id, grupoId })),
      skipDuplicates: true,
    });

    this.logger.info('QuicesService', 'QUIZ_ASSIGNED', 'Quiz asignado a grupos', {
      quizId: id,
      grupos: ids.length,
      actorId: actor.sub,
    });
    return { quizId: id, grupoIds: ids };
  }

  /** El estudiante empieza el quiz (o lo retoma si aún está en curso y dentro del tiempo). */
  async iniciar(id: string, actor: UsuarioToken) {
    const quiz = await this.quizAsignadoA(id, actor);
    const preguntas = await this.preguntasDe(id);

    let intento = await this.prisma.intento.findUnique({
      where: { quizId_estudianteId: { quizId: id, estudianteId: actor.sub } },
    });

    if (intento) {
      intento = await this.cerrarSiVencido(intento, preguntas, quiz.tiempoLimiteMin);
      if (intento.estado !== EstadoIntento.EN_CURSO) {
        throw new ConflictException('Ya presentaste este quiz');
      }
    } else {
      intento = await this.prisma.intento.create({
        data: { quizId: id, estudianteId: actor.sub },
      });
      this.logger.info('QuicesService', 'ATTEMPT_STARTED', 'Estudiante inició un quiz', {
        quizId: id,
        intentoId: intento.id,
        usuarioId: actor.sub,
      });
    }

    const guardadas = await this.prisma.respuesta.findMany({
      where: { intentoId: intento.id },
      select: { preguntaId: true, opcion: true },
    });
    const tiempoLimiteSeg = quiz.tiempoLimiteMin * 60;
    const transcurrido = Math.floor((Date.now() - intento.iniciadoEn.getTime()) / 1000);

    return {
      intentoId: intento.id,
      iniciadoEn: intento.iniciadoEn,
      tiempoLimiteSeg,
      restanteSeg: Math.max(0, tiempoLimiteSeg - transcurrido),
      preguntas: (
        await this.prisma.pregunta.findMany({
          where: { quizId: id },
          orderBy: { orden: 'asc' },
          select: { id: true, enunciado: true, orden: true, opciones: true },
        })
      ),
      respuestasGuardadas: guardadas,
    };
  }

  /** Guarda (o cambia) la respuesta a una pregunta mientras el quiz siga abierto. */
  async responder(id: string, dto: ResponderDto, actor: UsuarioToken) {
    const quiz = await this.quizAsignadoA(id, actor);
    const preguntas = await this.preguntasDe(id);

    let intento = await this.prisma.intento.findUnique({
      where: { quizId_estudianteId: { quizId: id, estudianteId: actor.sub } },
    });
    if (!intento) throw new BadRequestException('Primero debes iniciar el quiz');

    intento = await this.cerrarSiVencido(intento, preguntas, quiz.tiempoLimiteMin);
    if (intento.estado !== EstadoIntento.EN_CURSO) {
      throw new ConflictException('El quiz ya terminó: se agotó el tiempo o ya lo finalizaste');
    }
    if (!preguntas.some((p) => p.id === dto.preguntaId)) {
      throw new BadRequestException('La pregunta no pertenece a este quiz');
    }

    await this.prisma.respuesta.upsert({
      where: { intentoId_preguntaId: { intentoId: intento.id, preguntaId: dto.preguntaId } },
      update: { opcion: dto.opcion },
      create: { intentoId: intento.id, preguntaId: dto.preguntaId, opcion: dto.opcion },
    });
    return { ok: true };
  }

  /** SWR-CAL-001: al finalizar se calcula la calificación y se muestra al estudiante. */
  async finalizar(id: string, actor: UsuarioToken) {
    const quiz = await this.quizAsignadoA(id, actor);
    const preguntas = await this.preguntasDe(id);

    const intento = await this.prisma.intento.findUnique({
      where: { quizId_estudianteId: { quizId: id, estudianteId: actor.sub } },
    });
    if (!intento) throw new BadRequestException('Primero debes iniciar el quiz');

    if (intento.estado !== EstadoIntento.EN_CURSO) {
      return this.armarResultado(intento, preguntas.length);
    }

    const vencido = estaVencido(intento.iniciadoEn, new Date(), quiz.tiempoLimiteMin, GRACIA_SEG);
    const transcurrido = Math.floor((Date.now() - intento.iniciadoEn.getTime()) / 1000);
    const cerrado = await this.cerrar(
      intento,
      preguntas,
      vencido ? EstadoIntento.CERRADO_POR_TIEMPO : EstadoIntento.FINALIZADO,
      vencido ? quiz.tiempoLimiteMin * 60 : transcurrido,
    );
    return this.armarResultado(cerrado, preguntas.length);
  }

  async miResultado(id: string, actor: UsuarioToken) {
    const quiz = await this.quizAsignadoA(id, actor);
    const preguntas = await this.preguntasDe(id);
    let intento = await this.prisma.intento.findUnique({
      where: { quizId_estudianteId: { quizId: id, estudianteId: actor.sub } },
    });
    if (intento) intento = await this.cerrarSiVencido(intento, preguntas, quiz.tiempoLimiteMin);
    if (!intento || intento.estado === EstadoIntento.EN_CURSO) {
      throw new NotFoundException('Aún no tienes resultado para este quiz');
    }
    return this.armarResultado(intento, preguntas.length);
  }

  /** El profesor consulta las calificaciones de sus estudiantes en un quiz. */
  async resultados(id: string, actor: UsuarioToken) {
    const quiz = await this.prisma.quiz.findFirst({ where: { id, profesorId: actor.sub } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');

    const intentos = await this.prisma.intento.findMany({
      where: { quizId: id, estado: { not: EstadoIntento.EN_CURSO } },
      include: { estudiante: { select: { id: true, nombre: true } } },
      orderBy: { calificacion: 'desc' },
    });
    return intentos.map((i) => ({
      estudianteId: i.estudiante.id,
      nombre: i.estudiante.nombre,
      calificacion: i.calificacion,
      correctas: i.correctas,
      tiempoTotalSeg: i.tiempoTotalSeg,
      estado: i.estado,
    }));
  }

  // ------------------------------------------------------------------ privados

  /** El quiz debe ser de la institución y estar asignado a un grupo del estudiante. */
  private async quizAsignadoA(quizId: string, actor: UsuarioToken) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, institucionId: actor.institucionId },
    });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');

    const asignado = await this.prisma.asignacion.findFirst({
      where: { quizId, grupo: { matriculas: { some: { estudianteId: actor.sub } } } },
    });
    if (!asignado) throw new ForbiddenException('Este quiz no está asignado a ti');
    return quiz;
  }

  private preguntasDe(quizId: string): Promise<PreguntaConClave[]> {
    return this.prisma.pregunta.findMany({
      where: { quizId },
      select: { id: true, opcionCorrecta: true },
    });
  }

  /** SWR-PRES-002: si se acabó el tiempo, el intento se cierra con lo respondido hasta ahora. */
  private async cerrarSiVencido(
    intento: Intento,
    preguntas: PreguntaConClave[],
    limiteMin: number,
  ): Promise<Intento> {
    if (
      intento.estado === EstadoIntento.EN_CURSO &&
      estaVencido(intento.iniciadoEn, new Date(), limiteMin, GRACIA_SEG)
    ) {
      const cerrado = await this.cerrar(
        intento,
        preguntas,
        EstadoIntento.CERRADO_POR_TIEMPO,
        limiteMin * 60,
      );
      this.logger.warn('QuicesService', 'ATTEMPT_CLOSED_BY_TIMEOUT', 'Quiz cerrado por tiempo', {
        intentoId: intento.id,
        usuarioId: intento.estudianteId,
      });
      return cerrado;
    }
    return intento;
  }

  private async cerrar(
    intento: Intento,
    preguntas: PreguntaConClave[],
    estado: EstadoIntento,
    tiempoTotalSeg: number,
  ): Promise<Intento> {
    const respuestas = await this.prisma.respuesta.findMany({
      where: { intentoId: intento.id },
      select: { preguntaId: true, opcion: true },
    });
    const correctas = contarCorrectas(preguntas, respuestas);
    const calificacion = calcularCalificacion(correctas, preguntas.length);

    const actualizado = await this.prisma.intento.update({
      where: { id: intento.id },
      data: { estado, correctas, calificacion, tiempoTotalSeg, finalizadoEn: new Date() },
    });

    if (estado === EstadoIntento.FINALIZADO) {
      this.logger.info('QuicesService', 'ATTEMPT_FINISHED', 'Quiz finalizado y calificado', {
        intentoId: intento.id,
        usuarioId: intento.estudianteId,
        calificacion,
        tiempoTotalSeg,
      });
    }
    return actualizado;
  }

  private armarResultado(intento: Intento, total: number) {
    return {
      intentoId: intento.id,
      estado: intento.estado,
      calificacion: intento.calificacion,
      correctas: intento.correctas,
      total,
      tiempoTotalSeg: intento.tiempoTotalSeg,
    };
  }
}
