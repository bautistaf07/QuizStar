"use client";

import { Celda, Mensaje, PageHeader, Seleccion, TablaSimple, Tarjeta, formatearTiempo } from "@/components/quizstar/ui";
import { useAuth } from "@/context/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import type { FilaRanking, Grupo, RespuestaRanking } from "@/lib/tipos";
import { useEffect, useState } from "react";

export default function RankingPagina() {
  const { usuario } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [filas, setFilas] = useState<FilaRanking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Grupo[]>("/grupos")
      .then((g) => {
        setGrupos(g);
        if (g.length > 0) setGrupoId(g[0].id);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar"));
  }, []);

  useEffect(() => {
    if (!grupoId) return;
    setError("");
    apiFetch<RespuestaRanking>(`/ranking/grupos/${grupoId}`)
      .then((r) => setFilas(r.ranking))
      .catch((e) => setError(e instanceof ApiError ? e.message : "No se pudo cargar el ranking"));
  }, [grupoId]);

  return (
    <>
      <PageHeader titulo="Ranking" subtitulo="Promedio de calificación y tiempo total por estudiante." />
      {error && <Mensaje tipo="error">{error}</Mensaje>}
      <Tarjeta>
        <div className="mb-4 max-w-sm">
          <Seleccion id="grupo" etiqueta="Grupo" value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </Seleccion>
        </div>
        <TablaSimple
          columnas={["Puesto", "Estudiante", "Promedio", "Tiempo total", "Quices"]}
          vacio="Todavía no hay quices finalizados en este grupo."
          hayFilas={filas.length > 0}
        >
          {filas.map((f) => (
            <tr key={f.estudianteId} className={f.estudianteId === usuario?.id ? "bg-brand-50 dark:bg-brand-500/10" : ""}>
              <Celda>{f.posicion}</Celda>
              <Celda>{f.nombre}</Celda>
              <Celda>{f.promedio}</Celda>
              <Celda>{formatearTiempo(f.tiempoTotalSeg)}</Celda>
              <Celda>{f.quices}</Celda>
            </tr>
          ))}
        </TablaSimple>
      </Tarjeta>
    </>
  );
}
