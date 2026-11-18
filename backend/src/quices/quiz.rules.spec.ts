import {
  calcularCalificacion,
  contarCorrectas,
  estaVencido,
  validarPreguntas,
} from './quiz.rules';

describe('SWR-CAL-001 · calcularCalificacion', () => {
  it('calcula 75.0 cuando acierta 3 de 4', () => {
    // Arrange
    const correctas = 3;
    const total = 4;
    // Act
    const nota = calcularCalificacion(correctas, total);
    // Assert
    expect(nota).toBe(75);
  });

  it('redondea a un decimal (1 de 3 = 33.3)', () => {
    const nota = calcularCalificacion(1, 3);
    expect(nota).toBe(33.3);
  });

  it('da 0 sin aciertos y 100 con todos los aciertos (límites)', () => {
    expect(calcularCalificacion(0, 5)).toBe(0);
    expect(calcularCalificacion(5, 5)).toBe(100);
  });

  it('lanza error si el quiz no tiene preguntas', () => {
    expect(() => calcularCalificacion(0, 0)).toThrow('El quiz no tiene preguntas');
  });

  it('lanza error si los aciertos son mayores al total o negativos', () => {
    expect(() => calcularCalificacion(6, 5)).toThrow('Cantidad de aciertos inválida');
    expect(() => calcularCalificacion(-1, 5)).toThrow('Cantidad de aciertos inválida');
  });
});

describe('SWR-PRES-002 · estaVencido', () => {
  const inicio = new Date('2026-11-18T10:00:00Z');

  it('NO está vencido justo en el límite exacto (10 min)', () => {
    const ahora = new Date('2026-11-18T10:10:00Z');
    expect(estaVencido(inicio, ahora, 10)).toBe(false);
  });

  it('está vencido un segundo después del límite', () => {
    const ahora = new Date('2026-11-18T10:10:01Z');
    expect(estaVencido(inicio, ahora, 10)).toBe(true);
  });

  it('respeta la gracia de red: 4 s no vence, 6 s sí vence (gracia de 5 s)', () => {
    expect(estaVencido(inicio, new Date('2026-11-18T10:10:04Z'), 10, 5)).toBe(false);
    expect(estaVencido(inicio, new Date('2026-11-18T10:10:06Z'), 10, 5)).toBe(true);
  });

  it('lanza error si el tiempo límite no es mayor a cero', () => {
    expect(() => estaVencido(inicio, new Date(), 0)).toThrow(
      'El tiempo límite debe ser mayor a cero',
    );
  });
});

describe('SWR-CAL-001 · contarCorrectas', () => {
  const preguntas = [
    { id: 'p1', opcionCorrecta: 0 },
    { id: 'p2', opcionCorrecta: 2 },
    { id: 'p3', opcionCorrecta: 3 },
  ];

  it('cuenta solo las respuestas que coinciden con la correcta', () => {
    const respuestas = [
      { preguntaId: 'p1', opcion: 0 },
      { preguntaId: 'p2', opcion: 1 },
      { preguntaId: 'p3', opcion: 3 },
    ];
    expect(contarCorrectas(preguntas, respuestas)).toBe(2);
  });

  it('ignora respuestas a preguntas que no existen y devuelve 0 sin respuestas', () => {
    expect(contarCorrectas(preguntas, [{ preguntaId: 'zzz', opcion: 0 }])).toBe(0);
    expect(contarCorrectas(preguntas, [])).toBe(0);
  });
});

describe('SWR-QUIZ-001 · validarPreguntas', () => {
  const buena = {
    enunciado: '¿Capital de Colombia?',
    opciones: ['Bogotá', 'Lima', 'Quito', 'Caracas'],
    opcionCorrecta: 0,
  };

  it('acepta una pregunta válida', () => {
    expect(validarPreguntas([buena])).toBeNull();
  });

  it('rechaza una lista vacía de preguntas', () => {
    expect(validarPreguntas([])).toBe('El quiz debe tener al menos una pregunta');
  });

  it('rechaza enunciado vacío indicando el número de pregunta', () => {
    expect(validarPreguntas([buena, { ...buena, enunciado: '   ' }])).toBe(
      'La pregunta 2 no tiene enunciado',
    );
  });

  it('rechaza si no hay exactamente 4 opciones', () => {
    const tres = { ...buena, opciones: ['A', 'B', 'C'] };
    expect(validarPreguntas([tres])).toBe('La pregunta 1 debe tener exactamente 4 opciones');
  });

  it('rechaza opciones repetidas sin importar mayúsculas', () => {
    const repetida = { ...buena, opciones: ['Lima', 'lima', 'Quito', 'Caracas'] };
    expect(validarPreguntas([repetida])).toBe('La pregunta 1 tiene opciones repetidas');
  });

  it('rechaza opción correcta fuera de 0 a 3 (límite 4)', () => {
    expect(validarPreguntas([{ ...buena, opcionCorrecta: 4 }])).toBe(
      'La pregunta 1 debe tener una opción correcta entre 0 y 3',
    );
    expect(validarPreguntas([{ ...buena, opcionCorrecta: 3 }])).toBeNull();
  });
});
