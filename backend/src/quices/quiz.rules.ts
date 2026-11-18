export interface PreguntaNueva {
  enunciado: string;
  opciones: string[];
  opcionCorrecta: number;
}

/**
 * SWR-CAL-001 (ajuste): calificación = correctas / total x 100, con un decimal.
 * Ejemplo: 3 de 4 = 75.0
 */
export function calcularCalificacion(correctas: number, total: number): number {
  if (total <= 0) throw new Error('El quiz no tiene preguntas');
  if (correctas < 0 || correctas > total) throw new Error('Cantidad de aciertos inválida');
  return Math.round((correctas / total) * 1000) / 10;
}

/**
 * SWR-PRES-002: ¿se acabó el tiempo del quiz?
 * Se acepta una gracia en segundos (por la demora de la red). Vence cuando se SUPERA el límite.
 */
export function estaVencido(
  inicio: Date,
  ahora: Date,
  limiteMin: number,
  graciaSeg = 0,
): boolean {
  if (limiteMin <= 0) throw new Error('El tiempo límite debe ser mayor a cero');
  // Corrección D-002: con una fecha inválida la resta da NaN y el quiz nunca vencería.
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(ahora.getTime())) {
    throw new Error('Fecha inválida');
  }
  const limiteMs = limiteMin * 60_000 + graciaSeg * 1000;
  return ahora.getTime() - inicio.getTime() > limiteMs;
}

/** Cuenta las respuestas del estudiante que coinciden con la opción correcta. */
export function contarCorrectas(
  preguntas: { id: string; opcionCorrecta: number }[],
  respuestas: { preguntaId: string; opcion: number }[],
): number {
  const correctaPorPregunta = new Map(preguntas.map((p) => [p.id, p.opcionCorrecta]));
  let correctas = 0;
  for (const r of respuestas) {
    if (correctaPorPregunta.get(r.preguntaId) === r.opcion) correctas++;
  }
  return correctas;
}

/**
 * SWR-QUIZ-001 (ajuste): cada pregunta de opción múltiple tiene enunciado,
 * 4 opciones distintas y una opción correcta entre 0 y 3.
 * Devuelve el mensaje de error o null si todo está bien.
 */
export function validarPreguntas(preguntas: PreguntaNueva[]): string | null {
  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    return 'El quiz debe tener al menos una pregunta';
  }
  for (let i = 0; i < preguntas.length; i++) {
    const p = preguntas[i];
    const n = i + 1;
    if (!p.enunciado || p.enunciado.trim() === '') {
      return `La pregunta ${n} no tiene enunciado`;
    }
    if (!Array.isArray(p.opciones) || p.opciones.length !== 4) {
      return `La pregunta ${n} debe tener exactamente 4 opciones`;
    }
    // Corrección D-001: una opción que no sea texto debe dar mensaje, no una excepción.
    if (p.opciones.some((o) => typeof o !== 'string')) {
      return `La pregunta ${n} tiene una opción que no es texto`;
    }
    const limpias = p.opciones.map((o) => o.trim().toLowerCase());
    if (limpias.some((o) => o === '')) {
      return `La pregunta ${n} tiene una opción vacía`;
    }
    if (new Set(limpias).size !== limpias.length) {
      return `La pregunta ${n} tiene opciones repetidas`;
    }
    if (!Number.isInteger(p.opcionCorrecta) || p.opcionCorrecta < 0 || p.opcionCorrecta > 3) {
      return `La pregunta ${n} debe tener una opción correcta entre 0 y 3`;
    }
  }
  return null;
}
