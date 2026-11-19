"use client";

import { Celda, Mensaje, PageHeader, TablaSimple, Tarjeta, formatearTiempo } from "@/components/quizstar/ui";
import { useIdioma } from "@/context/IdiomaContext";
import { ApiError, apiFetch } from "@/lib/api";
import { ETIQUETA_ESTADO, type ResultadoProfesor } from "@/lib/tipos";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultadosQuiz() {
  const { id } = useParams<{ id: string }>();
  const { t } = useIdioma();
  const [filas, setFilas] = useState<ResultadoProfesor[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ResultadoProfesor[]>(`/quices/${id}/resultados`)
      .then(setFilas)
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar"));
  }, [id]);

  return (
    <>
      <PageHeader titulo="Resultados del quiz" subtitulo="Calificación y tiempo de cada estudiante." />
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      <Tarjeta>
        <TablaSimple
          columnas={["Estudiante", "Estado", "Correctas", "Nota", "Tiempo"]}
          vacio="Todavía no hay estudiantes asignados."
          hayFilas={filas.length > 0}
        >
          {filas.map((f) => (
            <tr key={f.estudianteId}>
              <Celda>{f.nombre}</Celda>
              <Celda>{t(ETIQUETA_ESTADO[f.estado])}</Celda>
              <Celda>{f.correctas ?? "-"}</Celda>
              <Celda>{f.calificacion ?? "-"}</Celda>
              <Celda>{formatearTiempo(f.tiempoTotalSeg)}</Celda>
            </tr>
          ))}
        </TablaSimple>
      </Tarjeta>
    </>
  );
}
