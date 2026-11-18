export interface FilaRanking {
  estudianteId: string;
  nombre: string;
  promedio: number;
  tiempoTotalSeg: number;
  quices: number;
}

/**
 * SWR-RANK-001 (ajuste): se ordena por promedio de calificación (mayor primero);
 * en empate, por menor tiempo total. Si empatan en las dos cosas comparten posición.
 */
export function ordenarRanking(filas: FilaRanking[]): (FilaRanking & { posicion: number })[] {
  const ordenadas = [...filas].sort(
    (a, b) =>
      b.promedio - a.promedio ||
      a.tiempoTotalSeg - b.tiempoTotalSeg ||
      a.nombre.localeCompare(b.nombre),
  );

  let posicion = 0;
  return ordenadas.map((fila, i) => {
    const previa = ordenadas[i - 1];
    if (!previa || previa.promedio !== fila.promedio || previa.tiempoTotalSeg !== fila.tiempoTotalSeg) {
      posicion = i + 1;
    }
    return { ...fila, posicion };
  });
}
