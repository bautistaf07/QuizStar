export type Rol = "ADMIN" | "PROFESOR" | "ESTUDIANTE";

export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
}

export interface UsuarioLista {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface Grupo {
  id: string;
  nombre: string;
  grado: string;
  _count?: { matriculas: number };
}

export interface QuizProfesor {
  id: string;
  titulo: string;
  tema: string;
  tiempoLimiteMin: number;
  _count: { preguntas: number; asignaciones: number };
}

export type EstadoIntento = "SIN_INICIAR" | "EN_CURSO" | "FINALIZADO" | "CERRADO_POR_TIEMPO";

export interface QuizEstudiante {
  id: string;
  titulo: string;
  tema: string;
  tiempoLimiteMin: number;
  _count: { preguntas: number };
  estadoIntento: EstadoIntento;
  calificacion: number | null;
}

export interface PreguntaPublica {
  id: string;
  enunciado: string;
  orden: number;
  opciones: string[];
}

export interface QuizIniciado {
  intentoId: string;
  iniciadoEn: string;
  tiempoLimiteSeg: number;
  restanteSeg: number;
  preguntas: PreguntaPublica[];
  respuestasGuardadas: { preguntaId: string; opcion: number }[];
}

export interface ResultadoQuiz {
  intentoId: string;
  estado: EstadoIntento;
  calificacion: number | null;
  correctas: number | null;
  total: number;
  tiempoTotalSeg: number | null;
}

export interface ResultadoProfesor {
  estudianteId: string;
  nombre: string;
  calificacion: number | null;
  correctas: number | null;
  tiempoTotalSeg: number | null;
  estado: EstadoIntento;
}

export interface FilaRanking {
  posicion: number;
  estudianteId: string;
  nombre: string;
  promedio: number;
  tiempoTotalSeg: number;
  quices: number;
}

export interface RespuestaRanking {
  grupo: { id: string; nombre: string };
  ranking: FilaRanking[];
}

export const ETIQUETA_ESTADO: Record<EstadoIntento, string> = {
  SIN_INICIAR: "Pendiente",
  EN_CURSO: "En curso",
  FINALIZADO: "Finalizado",
  CERRADO_POR_TIEMPO: "Cerrado por tiempo",
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN: "Administrador",
  PROFESOR: "Profesor",
  ESTUDIANTE: "Estudiante",
};
