import { enmascararCorreo } from '../common/privacy';
import { estaVencido, validarPreguntas } from './quiz.rules';

const base = {
  enunciado: '¿Pregunta?',
  opciones: ['A', 'B', 'C', 'D'],
  opcionCorrecta: 0,
};

describe('Caja blanca 1 · validarPreguntas (SWR-QUIZ-001)', () => {
  it('rama: opción vacía devuelve mensaje (camino que no estaba cubierto)', () => {
    const p = { ...base, opciones: ['A', '', 'C', 'D'] };
    expect(validarPreguntas([p])).toBe('La pregunta 1 tiene una opción vacía');
  });

  it('límite inferior: opción correcta 0 es válida y -1 no', () => {
    expect(validarPreguntas([{ ...base, opcionCorrecta: 0 }])).toBeNull();
    expect(validarPreguntas([{ ...base, opcionCorrecta: -1 }])).toBe(
      'La pregunta 1 debe tener una opción correcta entre 0 y 3',
    );
  });

  it('re-test D-001: una opción que no es texto da mensaje y no lanza excepción', () => {
    const p = { ...base, opciones: ['A', 2 as unknown as string, 'C', 'D'] };
    expect(validarPreguntas([p])).toBe('La pregunta 1 tiene una opción que no es texto');
  });

  it('opción correcta decimal (1.5) se rechaza', () => {
    expect(validarPreguntas([{ ...base, opcionCorrecta: 1.5 }])).toBe(
      'La pregunta 1 debe tener una opción correcta entre 0 y 3',
    );
  });
});

describe('Caja blanca 2 · estaVencido (SWR-PRES-002)', () => {
  const inicio = new Date('2026-11-18T10:00:00Z');

  it('re-test D-002: una fecha inválida lanza error y no devuelve false', () => {
    expect(() => estaVencido(new Date('no-es-fecha'), new Date(), 10)).toThrow('Fecha inválida');
    expect(() => estaVencido(inicio, new Date('no-es-fecha'), 10)).toThrow('Fecha inválida');
  });

  it('límite: 1 minuto exacto no vence y 1 minuto + 1 ms sí vence', () => {
    expect(estaVencido(inicio, new Date(inicio.getTime() + 60_000), 1)).toBe(false);
    expect(estaVencido(inicio, new Date(inicio.getTime() + 60_001), 1)).toBe(true);
  });
});

describe('Caja blanca 3 · enmascararCorreo (logs seguros, relacionado con SWR-SEC-002)', () => {
  it('rama: un valor que no es texto devuelve *** (línea 3 que no estaba cubierta)', () => {
    expect(enmascararCorreo(null as unknown as string)).toBe('***');
    expect(enmascararCorreo(123 as unknown as string)).toBe('***');
  });

  it('re-test D-003: con varias arrobas conserva todo el dominio', () => {
    expect(enmascararCorreo('a@b@c.com')).toBe('a***@b@c.com');
  });

  it('límite: correo que termina en @ devuelve ***', () => {
    expect(enmascararCorreo('ana@')).toBe('***');
  });
});
