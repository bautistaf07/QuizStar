import { ordenarRanking } from './ranking.rules';

const fila = (nombre: string, promedio: number, tiempoTotalSeg: number) => ({
  estudianteId: nombre,
  nombre,
  promedio,
  tiempoTotalSeg,
  quices: 1,
});

describe('SWR-RANK-001 · ordenarRanking', () => {
  it('ordena por promedio de mayor a menor', () => {
    const filas = [fila('Carlos', 70, 50), fila('Ana', 90, 100), fila('Beto', 80, 60)];
    const r = ordenarRanking(filas);
    expect(r.map((x) => x.nombre)).toEqual(['Ana', 'Beto', 'Carlos']);
    expect(r.map((x) => x.posicion)).toEqual([1, 2, 3]);
  });

  it('en empate de promedio gana quien tardó menos tiempo', () => {
    const r = ordenarRanking([fila('Ana', 90, 100), fila('Beto', 90, 80)]);
    expect(r[0].nombre).toBe('Beto');
    expect(r[0].posicion).toBe(1);
    expect(r[1].posicion).toBe(2);
  });

  it('si empatan en promedio y tiempo comparten posición y la siguiente se salta', () => {
    const r = ordenarRanking([fila('Ana', 80, 60), fila('Beto', 80, 60), fila('Carlos', 70, 10)]);
    expect(r.map((x) => x.posicion)).toEqual([1, 1, 3]);
  });

  it('no modifica la lista original y acepta una lista vacía', () => {
    const original = [fila('B', 50, 10), fila('A', 90, 10)];
    ordenarRanking(original);
    expect(original[0].nombre).toBe('B');
    expect(ordenarRanking([])).toEqual([]);
  });
});
