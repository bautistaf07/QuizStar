import { separarDuplicados } from './matricula.rules';

describe('SWR-CUR-003 · separarDuplicados', () => {
  it('separa los estudiantes nuevos de los ya matriculados', () => {
    const r = separarDuplicados(['e1', 'e2'], ['e2', 'e3']);
    expect(r.nuevos).toEqual(['e3']);
    expect(r.duplicados).toEqual(['e2']);
  });

  it('no repite un estudiante que viene dos veces en la misma solicitud', () => {
    const r = separarDuplicados([], ['e1', 'e1', 'e2']);
    expect(r.nuevos).toEqual(['e1', 'e2']);
    expect(r.duplicados).toEqual([]);
  });
});
