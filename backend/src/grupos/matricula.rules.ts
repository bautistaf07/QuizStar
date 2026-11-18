/**
 * SWR-CUR-003 (ajuste de verificación): no se matricula dos veces al mismo estudiante en un grupo.
 * Separa los estudiantes solicitados en "nuevos" y "duplicados" (ya matriculados).
 */
export function separarDuplicados(
  yaMatriculados: string[],
  solicitados: string[],
): { nuevos: string[]; duplicados: string[] } {
  const existentes = new Set(yaMatriculados);
  const nuevos: string[] = [];
  const duplicados: string[] = [];

  for (const id of new Set(solicitados)) {
    if (existentes.has(id)) duplicados.push(id);
    else nuevos.push(id);
  }
  return { nuevos, duplicados };
}
